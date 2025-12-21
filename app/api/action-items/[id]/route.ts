import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = req.cookies.get('token')?.value
  const currentUser = await getUserFromToken(token)
  if (!currentUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const actionItemId = params.id
  const body = await req.json()

  const { assignee_id, due_date, status } = body as {
    assignee_id?: string | null
    due_date?: string | null
    status?: 'todo' | 'in_progress' | 'done'
  }

  // 1. Lấy action item + meeting.owner để check quyền
  const ai = await prisma.actionItem.findUnique({
    where: { id: actionItemId },
    include: { meeting: { select: { ownerId: true } } },
  })

  if (!ai) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  const isHost = ai.meeting.ownerId === currentUser.id
  const isAssignee = ai.assigneeId === currentUser.id

  if (!isHost && !isAssignee) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  // 2. Chuẩn bị data update (chỉ update field được gửi lên)
  const data: any = {}
  if (assignee_id !== undefined) data.assigneeId = assignee_id
  if (due_date !== undefined) data.dueDate = due_date ? new Date(due_date) : null
  if (status !== undefined) data.status = status

  const updated = await prisma.actionItem.update({
    where: { id: actionItemId },
    data,
    include: {
      assignee: true,
    },
  })

  return NextResponse.json({
    id: updated.id,
    description: updated.description,
    status: updated.status,
    due_date: updated.dueDate,
    assignee_id: updated.assigneeId,
    assignee_name: updated.assignee?.fullName ?? null,
  })
}

