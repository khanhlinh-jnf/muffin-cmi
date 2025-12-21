import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  // Bỏ qua gọi vnFace thật, trả mock luôn
  const meetingId = params.id;
  const body = await req.json();

  console.log("Mock checkin for meeting", meetingId, body);

  return NextResponse.json({
    ok: true,
    message: "Mock face checkin success (vnFace disabled on Vercel).",
  });
}
