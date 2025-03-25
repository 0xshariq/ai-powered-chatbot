"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  Image,
  Video,
  MessageSquare,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GenerationType = "text" | "image" | "video";

interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  type?: GenerationType;
  mediaUrl?: string;
}

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [generationType, setGenerationType] = useState<GenerationType>("text");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString();

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp,
      type: generationType,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/generate${generationType.charAt(0).toUpperCase() + generationType.slice(1)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) throw new Error("Failed to generate response");

      const data = await response.json();
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.text || "Generated content",
        timestamp: new Date().toLocaleTimeString(),
        type: generationType,
        mediaUrl: data.mediaUrl,
      }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request.",
        timestamp: new Date().toLocaleTimeString(),
        type: "text",
      }]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
                <MessageSquare className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-medium">How can I help you today?</h3>
                <p className="text-muted-foreground max-w-md">Ask me anything or select a generation type.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-lg p-4", message.role === "user" ? "bg-primary text-white" : "bg-muted")}>  
                  {message.type === "image" && message.mediaUrl ? (
                    <img src={message.mediaUrl} alt="Generated" className="rounded-md max-w-full max-h-[300px] object-contain" />
                  ) : message.type === "video" && message.mediaUrl ? (
                    <video src={message.mediaUrl} controls className="rounded-md max-w-full max-h-[300px]" />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4 flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-400" />
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>
      <div className="p-4 border-t sticky bottom-0 bg-white flex gap-2 items-end">
        <Select value={generationType} onValueChange={(value) => setGenerationType(value as GenerationType)}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Text" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="text"><MessageSquare className="h-4 w-4 mr-2" />Text</SelectItem>
            <SelectItem value="image"><Image className="h-4 w-4 mr-2" />Image</SelectItem>
            <SelectItem value="video"><Video className="h-4 w-4 mr-2" />Video</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1 relative">
          <Textarea placeholder="Ask me anything..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} className="min-h-[44px] max-h-32 pr-10" rows={1} />
          <Button size="icon" variant="ghost" className="absolute right-2 bottom-2 h-8 w-8" onClick={handleSubmit} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}