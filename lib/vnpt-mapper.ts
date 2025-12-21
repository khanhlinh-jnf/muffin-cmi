import { prisma } from "@/lib/prisma";

// Giả lập cấu trúc trả về của VNPT (cần điều chỉnh khi có doc thật)
interface VNPTTranscriptItem {
  text: string;
  time_start: number; // VNPT thường trả về mili-giây (ms)
  time_end: number;
  speaker_label: string;
}

// Hàm 1: Map và Lưu Transcript
export async function saveTranscript(meetingId: string, vnptData: VNPTTranscriptItem[]) {
  const chunks = vnptData.map((item) => ({
    meetingId,
    speaker: `Speaker ${item.speaker_label}`,
    text: item.text,
    startTime: item.time_start / 1000, // Đổi ms -> giây (Float)
    endTime: item.time_end / 1000,
  }));

  // Dùng createMany để insert nhanh hàng loạt
  await prisma.transcriptChunk.createMany({
    data: chunks,
  });
}

// Hàm 2: Tạo Chapter giả lập (Static Logic cho MVP)
// Vì chờ AI (KL - Role #5) làm summary lâu, bạn viết hàm này để tự cắt chapter mỗi 5 phút
export async function generateAutoChapters(meetingId: string, durationSeconds: number) {
  const chapters = [];
  const step = 300; // 5 phút = 300s

  for (let t = 0; t < durationSeconds; t += step) {
    chapters.push({
      meetingId,
      title: `Chapter ${(t / step) + 1}: Đoạn ${formatTime(t)}`,
      startTime: t,
      endTime: Math.min(t + step, durationSeconds),
      summary: "Nội dung tự động được tạo...",
    });
  }

  await prisma.chapter.createMany({ data: chapters });
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  return `${m}m`;
}