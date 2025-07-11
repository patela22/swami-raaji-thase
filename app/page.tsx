"use client";

import { useState } from "react";
import ChatInput from "./components/ChatInput";
import ChatWindow from "./components/ChatWindow";

export default function Home() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [isChatStarted, setIsChatStarted] = useState(false);

  const handleFirstMessage = async (message: string) => {
    setIsChatStarted(true);
    setMessages([{ role: "user", content: message }]);
  };

  if (!isChatStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
        {/* Header */}
        <header className="relative z-10 border-b border-neutral-700 bg-surface/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SR</span>
                </div>
                <h1 className="text-xl font-semibold text-text-primary">
                  Swami Raaji Thase
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-800 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-pulse"></div>
              <div
                className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-700 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="mb-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
                  <span className="font-meowscript text-primary-400">
                    Swami Raaji Thase
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                  Your spiritual AI assistant for BAPS Satsang questions. Get
                  answers grounded in scripture and spiritual wisdom.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 rounded-xl bg-surface shadow-lg border border-neutral-700">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 mx-auto">
                    <span className="text-white text-xl">📚</span>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Scripture-Based
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Answers grounded in authentic BAPS scriptures and teachings
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-surface shadow-lg border border-neutral-700">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 mx-auto">
                    <span className="text-white text-xl">🤖</span>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    AI-Powered
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Advanced AI technology for comprehensive spiritual guidance
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-surface shadow-lg border border-neutral-700">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 mx-auto">
                    <span className="text-white text-xl">💡</span>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Instant Answers
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Get immediate responses to your spiritual questions
                  </p>
                </div>
              </div>

              {/* Chat Input */}
              <div className="max-w-2xl mx-auto">
                <ChatInput onSendMessage={handleFirstMessage} />
              </div>

              {/* Footer */}
              <div className="mt-16 text-center">
                <p className="text-sm text-text-tertiary">
                  Powered by advanced AI technology • Grounded in spiritual
                  wisdom
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800">
      <ChatWindow initialMessages={messages} setMessages={setMessages} />
    </div>
  );
}
