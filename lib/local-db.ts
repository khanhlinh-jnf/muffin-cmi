import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'transcripts');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const FULL_DIR = path.join(DATA_DIR, 'full');

[RAW_DIR, FULL_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

export const localDb = {
  saveTranscripts: (meetingId: string, chunks: any[]) => {
    try {
      const rawPath = path.join(RAW_DIR, `${meetingId}.json`);
      fs.writeFileSync(rawPath, JSON.stringify(chunks, null, 2), 'utf-8');

      const fullText = chunks.map(c => c.text).join(' ');
      const fullPath = path.join(FULL_DIR, `${meetingId}.txt`);
      fs.writeFileSync(fullPath, fullText, 'utf-8');
      
      console.log('[LocalDB] Đã lưu mới: ${meetingId}');
    } catch (error) {
      console.error("LocalDB] Lỗi lưu file:", error);
    }
  },

  getTranscripts: (meetingId: string) => {
    try {
      const rawPath = path.join(RAW_DIR, `${meetingId}.json`);
      if (!fs.existsSync(rawPath)) return [];
      return JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
    } catch (e) { return []; }
  },

  deleteTranscript: (meetingId: string) => {
    try {
      const rawPath = path.join(RAW_DIR, `${meetingId}.json`);
      const fullPath = path.join(FULL_DIR, `${meetingId}.txt`);
      
      if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      
      console.log('[LocalDB] Đã xóa dữ liệu cũ của ID: ${meetingId}');
    } catch (error) {
      console.error("Lỗi xóa file cũ:", error);
    }
  },

  getFullTextPath: (meetingId: string) => path.join(FULL_DIR, `${meetingId}.txt`)
};