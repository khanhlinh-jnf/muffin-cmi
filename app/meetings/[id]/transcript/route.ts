import { NextResponse } from "next/server";
// 👇 Import DB mới
import { localDb } from "@/lib/local-db";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 👇 Đọc từ file JSON thay vì prisma.findMany
    const transcripts = localDb.getTranscripts(id);

    // Dữ liệu trong file JSON đã đúng format rồi, trả về luôn
    return NextResponse.json(transcripts);

  } catch (error) {
    console.error("❌ Lỗi lấy transcript:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}