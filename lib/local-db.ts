import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'transcripts.json');

export const localDb = {
  // Hàm lưu dữ liệu
  saveTranscripts: (meetingId: string, chunks: any[]) => {
    let allData: any = {};
    
    // Đọc dữ liệu cũ nếu có
    if (fs.existsSync(DB_PATH)) {
      try {
        allData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      } catch (e) { allData = {}; }
    }

    // Lưu dữ liệu mới đè vào ID cuộc họp
    allData[meetingId] = chunks;
    
    // Ghi xuống ổ cứng
    fs.writeFileSync(DB_PATH, JSON.stringify(allData, null, 2));
    console.log("💾 [LocalDB] Đã lưu dữ liệu vào transcripts.json");
  },

  // Hàm đọc dữ liệu
  getTranscripts: (meetingId: string) => {
    if (!fs.existsSync(DB_PATH)) return [];
    try {
      const allData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      return allData[meetingId] || [];
    } catch (e) {
      return [];
    }
  }
};