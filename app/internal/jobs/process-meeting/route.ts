import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { embedText } from '@/lib/rag/embeddings'
import { askSmartBot } from '@/lib/vnpt/smartbot'

export async function POST(req: NextRequest) {
  const { meeting_id } = await req.json()
  if (!meeting_id) {
    return NextResponse.json({ message: 'meeting_id required' }, { status: 400 })
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id: meeting_id },
  })
  if (!meeting) {
    return NextResponse.json({ message: 'Meeting not found' }, { status: 404 })
  }

  // 1. Lấy transcript chunks
  const chunks = await prisma.transcriptChunk.findMany({
    where: { meetingId: meeting_id },
    orderBy: { startTime: 'asc' },
  })

  if (!chunks.length) {
    // chưa có transcript (STT job chưa chạy) → mark failed hoặc giữ processing
    return NextResponse.json({ message: 'No transcript yet' }, { status: 202 })
  }

  // 2. Gọi SmartBot để tạo summary / actions / decisions (simple prompt)
  const fullTranscript = chunks.map((c) => `[${c.speakerLabel}] ${c.text}`).join('\n')

  const prompt = `
Bạn là trợ lý tóm tắt cuộc họp.

Transcript:
${fullTranscript}

1) Viết tóm tắt ngắn 3–5 câu.
2) Liệt kê Action Items dạng JSON với các fields: description, assignee (text), due_date (ISO hoặc null), source_chunk_index.
3) Liệt kê Decisions dạng JSON với các fields: description, source_chunk_index.
Trả về đúng định dạng JSON với keys: summary, action_items, decisions.
  `.trim()

  let summary = ''
  let actionItems: any[] = []
  let decisions: any[] = []

  try {
    const raw = await askSmartBot(prompt)
    const parsed = JSON.parse(raw)
    summary = parsed.summary ?? ''
    actionItems = parsed.action_items ?? []
    decisions = parsed.decisions ?? []
  } catch (e) {
    console.error('SmartBot summary parse error', e)
  }

  // 3. Lưu summary + action items + decisions (phối hợp với model của người 4)
  await prisma.$transaction(async (tx) => {
    await tx.meeting.update({
      where: { id: meeting_id },
      data: { summary },
    })

    for (const [idx, item] of actionItems.entries()) {
      const chunk = chunks[item.source_chunk_index ?? idx] // fallback
      await tx.actionItem.create({
        data: {
          meetingId: meeting_id,
          description: item.description,
          status: 'todo',
          sourceChunkId: chunk?.id,
          // assignee, due_date có thể null ở đây; PĐinh update sau
        },
      })
    }

    for (const [idx, d] of decisions.entries()) {
      const chunk = chunks[d.source_chunk_index ?? idx]
      await tx.decision.create({
        data: {
          meetingId: meeting_id,
          description: d.description,
          sourceChunkId: chunk?.id,
        },
      })
    }
  })

  // 4. Tạo embeddings cho transcript chunks
  await prisma.$transaction(async (tx) => {
    // clear cũ nếu re-process
    await tx.transcriptEmbedding.deleteMany({ where: { meetingId: meeting_id } })

    for (const chunk of chunks) {
      const vec = embedText(chunk.text)
      await tx.transcriptEmbedding.create({
        data: {
          meetingId: meeting_id,
          chunkId: chunk.id,
          vector: JSON.stringify(vec),
        },
      })
    }
  })

  // 5. Cập nhật status
  await prisma.meeting.update({
    where: { id: meeting_id },
    data: { status: 'ready' },
  })

  return NextResponse.json({ status: 'ok' })
}
