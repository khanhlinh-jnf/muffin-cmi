import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { processAudioWithVNPT } from "@/lib/smartvoice";
import { localDb } from "@/lib/local-db"; // Import localDb

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const meetingId = formData.get("meetingId") as string | null;

    if (!file || !meetingId) return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });

    // Lúc này file JSON cũ sẽ mất, API get transcript sẽ trả về [] (rỗng)
    localDb.deleteTranscript(meetingId);

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public/uploads/meetings");
    
    await mkdir(uploadDir, { recursive: true });
    const fullPath = path.join(uploadDir, filename);
    await writeFile(fullPath, buffer);

    // Chạy AI (Sau khi chạy xong nó sẽ tự tạo file JSON mới)
    // Không dùng await ở đây để trả về response ngay cho Frontend đỡ phải đợi
    processAudioWithVNPT(fullPath, meetingId).catch(err => console.error("AI Error:", err));

    return NextResponse.json({ success: true, url: `/uploads/meetings/${filename}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}