import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'meetings')

export async function saveMeetingFile(file: File, meetingId: string) {
  await fs.promises.mkdir(UPLOAD_DIR, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || 'mp4'
  const fileName = `${meetingId}.${ext}`
  const filePath = path.join(UPLOAD_DIR, fileName)

  await fs.promises.writeFile(filePath, buffer)

  // Đường dẫn public để FE dùng
  const publicUrl = `/uploads/meetings/${fileName}`
  return { filePath, publicUrl }
}

