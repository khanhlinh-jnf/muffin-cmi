// app/api/vnface/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { vnfaceFetch } from "@/lib/vnface";

/* ===== TYPES ===== */

type EmployeeStatus = "ACTIVE" | "INACTIVE";

type VNFaceEmployeeRaw = {
  uuidAccount: string;
  userCode: string;
  fullName: string;
  gender?: "MALE" | "FEMALE";
  imageUrl?: string;
  avatar?: string;
  lastUpdate: string;
  status?: EmployeeStatus;
};

type VNFaceListResponse = {
  object?: {
    data?: VNFaceEmployeeRaw[];
  };
};

type Employee = {
  uuidAccount: string;
  userCode: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | null;
  imageUrl: string | null;
  lastUpdate: string;
  status?: EmployeeStatus;
};

type EmployeeListResponse = {
  object: {
    data: Employee[];
  };
};

/* ===== ROUTE ===== */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const keySearch = searchParams.get("keySearch");

  // Nếu VNFace thật: base path phải kèm ?page=1&size=50 trước rồi mới gắn &
  let path = "/checkin-service/external/account/list?page=1&size=50";

  if (startDate && endDate) {
    path += `&fromDate=${encodeURIComponent(startDate + "T00:00:00")}`;
    path += `&toDate=${encodeURIComponent(endDate + "T23:59:59")}`;
  }

  if (keySearch) {
    path += `&keySearch=${encodeURIComponent(keySearch)}`;
  }

  console.log("EMPLOYEE PATH:", path);

  const raw = (await vnfaceFetch(path)) as VNFaceListResponse;

  const list: Employee[] =
    raw.object?.data
      ?.filter((e) => e.status !== "INACTIVE")
      .map(
        (e): Employee => ({
          uuidAccount: e.uuidAccount,
          userCode: e.userCode,
          fullName: e.fullName,
          gender: e.gender ?? null,
          imageUrl: e.imageUrl ?? e.avatar ?? null,
          lastUpdate: e.lastUpdate,
          status: e.status,
        }),
      ) ?? [];

  return NextResponse.json({
    object: {
      data: list,
    },
  } satisfies EmployeeListResponse);
}