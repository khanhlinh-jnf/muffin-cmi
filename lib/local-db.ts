import fs from 'fs';
import path from 'path';

// Định nghĩa thư mục lưu trữ
const DATA_DIR = path.join(process.cwd(), 'data', 'transcripts');
const RAW_DIR = path.join(DATA_DIR, 'raw');   // Chứa JSON từng câu (cho UI Video)
const FULL_DIR = path.join(DATA_DIR, 'full'); // Chứa Text toàn văn (cho Chatbot)

// Tạo thư mục nếu chưa có
[RAW_DIR, FULL_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

export const localDb = {
  saveTranscripts: (meetingId: string, chunks: any[]) => {
    try {
      // 1. Lưu file JSON (Từng câu lẻ - dùng cho Video Player)
      const rawPath = path.join(RAW_DIR, `${meetingId}.json`);
      fs.writeFileSync(rawPath, JSON.stringify(chunks, null, 2), 'utf-8');

      // 2. Lưu file Text (Gộp toàn bộ - dùng cho Chatbot/RAG)
      // Nối nội dung các câu lại thành 1 đoạn văn bản dài
      const fullText = chunks.map(c => c.text).join(' ');
      const fullPath = path.join(FULL_DIR, `${meetingId}.txt`);
      fs.writeFileSync(fullPath, fullText, 'utf-8');
      
      console.log(`[LocalDB] Đã lưu:\n  - JSON: ${rawPath}\n  - TEXT: ${fullPath}`);
    } catch (error) {
      console.error("[LocalDB] Lỗi lưu file:", error);
    }
  },

  getTranscripts: (meetingId: string) => {
    try {
      const rawPath = path.join(RAW_DIR, `${meetingId}.json`);
      if (!fs.existsSync(rawPath)) return [];
      return JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
    } catch (e) { return []; }
  },
  
  // Hàm lấy đường dẫn file text cho Chatbot sau này dùng
  getFullTextPath: (meetingId: string) => path.join(FULL_DIR, `${meetingId}.txt`)
};