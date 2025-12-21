import { NextRequest, NextResponse } from "next/server";
import { smartbotConversation } from "@/lib/vnpt/smartbot";
import { getFullTranscript } from "@/lib/transcript";
import { join } from "path";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Lấy meetingId từ route params (Next 15: params là Promise)
    const { id } = await context.params;

    console.log("==== /api/meetings/[id]/ask ====");
    console.log("API /ask meetingId:", id);

    const body = await req.json();
    const question: string = body.question ?? "";
    const scope: "single" | "multiple" = body.scope ?? "single";
    console.log("Question:", question);
    console.log("Scope:", scope);

    if (!id) {
      console.log("Missing meeting id");
      return NextResponse.json(
        { error: "Missing meeting id" },
        { status: 400 },
      );
    }

    if (!question.trim()) {
      console.log("Missing question");
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 },
      );
    }

    // 1) Đọc toàn bộ transcript full cho meeting này
    const transcript = await getFullTranscript(id);
    const transcriptPath = join(
      process.cwd(),
      "data",
      "transcripts",
      "full",
      `${id}.txt`,
    );
    console.log(">> getFullTranscript meetingId:", id);
    console.log(">> trying transcript file:", transcriptPath);
    console.log("Transcript length:", transcript.length);

    if (!transcript) {
      console.log("Transcript empty -> 404");
      return NextResponse.json(
        { error: "Transcript not found for this meeting" },
        { status: 404 },
      );
    }

    // 2) Build prompt context cho SmartBot
    const contextPrompt = `
Bạn là trợ lý AI chỉ được phép sử dụng thông tin trong transcript sau để trả lời câu hỏi về cuộc họp.

TRANSCRIPT BẮT ĐẦU
"""
${transcript}
"""
TRANSCRIPT KẾT THÚC

YÊU CẦU TRẢ LỜI:
- Chỉ dựa trên transcript trên, không tự bịa thêm thông tin.
- Nếu transcript KHÔNG chứa đủ thông tin để trả lời câu hỏi, phải trả lời đúng câu:
  "Trong transcript không có thông tin để trả lời câu hỏi này."
- Trả lời ngắn gọn, rõ ràng, bằng tiếng Việt.
`;

    // 3) Gửi sang SmartBot: context + câu hỏi
    const fullQuestion = `
${contextPrompt}

CÂU HỎI:
${question}

CÂU TRẢ LỜI:
`;

    console.log("===== FULL QUESTION SENT TO SMARTBOT =====");
    console.log(fullQuestion);
    console.log("==========================================");

    const result = await smartbotConversation(
      fullQuestion,
      `meeting-${id}`,
    );

    console.log("SmartBot answer raw:", result.raw);

    // 4) Chưa có sources (vì đang dùng full text), để mảng rỗng
    return NextResponse.json({
      answer: result.answer,
      sources: [],
    });
  } catch (error) {
    console.error("ask with full transcript error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
