"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ scripture: string; page: string; snippet: string }>;
}

interface ChatWindowProps {
  initialMessages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function ChatWindow({
  initialMessages,
  setMessages,
}: ChatWindowProps) {
  const [messages, setLocalMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const hasFiredInitial = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Sync parent messages state
  useEffect(() => {
    setMessages(messages);
  }, [messages, setMessages]);

  // Fire API call for initial message if present
  useEffect(() => {
    if (
      !hasFiredInitial.current &&
      initialMessages.length === 1 &&
      messages.length === 1
    ) {
      hasFiredInitial.current = true;
      sendToApi(initialMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendToApi = async (msgs: Message[]) => {
    setIsLoading(true);
    setStreamingMessage("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: msgs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let accumulatedContent = "";
      let citations: Array<{
        scripture: string;
        page: string;
        snippet: string;
      }> = [];
      let finalData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              // Use the last received finalData for the answer
              if (finalData) {
                setLocalMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: finalData.answer,
                    citations: finalData.citations,
                  },
                ]);
              }
              setStreamingMessage("");
              setIsLoading(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content") {
                accumulatedContent += parsed.content;
                setStreamingMessage(accumulatedContent);
              } else if (parsed.type === "citations") {
                citations = parsed.citations;
              } else if (parsed.answer) {
                // This is the final answer chunk
                finalData = parsed;
              }
            } catch (e) {
              // Continue streaming
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setLocalMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setStreamingMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setLocalMessages(newMessages);
    sendToApi(newMessages);
  };

  return (
    <div className="flex h-screen">
      {/* Main Chat Area - 75% */}
      <div className="flex flex-col w-3/4">
        {/* Header */}
        <header className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-3xl text-tangy font-meowscript font-semibold">
            Swami Raaji Thase
          </h1>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              citations={message.citations}
            />
          ))}

          {streamingMessage && (
            <ChatMessage role="assistant" content={streamingMessage} />
          )}

          {isLoading && !streamingMessage && (
            <div className="text-center text-gray-500">Thinking...</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about BAPS Satsang..."
              disabled={isLoading}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-tangy focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-tangy text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Sources Panel - 25% */}
      <div className="w-1/4 border-l border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center justify-between w-full text-left font-semibold text-gray-700"
          >
            Sources
            <span className="text-gray-400">{showSources ? "▼" : "▶"}</span>
          </button>
        </div>

        {showSources && (
          <div className="p-4">
            <div className="text-sm text-gray-600">
              Recent sources will appear here as you chat...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
