import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { processAudioWithVNPT } from "@/lib/smartvoice";

// 👇 QUAN TRỌNG: Bắt buộc có dòng này để làm việc với file
export const runtime = 'nodejs'; 

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const meetingId = formData.get("meetingId") as string | null;

    // 1. Kiểm tra đầu vào
    if (!file || !meetingId) {
      return NextResponse.json(
        { error: "Thiếu file hoặc meetingId" },
        { status: 400 }
      );
    }

    // 2. Lưu file vào ổ cứng (public/uploads/meetings)
    const buffer = Buffer.from(await file.arrayBuffer());
    // Làm sạch tên file để tránh lỗi ký tự đặc biệt
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${safeName}`;

    // Tạo thư mục nếu chưa có
    const uploadDir = path.join(process.cwd(), "public/uploads/meetings");
    await mkdir(uploadDir, { recursive: true });

    const fullPath = path.join(uploadDir, filename);
    await writeFile(fullPath, buffer);

    // Đường dẫn để Frontend hiển thị video
    const fileUrl = `/uploads/meetings/${filename}`;

    console.log("📂 Đã lưu file tại:", fullPath);

    // 3. GỌI XỬ LÝ AI (Lưu vào JSON)
    // Lưu ý: Chúng ta dùng await ở đây để đảm bảo có kết quả JSON ngay lập tức cho bạn test
    try {
      await processAudioWithVNPT(fullPath, meetingId);
    } catch (aiError) {
      console.error("⚠️ Lỗi AI nhưng file đã upload:", aiError);
      // Vẫn trả về thành công để video hiện lên, dù AI có thể lỗi
    }

    return NextResponse.json({ success: true, url: fileUrl });

  } catch (error: any) {
    console.error("❌ Upload Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}