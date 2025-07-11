"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import AnalyticsDashboard from "./AnalyticsDashboard";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{
    scripture: string;
    page: string;
    snippet: string;
    relevance?: number;
  }>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const hasFiredInitial = useRef(false);
  const [allCitations, setAllCitations] = useState<
    Array<{
      scripture: string;
      page: string;
      snippet: string;
      relevance?: number;
    }>
  >([]);

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

  // Update citations when messages change
  useEffect(() => {
    const citations = messages
      .filter((msg) => msg.role === "assistant" && msg.citations)
      .flatMap((msg) => msg.citations || []);

    // Remove duplicates based on scripture + page combination
    const uniqueCitations = citations.filter(
      (citation, index, self) =>
        index ===
        self.findIndex(
          (c) => c.scripture === citation.scripture && c.page === citation.page
        )
    );

    setAllCitations(uniqueCitations);
  }, [messages]);

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

  const handleSendMessage = async (message: string) => {
    const userMessage = message.trim();
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setLocalMessages(newMessages);
    sendToApi(newMessages);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="border-b border-neutral-700 bg-surface/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">SR</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-text-primary">
                  Swami Raaji Thase
                </h1>
                <p className="text-sm text-text-secondary">
                  Spiritual AI Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSources(!showSources)}
                className="px-4 py-2 text-sm bg-surface hover:bg-neutral-700 text-text-secondary hover:text-text-primary rounded-lg border border-neutral-700 transition-all duration-200"
              >
                Sources ({allCitations.length})
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2 text-text-secondary">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-neutral-700 bg-surface/80 backdrop-blur-sm p-6">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder="Ask a question about BAPS Satsang..."
          />
        </div>
      </div>

      {/* Sources Panel */}
      {showSources && (
        <div className="w-80 border-l border-neutral-700 bg-surface/80 backdrop-blur-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Sources & Citations
            </h3>

            {allCitations.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-700 flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <p className="text-sm text-text-secondary">
                  Sources will appear here as you chat...
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {allCitations.map((citation, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-neutral-800 border border-neutral-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm text-text-primary">
                        {citation.scripture}
                      </div>
                      {citation.relevance && (
                        <div className="text-xs text-text-tertiary">
                          {Math.round(citation.relevance * 100)}% match
                        </div>
                      )}
                    </div>
                    {citation.page && (
                      <div className="text-xs text-text-secondary mb-2">
                        Page {citation.page}
                      </div>
                    )}
                    <div className="text-xs text-text-secondary leading-relaxed">
                      "{citation.snippet}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      <AnalyticsDashboard />
    </div>
  );
}
