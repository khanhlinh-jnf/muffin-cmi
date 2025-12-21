import { smartbotConversation } from "@/lib/vnpt/smartbot";

async function main() {
  const { answer, raw } = await smartbotConversation("Xin chào, giới thiệu về chương trình Hackathon.");
  console.log("ANSWER:\n", answer);
  console.log(JSON.stringify(raw, null, 2));
}

main().catch(console.error);
