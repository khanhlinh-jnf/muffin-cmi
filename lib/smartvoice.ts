import fs from "fs";
import { Blob } from "buffer";
import crypto from "crypto";
import { localDb } from "@/lib/local-db";

// Helper parse thời gian
function parseTime(timeVal: string | number | undefined): number {
  if (typeof timeVal === "number") return timeVal;
  if (typeof timeVal === "string") return parseFloat(timeVal.replace("s", ""));
  return 0;
}

export async function processAudioWithVNPT(filePath: string, meetingId: string) {
  // Cấu hình API
  const API_URL = process.env.VNPT_STT_API_URL || "https://api.idg.vnpt.vn/stt-service/v1/grpc/standard";
  const ACCESS_TOKEN = process.env.VNPT_ACCESS_TOKEN;
  const TOKEN_ID = process.env.VNPT_TOKEN_ID;
  const TOKEN_KEY = process.env.VNPT_TOKEN_KEY;

  if (!ACCESS_TOKEN) throw new Error("Thiếu VNPT_ACCESS_TOKEN trong .env");

  console.log(`[SmartVoice] Đang xử lý file: ${filePath}`);

  // Đọc file và chuẩn bị gửi
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]) as any;
  const formData = new FormData();
  formData.append("audioFile", blob, "audio.mp3");
  formData.append("clientSession", crypto.randomUUID());
  formData.append("enableWordTimeOffsets", "true"); // Quan trọng để lấy thời gian
  formData.append("model", "offline");
  
  // Gọi API VNPT
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Token-id": TOKEN_ID || "",
      "Token-key": TOKEN_KEY || "",
    },
    body: formData,
  });

  if (!res.ok) throw new Error(`VNPT Error: ${await res.text()}`);

  const data = await res.json();
  const results = data.results || (data.object ? data.object.results : []);

  // Xử lý kết quả trả về
  let finalChunks = [];
  
  if (results && results.length > 0) {
    for (const result of results) {
      const alt = result.alternatives?.[0];
      if (!alt) continue;

      // --- THUẬT TOÁN CẮT NHỎ CÂU (CHUNK) ---
      if (alt.words && alt.words.length > 0) {
        let currentSentence = "";
        // Thời gian bắt đầu của câu hiện tại
        let sentenceStartTime = parseTime(alt.words[0].startTime);
        
        for (let i = 0; i < alt.words.length; i++) {
          const w = alt.words[i];
          const wordText = w.word;
          
          currentSentence += wordText + " ";

          // Logic ngắt câu để hiển thị đẹp trên UI:
          // 1. Gặp dấu câu (. , ? !)
          // 2. Hoặc câu đã dài > 12 từ (để không bị tràn màn hình video)
          // 3. Hoặc là từ cuối cùng của đoạn
          const hasPunctuation = /[.,?!]$/.test(wordText);
          const isTooLong = currentSentence.split(" ").length >= 12;
          const isLastWord = i === alt.words.length - 1;

          if (hasPunctuation || isTooLong || isLastWord) {
            finalChunks.push({
              id: crypto.randomUUID(),
              meetingId: meetingId,
              text: currentSentence.trim(),
              // Thời gian bắt đầu câu
              startTime: sentenceStartTime, 
              // Thời gian kết thúc câu (là thời gian kết thúc của từ hiện tại)
              endTime: parseTime(w.endTime), 
              speakerLabel: "Speaker",
            });

            // Reset cho câu tiếp theo
            currentSentence = "";
            // Nếu chưa phải từ cuối cùng, cập nhật thời gian bắt đầu câu mới là từ kế tiếp
            if (!isLastWord && alt.words[i + 1]) {
              sentenceStartTime = parseTime(alt.words[i + 1].startTime);
            }
          }
        }
      } 
      // Fallback: Nếu API không trả về words, đành lấy cả cục transcript
      else if (alt.transcript) {
         finalChunks.push({
            id: crypto.randomUUID(),
            text: alt.transcript,
            startTime: 0,
            endTime: 0,
            speakerLabel: "Speaker"
         });
      }
    }
  }

  // Lưu vào JSON
  if (finalChunks.length > 0) {
    localDb.saveTranscripts(meetingId, finalChunks);
  }
}