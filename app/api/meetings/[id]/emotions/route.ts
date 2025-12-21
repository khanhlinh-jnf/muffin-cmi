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

  const points = await prisma.emotionPoint.findMany({
    where: { meetingId },
    orderBy: { timeSec: 'asc' },
    select: {
      timeSec: true,
      score: true,
      label: true,
    },
  })

  return NextResponse.json(
    points.map((p) => ({
      time: p.timeSec,
      emotion_score: p.score,
      emotion_label: p.label,
    })),
  )
}
