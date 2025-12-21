// app/api/vnface/employees/[userCode]/route.ts
import { NextRequest, NextResponse } from "next/server";

// Hiện tại mock vnFace cho dễ deploy
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ userCode: string }> },
) {
  const { userCode } = await context.params;

  console.log("VNFACE employees mock GET for userCode:", userCode);

  return NextResponse.json({
    success: true,
    score: 0.99,
    reason: "Mock vnFace employee info on Vercel",
  });
}
