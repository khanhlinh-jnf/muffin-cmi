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

  const decisions = await prisma.decision.findMany({
    where: { meetingId },
    orderBy: { createdAt: 'asc' },
    include: {
      sourceChunk: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  })

  return NextResponse.json(
    decisions.map((d) => ({
      id: d.id,
      description: d.description,
      source_chunk_id: d.sourceChunkId,
      timestamp_start: d.sourceChunk?.startTime ?? null,
      timestamp_end: d.sourceChunk?.endTime ?? null,
    })),
  )
}
