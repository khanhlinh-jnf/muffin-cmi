import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { vnFaceVerify } from '@/lib/vnface'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const meetingId = params.id
  const token = req.cookies.get('token')?.value
  const caller = await getUserFromToken(token)

  if (!caller) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { imageBase64, deviceId } = await req.json()

  if (!imageBase64) {
    return NextResponse.json({ message: 'imageBase64 is required' }, { status: 400 })
  }

  // 1. Gửi ảnh sang vnFace
  const result = await vnFaceVerify(imageBase64)

  if (!result.success) {
    return NextResponse.json({ status: 'unknown' }, { status: 200 })
  }

  // 2. Tìm user tương ứng trong DB
  const faceProfile = await prisma.faceProfile.findFirst({
    where: {
      provider: 'vnFace',
      externalId: result.userExternalId,
    },
    include: { user: true },
  })

  if (!faceProfile) {
    return NextResponse.json({ status: 'unknown' }, { status: 200 })
  }

  const user = faceProfile.user

  // 3. Tạo / update participant record
  const participant = await prisma.meetingParticipant.upsert({
    where: {
      // unique bằng (meetingId, userId) thì cần unique index trong schema
      // tạm dùng id random nếu chưa có unique
      id: `${meetingId}-${user.id}`,
    },
    update: {
      checkinTime: new Date(),
      source: 'vnFace',
    },
    create: {
      id: `${meetingId}-${user.id}`,
      meetingId,
      userId: user.id,
      displayName: user.fullName,
      roleInMeeting: 'participant',
      checkinTime: new Date(),
      source: 'vnFace',
    },
  })

  return NextResponse.json({
    status: 'checked_in',
    user: {
      id: user.id,
      full_name: user.fullName,
      email: user.email,
    },
    score: result.score,
    deviceId,
    participantId: participant.id,
  })
}
