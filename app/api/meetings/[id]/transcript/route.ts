import { NextResponse } from "next/server";
import { localDb } from "@/lib/local-db";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Đọc dữ liệu từ file riêng (data/transcripts/raw/{id}.json)
    const rawData = localDb.getTranscripts(id);

    // 2. Chuyển đổi dữ liệu cho Frontend (Mapping)
    const formattedData = rawData.map((item: any, index: number) => ({
      // Tạo ID nếu chưa có
      id: item.id || 'line-${index}',
      
      start_time: item.startTime / 1000, 
      end_time: item.endTime / 1000,
      
      text: item.text,
      speaker_label: item.speakerLabel || "Speaker",
    }));

    // 3. Trả về và cấm cache (để cập nhật ngay khi file json thay đổi)
    return NextResponse.json(formattedData, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });

  } catch (error) {
    console.error("❌ Lỗi API Transcript:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}