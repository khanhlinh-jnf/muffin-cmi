"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Checkin = {
  userCode: string;
  dateCheckin: string;
  createdDate: string;
  channelId: number;
};

type CheckinResponse = {
  object: {
    data: Checkin[];
  };
};

export default function CheckinPage() {
  const [data, setData] = useState<Checkin[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterMode, setFilterMode] = useState<"1" | "2">("2");
  const url = new URL("/api/vnface/checkin", "http://localhost");

  if (startDate) url.searchParams.set("startDate", startDate);
  if (endDate) url.searchParams.set("endDate", endDate);

  useEffect(() => {
    const fetchCheckin = async () => {
      try {
        const params = new URLSearchParams();

        params.set("filterMode", filterMode);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const res = await fetch(`/api/vnface/checkin?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch check-in history");

        const json = (await res.json()) as CheckinResponse;
        setData(json.object?.data ?? []);
      } catch (err) {
        console.error(err);
        setError("Cannot load check-in history");
      }
    };

    fetchCheckin();
  }, [startDate, endDate, filterMode]);

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Check-in History</h1>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm">Filter mode</label>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as "1" | "2")}
            className="border rounded px-2 py-1"
          >
            <option value="1">Created date</option>
            <option value="2">Check-in time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Check-in time</TableHead>
              <TableHead>Created date</TableHead>
              <TableHead>Channel</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((c, i) => (
              <TableRow key={i}>
                <TableCell>{c.userCode}</TableCell>
                <TableCell>{c.dateCheckin || "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {c.createdDate}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Channel {c.channelId}</Badge>
                </TableCell>
              </TableRow>
            ))}

            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No check-in records
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
