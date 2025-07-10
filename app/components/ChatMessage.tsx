interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ scripture: string; page: string; snippet: string }>;
}

export default function ChatMessage({
  role,
  content,
  citations,
}: ChatMessageProps) {
  return (
    <div className={`mb-6 ${role === "user" ? "text-right" : "text-left"}`}>
      <div
        className={`inline-block max-w-3xl p-4 rounded-lg ${
          role === "user"
            ? "bg-tangy text-white ml-auto"
            : "bg-white text-gray-800 border border-gray-200"
        }`}
      >
        <div className="whitespace-pre-wrap">{content}</div>

        {citations && citations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm font-semibold text-gray-600 mb-2">
              Sources:
            </div>
            {citations.map((citation, index) => (
              <div key={index} className="text-sm text-gray-500 mb-1">
                <span className="font-medium">{citation.scripture}</span>
                {citation.page && (
                  <span className="ml-2">(Page {citation.page})</span>
                )}
                <div className="text-xs text-gray-400 mt-1 italic">
                  "{citation.snippet}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
