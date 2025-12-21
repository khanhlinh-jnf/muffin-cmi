// app/api/meetings/[id]/ask/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Đọc transcript từ file local (giống log bạn gửi)
async function getFullTranscript(meetingId: string) {
  const baseDir = "D:\\UNI_STUDY\\Year3\\Semester1\\VNPT-AI\\muffin-cmi";
  const transcriptPath = path.join(
    baseDir,
    "data",
    "transcripts",
    "full",
    `${meetingId}.txt`,
  );

  console.log("Transcript path:", transcriptPath);
  try {
    const content = await fs.readFile(transcriptPath, "utf8");
    console.log("Transcript length:", content.length);
    return content;
  } catch (e) {
    console.error("Read transcript error:", e);
    return "";
  }
}

// Gọi SmartBot streaming
const SMARTBOT_URL = "https://assistant-stream.vnpt.vn/v1/conversation";

const BOT_ID = process.env.SMARTBOT_BOT_ID!;
const ACCESS_TOKEN = process.env.SMARTBOT_ACCESS_TOKEN!;
const TOKEN_ID = process.env.SMARTBOT_TOKEN_ID!;
const TOKEN_KEY = process.env.SMARTBOT_TOKEN_KEY!;

type SmartbotPayload = {
  question: string;
  systemPrompt?: string;
  advancePrompt?: string;
};

async function smartbotConversation(
  payload: SmartbotPayload,
  sessionId: string,
) {
  const { question, systemPrompt, advancePrompt } = payload;

  const body: Record<string, unknown> = {
    bot_id: BOT_ID,
    sender_id: "123",
    text: question,
    input_channel: "livechat",
    session_id: sessionId,
    metadata: {},
  };

  if (systemPrompt || advancePrompt) {
    body.settings = {
      ...(systemPrompt ? { system_prompt: systemPrompt } : {}),
      ...(advancePrompt ? { advance_prompt: advancePrompt } : {}),
    };
  }

  const res = await fetch(SMARTBOT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Token-id": TOKEN_ID,
      "Token-key": TOKEN_KEY,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
  });

  const rawText = await res.text();
  console.log("SmartBot raw text:", rawText.substring(0, 500));

  const chunks = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);

  const cardTexts: string[] = [];
  let lastObject: Record<string, unknown> | null = null;

  for (const jsonStr of chunks) {
    try {
      const obj = JSON.parse(jsonStr);
      lastObject = obj;

      const cardData = obj.object?.sb?.card_data ?? [];
      for (const card of cardData) {
        if (typeof card.text === "string") {
          cardTexts.push(card.text);
        }
        if (Array.isArray(card.elements)) {
          for (const el of card.elements) {
            if (typeof el.text === "string") {
              cardTexts.push(el.text);
            }
          }
        }
      }
    } catch (e) {
      console.error("Parse chunk error:", jsonStr);
    }
  }

  const answer =
    cardTexts
      .map((t) => t.trim())
      .filter(Boolean)
      .join("\n\n") || "(empty answer)";

  console.log("SmartBot collected texts:", cardTexts);
  console.log("SmartBot final answer:", answer);

  if (!res.ok) {
    return {
      answer: `SmartBot HTTP ${res.status}: ${answer}`,
      raw: lastObject ?? rawText,
    };
  }

  return { answer, raw: lastObject };
}

// Next.js Route handler
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id;
  const { question } = await req.json();

  console.log(">> getFullTranscript meetingId:", id);
  const transcript = await getFullTranscript(id);

  const systemPrompt = `
Bạn là trợ lý AI trả lời câu hỏi về nội dung cuộc họp dựa trên context được truyền từ hệ thống.
Chỉ dùng thông tin trong context, không bịa thêm.
  `.trim();

  const advancePrompt = `
CONTEXT (TRANSCRIPT CUỘC HỌP):
"""
${transcript}
"""

CÂU HỎI:
${question}

YÊU CẦU:
- Trả lời ngắn gọn, rõ ràng, bằng tiếng Việt.
- Nếu context không đủ thông tin, trả lời: "Trong transcript không có thông tin để trả lời câu hỏi này."
  `.trim();

  const result = await smartbotConversation(
    {
      question,
      systemPrompt,
      advancePrompt,
    },
    `meeting-${id}`,
  );

  return NextResponse.json({
    answer: result.answer,
    sources: [], // có thể bổ sung sau nếu làm RAG nhiều chunk
  });
}
