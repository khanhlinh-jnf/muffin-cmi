const SMARTBOT_URL = "https://assistant-stream.vnpt.vn/v1/conversation";

const BOT_ID = process.env.SMARTBOT_BOT_ID!;
const ACCESS_TOKEN = process.env.SMARTBOT_ACCESS_TOKEN!;
const TOKEN_ID = process.env.SMARTBOT_TOKEN_ID!;
const TOKEN_KEY = process.env.SMARTBOT_TOKEN_KEY!;

export async function smartbotConversation(
  question: string,
  sessionId = "cmisession",
) {
  const body = {
    bot_id: BOT_ID,
    sender_id: "123",
    text: question,
    input_channel: "livechat",
    session_id: sessionId,
    metadata: {},
  };

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
  console.log("SmartBot raw:", rawText.substring(0, 200));

  if (!res.ok) {
    return {
      raw: rawText,
      answer: `SmartBot HTTP ${res.status}: ${rawText}`,
    };
  }

  // Parse SSE: nhiều dòng "data:{...}"
  const chunks = rawText
    .split("\n")
    .filter((line) => line.trim().startsWith("data:"))
    .map((line) => line.trim().slice(5).trim())
    .filter(Boolean);

  const cardTexts: string[] = [];
  let lastObject: Record<string, unknown> | null = null;

  for (const jsonStr of chunks) {
    try {
      const obj = JSON.parse(jsonStr);
      lastObject = obj;

      const cardData = obj.object?.sb?.card_data ?? [];
      for (const card of cardData) {
        if (card.text) cardTexts.push(card.text);
      }
    } catch (e) {
      console.error("Parse chunk error");
    }
  }

  return {
    raw: lastObject,
    answer: cardTexts.filter(Boolean).join("\n\n") || "Không có câu trả lời",
  };
}
