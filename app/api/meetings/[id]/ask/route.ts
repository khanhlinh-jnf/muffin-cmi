import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { searchSimilarChunks } from '@/lib/rag/vector-store'
import { askSmartBot } from '@/lib/vnpt/smartbot'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = req.cookies.get('token')?.value
  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { question } = await req.json()
  const meetingId = params.id

  if (!question) {
    return NextResponse.json({ message: 'question is required' }, { status: 400 })
  }

  // 1. Tìm context từ embeddings
  const contexts = await searchSimilarChunks(question, {
    meetingId,
    limit: 5,
  })

  const contextText = contexts
    .map(
      (c, idx) =>
        `[#${idx + 1} ${c.startTime.toFixed(1)}–${c.endTime.toFixed(
          1,
        )}]: ${c.text}`,
    )
    .join('\n')

  // 2. Prompt cho SmartBot
  const prompt = `
Bạn là trợ lý trả lời câu hỏi dựa trên nội dung cuộc họp.

Context (trích transcript, có thể không đầy đủ):
${contextText}

Câu hỏi: ${question}

- Trả lời ngắn gọn, dựa vào context, nếu không đủ thông tin thì nói rõ.
- Không bịa thêm chi tiết không có trong context.
  `.trim()

  let answer = ''
  try {
    answer = await askSmartBot(prompt)
  } catch (e) {
    console.error('SmartBot ask error', e)
    return NextResponse.json(
      { message: 'LLM error, try again later' },
      { status: 500 },
    )
  }

  // 3. Lưu QaLog + QaSource
  const qaLog = await prisma.qaLog.create({
    data: {
      meetingId,
      userId: user.id,
      question,
      answer,
    },
  })

  if (contexts.length) {
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
  }

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
