import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();

  const vnfaceUrl =
    process.env.VNFACE_BASE_URL + "/checkin-service/external/account";

  const res = await fetch(vnfaceUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VNFACE_ACCESS_TOKEN}`,
      "Token-Channel": process.env.VNFACE_TOKEN_CHANNEL!,
    },
    body: formData,
  });

  const text = await res.text();
  console.log("VNFACE RAW RESPONSE:", text);

  if (!text) {
    return NextResponse.json(
      { success: false, message: "Empty response from vnFace" },
      { status: res.status }
    );
  }

  try {
    return NextResponse.json(JSON.parse(text), {
      status: res.status,
    });
  } catch {
    return NextResponse.json(
      { success: false, raw: text },
      { status: res.status }
    );
  }
}
