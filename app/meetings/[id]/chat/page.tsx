"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Send,
  Sparkles,
  ExternalLink,
  Loader2,
} from "lucide-react";

type Source = {
  text: string;
  timestamp: string;
};

type APISource = {
  snippet?: string;
  text?: string;
  timestamp?: string;
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: Source[];
};

const suggestionChips: string[] = [
  "Tóm tắt các quyết định chính",
  "Liệt kê các action items của tôi",
  "Sếp nói gì về deadline?",
  "Những rủi ro chính là gì?",
];

export default function ChatbotPage() {
  const { id } = useParams<{ id: string }>();

  const [scope, setScope] = useState<"single" | "multiple">("single");
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSend = async () => {
    if (!inputValue.trim() || !id) return;

    const question = inputValue.trim();

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: question,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsThinking(true);

    try {
      console.log("=== Calling QA API ===", `/api/meetings/${id}/ask`);

      const res = await fetch(`/api/meetings/${id}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, scope }),
      });

      const data = await res.json();
      console.log("QA response:", data);

      if (!res.ok) {
        throw new Error(data.error || `API error: ${res.status}`);
      }

      const sources: Source[] = (data.sources ?? []).map((s: APISource) => ({
        text: s.snippet ?? s.text ?? "Đoạn liên quan trong cuộc họp",
        timestamp:
          typeof s.timestamp === "string"
            ? s.timestamp
            : "00:00",
      }));

      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.answer || "Không có câu trả lời phù hợp.",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sources: sources.length ? sources : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling QA API:", error);

      const errorMessage: ChatMessage = {
        id: Date.now() + 2,
        role: "assistant",
        content:
          "Có lỗi xảy ra khi gọi API hỏi đáp. Vui lòng thử lại sau ít phút.",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <Link href={`/meetings/${id}/summary`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">CMI</span>
            </div>
            <div>
              <h1 className="font-semibold">Meeting Chatbot</h1>
              <p className="text-xs text-muted-foreground">
                Hỏi đáp dựa trên transcript cuộc họp
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex lg:w-80 flex-col border-r bg-muted/30">
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Scope */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Phạm vi tìm kiếm</h3>
                  <RadioGroup
                    value={scope}
                    onValueChange={(v) =>
                      setScope(v as "single" | "multiple")
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="cursor-pointer">
                        Chỉ cuộc họp này
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple" id="multiple" />
                      <Label htmlFor="multiple" className="cursor-pointer">
                        Nhiều cuộc họp (chưa triển khai)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Gợi ý nhanh */}
            <div>
              <h3 className="font-semibold mb-3 px-2">Gợi ý câu hỏi</h3>
              <div className="space-y-1">
                {suggestionChips.map((question, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2 px-2 text-sm font-normal"
                    onClick={() => setInputValue(question)}
                  >
                    <span className="line-clamp-2">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <p className="text-lg font-medium mb-2">
                    Hãy bắt đầu bằng một câu hỏi về cuộc họp
                  </p>
                  <p className="text-sm">
                    Ví dụ: &quot;Sếp chốt deadline dự án X là ngày nào?&quot;
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user"
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback
                      className={
                        message.role === "assistant"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }
                    >
                      {message.role === "assistant" ? "AI" : "You"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Content */}
                  <div
                    className={`flex-1 ${
                      message.role === "user" ? "flex justify-end" : ""
                    }`}
                  >
                    <div
                      className={`rounded-lg p-4 max-w-[85%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp}
                      </p>

                      {/* Sources */}
                      {message.role === "assistant" &&
                        message.sources &&
                        message.sources.length > 0 && (
                          <div className="mt-4 space-y-2 border-t pt-3">
                            <p className="text-xs font-medium text-muted-foreground">
                              Trích từ transcript:
                            </p>
                            {message.sources.map((source, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2 rounded-md bg-background p-2"
                              >
                                <span className="text-xs flex-1">
                                  {source.text}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 gap-1 text-xs shrink-0"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Mở tại {source.timestamp}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Thinking Indicator */}
              {isThinking && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Đang suy nghĩ...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-background p-4">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-2">
                {suggestionChips.map((chip, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs bg-transparent"
                    onClick={() => handleSuggestionClick(chip)}
                  >
                    <Sparkles className="h-3 w-3" />
                    {chip}
                  </Button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Hỏi về nội dung cuộc họp..."
                  className="min-h 15 resize-none"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="h-15] w-15 shrink-0"
                  onClick={handleSend}
                  disabled={isThinking || !inputValue.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
