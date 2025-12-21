import { prisma } from "@/lib/db";
import { smartbotSummarizeTranscript } from "@/lib/vnpt/smartbot";

/**
 * Job xử lý meeting sau khi đã có transcript:
 * - Lấy transcript từ TranscriptChunk
 * - Gọi SmartBot sinh summary
 * - Lưu vào Meeting.summary
 */
export async function processMeeting(meetingId: string) {
  // 1. Lấy toàn bộ transcript của meeting
  const chunks = await prisma.transcriptChunk.findMany({
    where: { meetingId },
    orderBy: { startTime: "asc" },
  });

  if (!chunks.length) {
    console.warn("processMeeting:", meetingId, "chưa có transcript.");
    return;
  }

  const transcriptText = chunks.map((c) => c.text).join("\n");

  // 2. Gọi SmartBot sinh summary + decisions + action items (gộp 1 text)
  const { answer } = await smartbotSummarizeTranscript(transcriptText);

  // 3. Lưu summary raw vào Meeting.summary
  await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      summary: answer,
      status: "ready", // nếu bạn có enum MeetingStatus
    },
  });

  console.log("processMeeting: done for", meetingId);
}
