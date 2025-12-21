"use client";

import { useState } from "react";

export default function NewEmployeePage() {
  const [file, setFile] = useState<File | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("userCode", e.currentTarget.userCode.value);
    formData.append("fullName", e.currentTarget.fullName.value);
    formData.append("email", e.currentTarget.email.value);

    formData.append("type", "0");
    formData.append("groupCodes", "DEFAULT");

    if (file) {
      formData.append("image", file);
    }

    const res = await fetch("/api/vnface/enroll", {
      method: "POST",
      body: formData,
    });

    const text = await res.text();
    console.log("API RESPONSE:", text);

    if (!res.ok) {
      alert("Create employee failed");
      return;
    }

    const data = text ? JSON.parse(text) : null;

    console.log("CREATE RESULT:", data);

    alert("Employee created");
  };

  return (
    <form onSubmit={submit} className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Create Employee</h1>

      <input name="userCode" placeholder="UserCode" required />
      <input name="fullName" placeholder="Full name" required />
      <input name="email" placeholder="Email" required />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button className="border px-4 py-1">Create</button>
    </form>
  );
}
