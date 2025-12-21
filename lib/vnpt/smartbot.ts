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

type SmartbotRequestBody = {
  bot_id: string;
  sender_id: string;
  text: string;
  input_channel: string;
  session_id: string;
  metadata: Record<string, unknown>;
  settings?: {
    system_prompt?: string;
    advance_prompt?: string;
  };
};

export async function smartbotConversation(
  payload: SmartbotPayload,
  sessionId = "cmisession",
) {
  const { question, systemPrompt, advancePrompt } = payload;

  const body: SmartbotRequestBody = {
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

  if (!res.ok) {
    return {
      raw: rawText,
      answer: `SmartBot HTTP ${res.status}: ${rawText}`,
    };
  }

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
        console.log("SmartBot card:", card);
        if (typeof card.text === "string") cardTexts.push(card.text);
        if (Array.isArray(card.elements)) {
          for (const el of card.elements) {
            if (typeof el.text === "string") cardTexts.push(el.text);
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

  return { raw: lastObject, answer };
}
