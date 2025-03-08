import { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { sender: "user", text: input }]);
      setInput("");
    }
  };

  return (
    <div className="flex h-screen bg-cream text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4">
        <h2 className="text-x font-bold mb-4">Conversations</h2>
        <ul>
          <li className="mb-2 cursor-pointer hover:text-blue-500">Chat 1</li>
          <li className="mb-2 cursor-pointer hover:text-blue-500">Chat 2</li>
          <li className="mb-2 cursor-pointer hover:text-blue-500">Chat 3</li>
        </ul>
      </aside>

      {/* Main Chat Area */}
      <main className="flex flex-col flex-grow">
        <header className="p-4 border-b border-gray-700">
          <h1 className="text-8xl justify-self-center text-tangy font-meowscript font-semibold">
            Swami Raaji T hase
          </h1>
        </header>

        {/* Messages Display */}
        <div className="flex-grow p-4 overflow-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded max-w-xs break-words ${
                msg.sender === "user"
                  ? "bg-blue-500 self-end"
                  : "bg-gray-700 self-start"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex p-4 border-t border-gray-700"
        >
          <input
            type="text"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow p-3 rounded bg-gray-800 text-tangy outline-none"
          />
          <button
            type="submit"
            className="ml-4 bg-blue-600 hover:bg-blue-700 p-3 rounded"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
