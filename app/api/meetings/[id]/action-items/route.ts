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

  const items = await prisma.actionItem.findMany({
    where: { meetingId },
    orderBy: { createdAt: 'asc' },
    include: {
      assignee: true,
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
    items.map((ai) => ({
      id: ai.id,
      description: ai.description,
      status: ai.status,
      due_date: ai.dueDate,
      assignee_id: ai.assigneeId,
      assignee_name: ai.assignee?.fullName ?? null,
      source_chunk_id: ai.sourceChunkId,
      source_chunk: ai.sourceChunk
        ? {
            id: ai.sourceChunk.id,
            start_time: ai.sourceChunk.startTime,
            end_time: ai.sourceChunk.endTime,
          }
        : null,
    })),
  )
}
