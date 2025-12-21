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

  const chapters = await prisma.chapter.findMany({
    where: { meetingId },
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      orderIndex: true,
      startTime: true,
      endTime: true,
      title: true,
    },
  })

  return NextResponse.json(
    chapters.map((ch) => ({
      id: ch.id,
      order_index: ch.orderIndex,
      start_time: ch.startTime,
      end_time: ch.endTime,
      title: ch.title,
    })),
  )
}
