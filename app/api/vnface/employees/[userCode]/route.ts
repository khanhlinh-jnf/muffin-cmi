import { NextResponse } from "next/server";
import { vnfaceFetch } from "@/lib/vnface";

export async function GET(
  _: Request,
  { params }: { params: { userCode: string } }
) {
  const data = await vnfaceFetch(
    `/checkin-service/external/account/${params.userCode}`
  );

  return NextResponse.json(data);
}
