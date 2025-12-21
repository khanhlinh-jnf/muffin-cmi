import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  // Mock: luôn cho login thành công với user giả
  return NextResponse.json({
    token: "mock-token",
    user: {
      id: "demo-user",
      email,
      name: "Demo User",
    },
  });
}
