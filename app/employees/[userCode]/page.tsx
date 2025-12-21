"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";

type EmployeeDetail = {
  userCode: string;
  fullName: string;
  gender: string | null;
  imageUrl: string | null;
};

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ userCode: string }>;
}) {
  const { userCode } = use(params);

  const [data, setData] = useState<EmployeeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(
          `/api/vnface/employees/${encodeURIComponent(userCode)}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch employee detail");
        }

        const text = await res.text();
        if (!text) return;

        const json = JSON.parse(text) as {
          object: EmployeeDetail;
        };

        setData(json.object);
      } catch (err) {
        console.error(err);
        setError("Cannot load employee detail");
      }
    };

    fetchDetail();
  }, [userCode]);

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  if (!data) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Employee Detail</h1>

      <p>
        <b>UserCode:</b> {data.userCode}
      </p>
      <p>
        <b>Full name:</b> {data.fullName}
      </p>
      <p>
        <b>Gender:</b> {data.gender ?? "—"}
      </p>

      {data.imageUrl && (
        <div className="mt-4">
          <Image
            src={data.imageUrl}
            alt={data.fullName}
            width={128}
            height={128}
            className="border rounded"
          />
        </div>
      )}
    </div>
  );
}
