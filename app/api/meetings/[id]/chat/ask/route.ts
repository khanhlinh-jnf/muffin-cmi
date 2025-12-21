ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { searchSimilarChunks } from '@/lib/rag/vector-store'
import { askSmartBot } from '@/lib/vnpt/smartbot'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { question, from, to } = await req.json()

  if (!question) {
    return NextResponse.json({ message: 'question is required' }, { status: 400 })
  }

  // Optional: giới hạn meetings theo thời gian
  // Lấy list meetingId phù hợp
  let meetingIds: string[] | undefined = undefined
  if (from || to) {
    const where: any = {}
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }
    const meetings = await prisma.meeting.findMany({
      where,
      select: { id: true },
    })
    meetingIds = meetings.map((m) => m.id)
  }

  // searchSimilarChunks không filter theo list meetingIds ở code trên;
  // MVP: bỏ filter theo time, chỉ search toàn bộ, sau có thời gian thì optimize.
  const contexts = await searchSimilarChunks(question, {
    limit: 8,
  })

  const contextText = contexts
    .map(
      (c, idx) =>
        `[#${idx + 1} meeting=${c.meetingId} ${c.startTime.toFixed(
          1,
        )}–${c.endTime.toFixed(1)}]: ${c.text}`,
    )
    .join('\n')

  const prompt = `
Bạn là trợ lý Q&A trên nhiều cuộc họp.

Context từ nhiều meeting:
${contextText}

Câu hỏi: ${question}

- Trả lời dựa trên context.
- Nếu câu trả lời liên quan tới meeting cụ thể, nêu rõ meeting_id trong câu trả lời.
  `.trim()

  let answer = ''
  try {
    answer = await askSmartBot(prompt)
  } catch (e) {
    console.error('SmartBot ask error', e)
    return NextResponse.json({ message: 'LLM error' }, { status: 500 })
  }

  const qaLog = await prisma.qaLog.create({
    data: {
      meetingId: null, // cross-meeting
      userId: user.id,
      question,
      answer,
    },
  })

  await prisma.qaSource.createMany({
    data: contexts.map((c) => ({
      qaLogId: qaLog.id,
      meetingId: c.meetingId,
      chunkId: c.chunkId,
      timestampStart: c.startTime,
      timestampEnd: c.endTime,
      snippet: c.text.slice(0, 500),
    })),
  })

  return NextResponse.json({
    answer,
    sources: contexts.map((c) => ({
      meeting_id: c.meetingId,
      chunk_id: c.chunkId,
      timestamp_start: c.startTime,
      timestamp_end: c.endTime,
      snippet: c.text,
    })),
  })
}

