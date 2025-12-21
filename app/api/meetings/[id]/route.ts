import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = req.cookies.get('token')?.value

  const meeting = await prisma.meeting.findUnique({
    where: { id: params.id },
    include: {
      owner: true,
      participants: true,
    },
  })

  if (!meeting) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: meeting.id,
    title: meeting.title,
    description: meeting.description,
    status: meeting.status,
    summary_short: meeting.summary, // hoặc cắt ngắn phía FE
    owner: {
      id: meeting.owner.id,
      full_name: meeting.owner.fullName,
    },
    participants_count: meeting.participants.length,
    scheduled_at: meeting.scheduledAt,
    created_at: meeting.createdAt,
  })
}

