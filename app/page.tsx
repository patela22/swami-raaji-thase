"use client";

import { useState } from "react";
import ChatInput from "./components/ChatInput";
import ChatWindow from "./components/ChatWindow";

export default function Home() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [testResult, setTestResult] = useState<string>("");

  const handleFirstMessage = async (message: string) => {
    setIsChatStarted(true);
    setMessages([{ role: "user", content: message }]);
  };

  const testChatAPI = async () => {
    setTestResult("Testing API...");
    try {
      console.log("Testing chat API...");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "What is BAPS Satsang?",
            },
          ],
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        setTestResult(`❌ API Error: ${response.status} - ${errorText}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setTestResult("❌ No response body");
        return;
      }

      let accumulatedContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        console.log("Received chunk:", chunk);

        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setTestResult(
                `✅ API Working! Response: ${accumulatedContent.substring(
                  0,
                  100
                )}...`
              );
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content") {
                accumulatedContent += parsed.content;
              }
            } catch (e) {
              // Continue streaming
            }
          }
        }
      }
    } catch (error) {
      console.error("Test error:", error);
      setTestResult(`❌ Test failed: ${error}`);
    }
  };

  if (!isChatStarted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto p-8">
          <h1 className="text-6xl text-center text-tangy font-meowscript font-semibold mb-8">
            Swami Raaji Thase
          </h1>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Ask questions about BAPS Satsang and receive answers grounded in
            scripture
          </p>

          {/* Temporary Test Button */}
          <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">🔧 API Test</h3>
            <button
              onClick={testChatAPI}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
            >
              Test Chat API
            </button>
            {testResult && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                {testResult}
              </div>
            )}
          </div>

          <ChatInput onSendMessage={handleFirstMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <ChatWindow initialMessages={messages} setMessages={setMessages} />
    </div>
  );
}
