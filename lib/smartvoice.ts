import fs from "fs";
import { localDb } from "@/lib/local-db";
import { Blob } from "buffer";
import crypto from "crypto";

// Khởi tạo Prisma (hoặc import từ @/lib/db nếu bạn đã có file riêng)

// Hàm helper để chuyển đổi thời gian (ví dụ "1.500s" -> 1.5)
function parseTime(timeVal: string | number | undefined): number {
  if (typeof timeVal === "number") return timeVal;
  if (typeof timeVal === "string") {
    // Loại bỏ chữ 's' ở cuối nếu có và chuyển sang số thực
    return parseFloat(timeVal.replace("s", ""));
  }
  return 0;
}

export async function processAudioWithVNPT(filePath: string, meetingId: string) {
  // 1. Lấy thông tin cấu hình từ biến môi trường
  const API_URL = process.env.VNPT_STT_API_URL || "https://api.idg.vnpt.vn/stt-service/v1/grpc/standard";
  const ACCESS_TOKEN = process.env.VNPT_ACCESS_TOKEN;
  const TOKEN_ID = process.env.VNPT_TOKEN_ID;
  const TOKEN_KEY = process.env.VNPT_TOKEN_KEY;

  if (!ACCESS_TOKEN || !TOKEN_ID || !TOKEN_KEY) {
    console.error("❌ [SmartVoice] Thiếu API Key trong file .env");
    throw new Error("Missing VNPT Credentials");
  }

  try {
    console.log(`🚀 [SmartVoice] Đang bắt đầu xử lý file: ${filePath}`);

    // 2. Đọc file từ ổ cứng
    if (!fs.existsSync(filePath)) {
      throw new Error(`File không tồn tại: ${filePath}`);
    }
    const fileBuffer = fs.readFileSync(filePath);
    
    // Hack: Ép kiểu để Node.js FormData nhận Buffer như Blob
    const blob = new Blob([fileBuffer]) as any;

    // 3. Tạo FormData gửi đi
    const formData = new FormData();
    formData.append("audioFile", blob, "audio.mp3");
    formData.append("clientSession", crypto.randomUUID()); // Bắt buộc: ID phiên duy nhất
    
    // --- QUAN TRỌNG NHẤT CHO KARAOKE ---
    formData.append("enableWordTimeOffsets", "true"); // Để lấy thời gian từng từ
    formData.append("enableAutomaticPunctuation", "true"); // Tự động thêm dấu chấm phẩy
    formData.append("model", "offline");
    
    // Cấu hình xử lý định dạng MP3/Video
    const configMap = { 
        convert_format: "mp3",
        capt_punch_recovery: "1" // Viết hoa đầu câu
    };
    formData.append("customConfiguration", JSON.stringify(configMap));

    // 4. Gọi API VNPT
    console.log("📡 Đang gửi request sang VNPT...");
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Token-id": TOKEN_ID,
        "Token-key": TOKEN_KEY,
        // Lưu ý: Không set Content-Type, để fetch tự động set boundary
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`VNPT API Lỗi (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    console.log("✅ VNPT trả về thành công! Đang xử lý dữ liệu...");

    // 5. Xử lý dữ liệu trả về (Parsing)
    // Cấu trúc data thường là: { object: { results: [...] } } hoặc { results: [...] }
    const results = data.results || (data.object ? data.object.results : []);

    if (!results || results.length === 0) {
      console.warn("⚠️ VNPT không trả về kết quả text nào (File im lặng?)");
      return;
    }

    // Mảng chứa các câu thoại sẽ lưu vào DB
    let finalChunks = [];

    for (const result of results) {
      const alt = result.alternatives?.[0]; // Lấy phương án nhận dạng tốt nhất
      if (!alt) continue;

      // Nếu có thông tin chi tiết từng từ (words) -> Gom nhóm thành câu
      if (alt.words && alt.words.length > 0) {
        let currentSentence = "";
        let sentenceStartTime = parseTime(alt.words[0].startTime);
        let sentenceEndTime = 0;

        for (let i = 0; i < alt.words.length; i++) {
          const w = alt.words[i];
          const wordText = w.word;
          
          currentSentence += wordText + " ";
          sentenceEndTime = parseTime(w.endTime);

          // Logic ngắt câu: 
          // 1. Nếu từ hiện tại kết thúc bằng dấu chấm/hỏi/cảm thán.
          // 2. Hoặc câu đã dài quá 15 từ.
          // 3. Hoặc là từ cuối cùng trong đoạn.
          const isEndOfSentence = /[.?!]$/.test(wordText);
          const isLongEnough = currentSentence.split(" ").length > 15;
          const isLastWord = i === alt.words.length - 1;

          if (isEndOfSentence || isLongEnough || isLastWord) {
            finalChunks.push({
              meetingId: meetingId,
              text: currentSentence.trim(),
              startTime: sentenceStartTime,
              endTime: sentenceEndTime,
              speakerLabel: "Speaker", // Mặc định, nếu VNPT có diarization thì update sau
            });

            // Reset cho câu tiếp theo
            currentSentence = "";
            if (!isLastWord) {
              // Thời gian bắt đầu câu mới là thời gian của từ tiếp theo
              sentenceStartTime = parseTime(alt.words[i + 1].startTime);
            }
          }
        }
      } 
      // Fallback: Nếu không có words, lấy cả đoạn transcript lớn
      else if (alt.transcript) {
        finalChunks.push({
          meetingId: meetingId,
          text: alt.transcript,
          startTime: 0,
          endTime: 0, // Không xác định được
          speakerLabel: "Speaker",
        });
      }
    }

    // 6. Lưu vào Database (Transaction)
if (finalChunks.length > 0) {
      // Lưu thẳng vào file JSON thay vì Prisma
      localDb.saveTranscripts(meetingId, finalChunks);
      console.log(`✅ Đã lưu ${finalChunks.length} dòng vào file JSON.`);
    } else {

      console.log(`💾 Đã lưu ${finalChunks.length} dòng transcript vào Database.`);
    }

  } catch (error) {
    console.error("❌ Lỗi trong quá trình xử lý SmartVoice:", error);
    // Có thể throw tiếp để API gọi nó biết là lỗi
    throw error;
  }
}