import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Tạm thời không kiểm tra gì, cho qua hết
  return NextResponse.next();
}

// Có thể giữ hoặc xoá matcher, vì middleware đã luôn cho qua
export const config = {
  matcher: [
    "/app/:path*",
    "/api/meetings/:path*",
    "/api/my/:path*",
    "/api/chat/:path*",
  ],
};
