"use client";

import { useState } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{
    scripture: string;
    page: string;
    snippet: string;
    relevance?: number;
  }>;
}

export default function ChatMessage({
  role,
  content,
  citations,
}: ChatMessageProps) {
  const [showCitations, setShowCitations] = useState(false);

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-3xl">
          <div className="bg-primary-500 text-white rounded-2xl rounded-br-md px-6 py-4 shadow-lg">
            <p className="text-base leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-3xl">
        <div className="bg-surface rounded-2xl rounded-bl-md px-6 py-4 shadow-lg border border-neutral-700">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">SR</span>
            </div>
            <div className="flex-1">
              <p className="text-base leading-relaxed text-text-primary whitespace-pre-wrap">
                {content}
              </p>

              {citations && citations.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowCitations(!showCitations)}
                    className="flex items-center space-x-2 text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showCitations ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    <span>
                      {citations.length} source
                      {citations.length !== 1 ? "s" : ""}
                    </span>
                  </button>

                  {showCitations && (
                    <div className="mt-3 space-y-3">
                      {citations.map((citation, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-neutral-800 border border-neutral-700"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
