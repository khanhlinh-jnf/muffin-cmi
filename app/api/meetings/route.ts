import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { saveMeetingFile } from '@/lib/upload'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const user = await getUserFromToken(token)

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()

  const title = String(formData.get('title') || '')
  const description = formData.get('description') as string | null
  const scheduledAtRaw = formData.get('scheduled_at') as string | null
  const file = formData.get('file') as File | null

  if (!title || !file) {
    return NextResponse.json(
      { message: 'title and file are required' },
      { status: 400 },
    )
  }

  const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : null

  // 1. Tạo meeting record trước (status = processing)
  const meeting = await prisma.meeting.create({
    data: {
      title,
      description,
      ownerId: user.id,
      scheduledAt,
      status: 'processing',
    },
  })

  // 2. Lưu file vào disk
  const { publicUrl } = await saveMeetingFile(file, meeting.id)

  // 3. Cập nhật videoUrl
  const updatedMeeting = await prisma.meeting.update({
    where: { id: meeting.id },
    data: {
      videoUrl: publicUrl,
    },
  })

  // 4. Gọi job nội bộ (không cần chờ) – trigger SmartVoice STT
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/internal/jobs/process-meeting`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ meeting_id: meeting.id }),
  }).catch((err) => {
    console.error('Failed to trigger process-meeting job', err)
  })

  return NextResponse.json(
    {
      id: updatedMeeting.id,
      status: updatedMeeting.status,
      video_url: updatedMeeting.videoUrl,
    },
    { status: 201 },
  )
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') // processing | ready | failed
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const q = searchParams.get('q')

  const where: any = {
    ownerId: user.id, // hoặc cho admin xem tất cả
  }

  if (status) where.status = status

  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  const meetings = await prisma.meeting.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      scheduledAt: true,
      owner: {
        select: { fullName: true },
      },
    },
  })

  return NextResponse.json(
    meetings.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      status: m.status,
      created_at: m.createdAt,
      scheduled_at: m.scheduledAt,
      owner_name: m.owner.fullName,
    })),
  )
}

