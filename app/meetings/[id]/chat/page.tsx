"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

// Mock data
const mockPastQuestions = [
  "What were the main decisions?",
  "List all action items assigned to me",
  "When is the next sprint review?",
  "Who disagreed with the timeline?",
  "Summarize the discussion about pricing",
];

const mockMessages = [
  {
    id: 1,
    role: "user" as const,
    content: "What were the key decisions made in this meeting?",
    timestamp: "10:23 AM",
  },
  {
    id: 2,
    role: "assistant" as const,
    content:
      "Based on the meeting transcript, here are the key decisions:\n\n1. **Product Launch Date**: The team agreed to move the launch date from March 15 to March 30 to allow for additional QA testing.\n\n2. **Budget Allocation**: Approved an additional $50K for marketing campaigns.\n\n3. **Resource Assignment**: Sarah will lead the design review, Mike will handle backend integration.",
    timestamp: "10:23 AM",
    sources: [
      { text: "Discussion about launch timeline", timestamp: "12:45" },
      { text: "Budget approval segment", timestamp: "28:30" },
      { text: "Team assignments section", timestamp: "42:15" },
    ],
  },
  {
    id: 3,
    role: "user" as const,
    content: "Who raised concerns about the timeline?",
    timestamp: "10:25 AM",
  },
  {
    id: 4,
    role: "assistant" as const,
    content:
      "Emily Rodriguez raised concerns about the original March 15 timeline. She mentioned that the QA team needs at least 2 additional weeks to properly test the new features, especially the payment integration module. David Kim supported this concern and suggested the March 30 date instead.",
    timestamp: "10:25 AM",
    sources: [
      { text: "Emily's timeline concern", timestamp: "15:20" },
      { text: "David's support statement", timestamp: "16:45" },
    ],
  },
];

const suggestionChips = [
  "Summarize all decisions",
  "List my action items",
  "What were the main topics?",
  "Show disagreements",
];

export default function ChatbotPage() {
  const { id } = useParams<{ id: string }>();
  const [scope, setScope] = useState("single");
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState(mockMessages);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      role: "user" as const,
      content: inputValue,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([...messages, newUserMessage]);
    setInputValue("");

    // Show thinking state
    setIsThinking(true);

    // Simulate bot response
    setTimeout(() => {
      const newBotMessage = {
        id: messages.length + 2,
        role: "assistant" as const,
        content:
          "This is a mock response. In production, this would show the AI-generated answer based on meeting transcripts.",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sources: [{ text: "Relevant segment", timestamp: "25:30" }],
      };
      setMessages((prev) => [...prev, newBotMessage]);
      setIsThinking(false);
    }, 2000);
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
                Q4 Product Strategy Review
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex lg:w-80 flex-col border-r bg-muted/30">
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Scope Section */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Scope</h3>
                  <RadioGroup value={scope} onValueChange={setScope}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="cursor-pointer">
                        This meeting only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple" id="multiple" />
                      <Label htmlFor="multiple" className="cursor-pointer">
                        Multiple meetings
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Filters for multiple meetings */}
                {scope === "multiple" && (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="space-y-2">
                      <Label
                        htmlFor="dateRange"
                        className="text-sm font-medium"
                      >
                        Date Range
                      </Label>
                      <Input
                        id="dateRange"
                        type="text"
                        placeholder="Last 30 days"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project" className="text-sm font-medium">
                        Project
                      </Label>
                      <Input
                        id="project"
                        type="text"
                        placeholder="All projects"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Questions */}
            <div>
              <h3 className="font-semibold mb-3 px-2">Recent Questions</h3>
              <div className="space-y-1">
                {mockPastQuestions.map((question, idx) => (
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
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
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
                      {message.role === "assistant" && message.sources && (
                        <div className="mt-4 space-y-2 border-t pt-3">
                          <p className="text-xs font-medium text-muted-foreground">
                            Sources:
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
                                Open at {source.timestamp}
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
                        Thinking...
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
                  placeholder="Ask a question about this meeting..."
                  className="min-h-15 resize-none"
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
                  className="h-15 w-15 shrink-0"
                  onClick={handleSend}
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
