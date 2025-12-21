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

  const meeting = await prisma.meeting.findUnique({
    where: { id: params.id },
    select: { videoUrl: true, audioUrl: true },
  })

  if (!meeting) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    video_url: meeting.videoUrl,
    audio_url: meeting.audioUrl,
  })
}

