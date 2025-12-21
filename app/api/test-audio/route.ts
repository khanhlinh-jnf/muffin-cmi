import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Blob } from "buffer";
import crypto from "crypto";

// Bắt buộc dòng này để đọc file từ ổ cứng
export const runtime = 'nodejs'; 

export async function GET() {
  try {
    console.log("🟢 Bắt đầu Test kết nối VNPT...");

    // 1. Cấu hình (Lấy từ .env.local)
    // Dùng link Standard để nhận kết quả ngay lập tức (không cần chờ Async)
    const API_URL = "https://api.idg.vnpt.vn/stt-service/v1/grpc/standard";
    const ACCESS_TOKEN = process.env.VNPT_ACCESS_TOKEN;
    const TOKEN_ID = process.env.VNPT_TOKEN_ID;
    const TOKEN_KEY = process.env.VNPT_TOKEN_KEY;

    // Kiểm tra biến môi trường
    if (!ACCESS_TOKEN || !TOKEN_ID || !TOKEN_KEY) {
      return NextResponse.json({ error: "❌ Thiếu API Key trong .env.local" }, { status: 500 });
    }

    // 2. Đường dẫn file test (Nằm trong thư mục public)
    const filePath = path.join(process.cwd(), "public", "test.mp3");

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "❌ Không tìm thấy file public/test.mp3. Vui lòng copy file vào đó." }, { status: 404 });
    }

    // 3. Đọc file
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]) as any; // Ép kiểu để tránh lỗi TS

    // 4. Tạo Form Data
    const formData = new FormData();
    formData.append("audioFile", blob, "test.mp3");
    formData.append("clientSession", crypto.randomUUID());
    
    // Các tham số cấu hình theo tài liệu
    formData.append("enableWordTimeOffsets", "true");
    formData.append("enableAutomaticPunctuation", "true");
    formData.append("model", "offline");
    formData.append("maxAlternatives", "1");
    
    // Config cho MP3
    const configMap = { convert_format: "mp3", capt_punch_recovery: "1" };
    formData.append("customConfiguration", JSON.stringify(configMap));

    console.log("🚀 Đang gửi request sang:", API_URL);

    // 5. Gửi Request
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Token-id": TOKEN_ID,
        "Token-key": TOKEN_KEY,
        // Không set Content-Type, để fetch tự xử lý multipart
      },
      body: formData,
    });

    // 6. Xử lý kết quả
    const status = res.status;
    const responseText = await res.text(); // Lấy text trước để debug nếu lỗi JSON

    console.log(`Status Code: ${status}`);
    
    if (!res.ok) {
        console.error("❌ VNPT Trả về lỗi:", responseText);
        return NextResponse.json({ 
            success: false, 
            status: status, 
            error: responseText 
        }, { status: status });
    }

    // Parse JSON
    const data = JSON.parse(responseText);
    console.log("✅ VNPT Thành công! Kết quả:", JSON.stringify(data, null, 2));

    return NextResponse.json({
        success: true,
        message: "Kết nối VNPT thành công!",
        data: data
    });

  } catch (error: any) {
    console.error("❌ Lỗi Code Test:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}