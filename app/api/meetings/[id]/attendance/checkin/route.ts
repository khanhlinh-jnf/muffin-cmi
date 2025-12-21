// app/api/meetings/[id]/attendance/checkin/route.ts
import { NextRequest, NextResponse } from "next/server";

// Mock checkin (không gọi vnFace thật)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await req.json();

  console.log("Mock checkin (no vnFace) for meeting", id, body);

  return NextResponse.json({
    ok: true,
    message: "Mock face checkin success (vnFace disabled on this deployment).",
  });
}
