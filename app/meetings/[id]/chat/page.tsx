// app/meetings/[id]/chat/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export default function MeetingChatPage() {
  const params = useParams();
  const meetingId = params?.id;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: `Xin chào! Đây là chatbot hỏi đáp về cuộc họp #${meetingId}. Bạn có thể hỏi bất kỳ câu hỏi nào liên quan.`,
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const nextId = messages.length + 1;

    // Push user message + mock reply
    setMessages((prev) => [
      ...prev,
      { id: nextId, role: "user", content: text },
      {
        id: nextId + 1,
        role: "assistant",
        content:
          "Đây là câu trả lời mockup. Sau này sẽ thay bằng kết quả từ API / SmartBot / LLM.",
      },
    ]);

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-gray-50 p-4">
      {/* Header */}
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">
            Chatbot hỏi đáp cuộc họp
          </h1>
          <p className="text-xs text-gray-500">
            Meeting ID: {String(meetingId || "")}
          </p>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          Mock mode
        </span>
      </header>

      {/* Card chat */}
      <div className="flex flex-1 flex-col rounded-lg border bg-white">
        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-3 py-2 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <p className="text-center text-xs text-gray-400">
              Chưa có tin nhắn nào.
            </p>
          )}
        </div>

        {/* Input */}
        <div className="border-t px-3 py-2">
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-full border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập câu hỏi về cuộc họp..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSend}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Gửi
            </button>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            Đây chỉ là giao diện mockup. Chưa kết nối SmartBot / LLM.
          </p>
        </div>
      </div>
    </div>
  );
}
