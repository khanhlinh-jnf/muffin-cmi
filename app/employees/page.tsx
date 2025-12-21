"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ================= TYPES ================= */

type Employee = {
  userCode: string;
  fullName: string;
  gender: string | null;
  imageUrl: string | null;
  lastUpdate: string;
  status?: "ACTIVE" | "INACTIVE";
};

type EmployeeListResponse = {
  object: {
    data: Employee[];
  };
};

function parseVNDate(dateStr: string) {
  // "20/12/2025 22:55:02"
  const [date, time] = dateStr.split(" ");
  const [d, m, y] = date.split("/");
  return new Date(`${y}-${m}-${d}T${time}`);
}

function toVNFaceDate(date: string, isEnd = false) {
  if (!date) return "";

  const [y, m, d] = date.split("-");
  return isEnd ? `${d}/${m}/${y} 23:59:59` : `${d}/${m}/${y} 00:00:00`;
}
export default function EmployeesPage() {
  const [data, setData] = useState<Employee[]>([]);

  // filters
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [keySearch, setKeySearch] = useState<string>("");
  console.log(data[0]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("filterMode", "1");

    if (startDate) params.set("startDate", toVNFaceDate(startDate));

    if (endDate) params.set("endDate", toVNFaceDate(endDate, true));

    if (keySearch) params.set("keySearch", keySearch);

    fetch(`/api/vnface/employees?${params.toString()}`)
      .then((res) => res.json())
      .then((res: EmployeeListResponse) => {
        let list = res.object?.data ?? [];

        if (startDate) {
          const from = new Date(startDate + "T00:00:00");
          list = list.filter((e) => parseVNDate(e.lastUpdate) >= from);
        }

        if (endDate) {
          const to = new Date(endDate + "T23:59:59");
          list = list.filter((e) => parseVNDate(e.lastUpdate) <= to);
        }

        setData(list);
      });
  }, [startDate, endDate, keySearch]);

  const deleteEmployee = async (userCode: string) => {
    const ok = confirm(`Delete employee ${userCode}?`);
    if (!ok) return;

    await fetch("/api/vnface/employees/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userCodes: [userCode],
      }),
    });

    // reload list
    setData((prev) => prev.filter((e) => e.userCode !== userCode));
  };

  return (
    <div className="p-6 space-y-6">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>

        <Link href="/employees/new">
          <Button>+ Add employee</Button>
        </Link>
      </div>

      {/* ===== Filters ===== */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-muted-foreground">
            Updated from
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground">
            Updated to
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground">Search</label>
          <input
            placeholder="UserCode / Full name"
            value={keySearch}
            onChange={(e) => setKeySearch(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setStartDate("");
            setEndDate("");
            setKeySearch("");
          }}
        >
          Clear
        </Button>
      </div>

      {/* ===== Table ===== */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Last update</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((e) => (
              <TableRow key={e.userCode}>
                {/* Employee */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    {e.imageUrl ? (
                      <Image
                        src={e.imageUrl}
                        alt={e.fullName}
                        width={40}
                        height={40}
                        className="rounded-full border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-medium">
                        {e.fullName.charAt(0)}
                      </div>
                    )}

                    <div>
                      <p className="font-medium">{e.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {e.userCode}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Gender */}
                <TableCell>
                  {e.gender ? (
                    <Badge variant="secondary">{e.gender}</Badge>
                  ) : (
                    "—"
                  )}

                  {e.status === "INACTIVE" && (
                    <Badge variant="destructive" className="ml-2">
                      Inactive
                    </Badge>
                  )}
                </TableCell>

                {/* Last update */}
                <TableCell className="text-muted-foreground">
                  {e.lastUpdate}
                </TableCell>

                {/* Action */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/employees/${e.userCode}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteEmployee(e.userCode)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No employees found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
