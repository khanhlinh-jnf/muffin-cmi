// lib/vnface.ts

export async function vnfaceFetch(path: string) {
  // Log cho biết đang chạy mock, tránh nhầm là gọi API thật
  console.log("VNFACE MOCK FETCH:", path);

  // Trả về dữ liệu fake giống cấu trúc bạn đang dùng trong code
  // Tùy theo chỗ gọi mà chỉnh cho khớp
  return {
    success: true,
    score: 0.99,
    reason: "vnFace mock success on Vercel",
  };
}
