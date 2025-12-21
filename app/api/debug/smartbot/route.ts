import { NextResponse } from "next/server";
import { smartbotConversation } from "@/lib/vnpt/smartbot";

export async function GET() {
  try {
    const { answer, raw } = await smartbotConversation(
      "Xin chào, giới thiệu về chương trình Hackathon."
    );

    return NextResponse.json({ ok: true, answer, raw });
  } catch (err) {
    console.error("SmartBot debug error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
