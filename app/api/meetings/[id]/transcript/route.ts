import { NextResponse } from "next/server";
import { localDb } from "@/lib/local-db";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawData = localDb.getTranscripts(id);

    const formattedData = rawData.map((item: any, index: number) => ({
      id: item.id || `line-${index}`,
      
      // 👇 SỬA Ở ĐÂY: CHIA CHO 1000
      start_time: item.startTime / 1000, 
      end_time: item.endTime / 1000,
      
      text: item.text,
      speaker_label: item.speakerLabel || "Speaker",
    }));

    return NextResponse.json(formattedData, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}