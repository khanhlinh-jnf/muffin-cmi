import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') as
    | 'todo'
    | 'in_progress'
    | 'done'
    | null

  const where: any = {
    assigneeId: user.id,
  }
  if (status) where.status = status

  const items = await prisma.actionItem.findMany({
    where,
    orderBy: { dueDate: 'asc' },
    include: {
      meeting: {
        select: {
          id: true,
          title: true,
          scheduledAt: true,
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
      meeting_id: ai.meetingId,
      meeting_title: ai.meeting.title,
      meeting_scheduled_at: ai.meeting.scheduledAt,
    })),
  )
}

