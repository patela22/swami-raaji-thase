"use client";

import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about BAPS Satsang..."
          className="flex-1 p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-tangy focus:outline-none bg-white"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-8 py-4 bg-tangy text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Ask
        </button>
      </div>
    </form>
  );
}
