import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const body = await req.json();

  // Nếu đang mock vnFace trên Vercel, có thể trả luôn:
  if (process.env.VERCEL) {
    console.log("VNFACE MOCK DELETE account:", body);
    return NextResponse.json({
      success: true,
      reason: "Mock delete on Vercel",
    });
  }

  const res = await fetch(
    process.env.VNFACE_BASE_URL +
      "/checkin-service/external/account/delete",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.VNFACE_ACCESS_TOKEN}`,
        "Token-Channel": process.env.VNFACE_TOKEN_CHANNEL!,
      },
      body: JSON.stringify(body),
    },
  );

  const json = await res.json();
  console.log("DELETE RESPONSE:", json);

  return NextResponse.json(json);
}
