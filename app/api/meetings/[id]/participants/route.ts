import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const meetingId = params.id
  const token = req.cookies.get('token')?.value
  const user = await getUserFromToken(token)

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const participants = await prisma.meetingParticipant.findMany({
    where: { meetingId },
    include: { user: true },
    orderBy: { checkinTime: 'asc' },
  })

  return NextResponse.json(
    participants.map((p) => ({
      id: p.id,
      displayName: p.displayName,
      roleInMeeting: p.roleInMeeting,
      checkinTime: p.checkinTime,
      source: p.source,
      user: p.user
        ? {
            id: p.user.id,
            full_name: p.user.fullName,
            email: p.user.email,
          }
        : null,
    })),
  )
}

