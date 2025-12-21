import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = req.cookies.get('token')?.value
  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const meetingId = params.id

  const logs = await prisma.qaLog.findMany({
    where: { meetingId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      user: { select: { fullName: true } },
      sources: true,
    },
  })

  return NextResponse.json(
    logs.map((log) => ({
      id: log.id,
      question: log.question,
      answer: log.answer,
      asked_by: log.user.fullName,
      created_at: log.createdAt,
      sources: log.sources.map((s) => ({
        meeting_id: s.meetingId,
        chunk_id: s.chunkId,
        timestamp_start: s.timestampStart,
        timestamp_end: s.timestampEnd,
        snippet: s.snippet,
      })),
    })),
  )
}
