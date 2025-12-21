import { promises as fs } from "fs";
import path from "path";

export async function getFullTranscript(meetingId: string): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "data",
    "transcripts",
    "full",
    `${meetingId}.txt`,
  );

  console.log(">> getFullTranscript meetingId:", meetingId);
  console.log(">> trying transcript file:", filePath);

  try {
    const content = await fs.readFile(filePath, "utf8");
    return content.trim();
  } catch (e) {
    console.error("Cannot read transcript file:", filePath, e);
    return "";
  }
}
