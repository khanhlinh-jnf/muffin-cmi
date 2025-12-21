import { NextResponse } from "next/server";
import { vnfaceFetch } from "@/lib/vnface";

// validate YYYY-MM-DD
const isISODate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  console.log("CHECKIN ROUTE HIT:", req.url);

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const filterMode = searchParams.get("filterMode") === "2" ? "2" : "1";

  if (!startDate || !endDate || !isISODate(startDate) || !isISODate(endDate)) {
    return NextResponse.json({ object: { data: [] } });
  }
  let path = "/checkin-service/external/his-checkin/list-filter";

  path += `&filterMode=${filterMode}`;
  path += `&startDate=${encodeURIComponent(startDate + "T00:00:00")}`;
  path += `&endDate=${encodeURIComponent(endDate + "T23:59:59")}`;

  console.log("CHECKIN PATH >>>", path);

  try {
    const data = await vnfaceFetch(path);
    return NextResponse.json(data);
  } catch (err) {
    console.error("VNFACE CHECKIN ERROR:", err);
    return NextResponse.json({ object: { data: [] } }, { status: 200 });
  }
}
