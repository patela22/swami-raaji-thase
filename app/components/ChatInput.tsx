"use client";

import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({
  onSendMessage,
  placeholder = "Ask a question about BAPS Satsang...",
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
        <div className="relative flex items-center bg-surface rounded-2xl border border-neutral-700 shadow-lg focus-within:border-primary-400 transition-all duration-200">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 px-6 py-4 bg-transparent text-text-primary placeholder-text-tertiary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-base"
          />
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="px-6 py-4 gradient-primary text-white font-semibold rounded-r-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
          >
            <span>Send</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {[
          "What is BAPS Satsang?",
          "Who is Swaminarayan?",
          "Tell me about the Vachanamrut",
          "What is spiritual guidance?",
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSendMessage(suggestion)}
            disabled={disabled}
            className="px-4 py-2 text-sm bg-surface hover:bg-neutral-700 text-text-secondary hover:text-text-primary rounded-full border border-neutral-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </form>
  );
}
