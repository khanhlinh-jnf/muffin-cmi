// app/api/meetings/[id]/participants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  // Nếu bạn đang dùng auth qua header Authorization
  const token = req.headers.get("authorization") || undefined;
  const user = await getUserFromToken(token);

  console.log("Mock participants API for meeting", id, "user:", user);

  // TODO: thay bằng truy vấn thật nếu cần; tạm mock cho build qua
  // const participants = await prisma.meetingParticipant.findMany({ where: { meetingId: id } });

  const participants = [
    {
      id: "demo-user",
      name: "Demo User",
      email: "demo@example.com",
      role: "host",
    },
  ];

  return NextResponse.json(participants);
}
