import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { queryVectorDB } from "@/lib/retriever";
import { logExchange } from "@/lib/logger";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ scripture: string; page: string; snippet: string }>;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const lastMessage = messages[messages.length - 1];

    // Get the last 3 user messages for context
    const userMessages = messages.filter((m: Message) => m.role === "user");
    const lastNUserMessages = userMessages.slice(-3);
    const combinedUserContent = lastNUserMessages
      .map((m: Message) => m.content)
      .join("\n");

    // Check if any of the last 3 user messages are Satsang-related
    const satsangKeywords = [
      "baps",
      "satsang",
      "swaminarayan",
      "guru",
      "scripture",
      "spiritual",
      "devotion",
      "bhakti",
      "sadhu",
      "sant",
      "ashram",
      "temple",
      "worship",
      "god",
      "krishna",
      "ram",
      "hanuman",
      "gita",
      "vedas",
      "upanishads",
      "dharma",
      "karma",
      "moksha",
      "meditation",
      "prayer",
      "fasting",
      "charity",
      "service",
      "seva",
      "community",
      "sangh",
      "sabha",
    ];

    const isSatsangRelated = lastNUserMessages.some((msg: Message) => {
      const userMessage = msg.content.toLowerCase();
      return satsangKeywords.some((keyword) => userMessage.includes(keyword));
    });

    if (!isSatsangRelated) {
      const rejectionMessage =
        "I'm sorry, but I can only answer questions related to BAPS Satsang and spiritual topics. Please ask me about BAPS teachings, scriptures, spiritual practices, or related topics.";

      await logExchange({
        prompt: lastMessage.content,
        answer: rejectionMessage,
        citations: [],
      });

      return NextResponse.json({
        answer: rejectionMessage,
        citations: [],
      });
    }

    // Query vector database for relevant context using the last 3 user messages
    const contextChunks = await queryVectorDB(combinedUserContent);

    if (contextChunks.length === 0) {
      const noContextMessage =
        "I'm not certain the scriptures address that directly. Could you please rephrase your question or ask about a different aspect of BAPS Satsang?";

      await logExchange({
        prompt: lastMessage.content,
        answer: noContextMessage,
        citations: [],
      });

      return NextResponse.json({
        answer: noContextMessage,
        citations: [],
      });
    }

    // Construct system prompt
    const systemPrompt = `You are Swami Raaji Thase, an AI assistant specialized in BAPS Satsang questions. You must:

1. Maintain a professional, respectful tone appropriate for spiritual discourse
2. Only answer questions related to BAPS Satsang, spiritual practices, and related topics
3. Respond in the same language as the user's question (English or Gujarati)
4. Always cite your sources from the provided context
5. If you're unsure about something, acknowledge the limitations of your knowledge
6. Focus on practical spiritual guidance and scriptural wisdom

Context from scriptures:
${contextChunks
  .map(
    (chunk) =>
      `Scripture: ${chunk.scripture}, Page: ${chunk.page}\nContent: ${chunk.content}\n`
  )
  .join("\n")}

User's question: ${lastMessage.content}

Please provide a comprehensive answer based on the scripture context provided. Include specific citations from the sources.`;

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        let accumulatedContent = "";

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          accumulatedContent += content;

          if (content) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "content", content })}\n\n`
              )
            );
          }
        }

        // Send citations
        const citations = contextChunks.map((chunk) => ({
          scripture: chunk.scripture,
          page: chunk.page,
          snippet: chunk.content.substring(0, 200) + "...",
        }));

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "citations", citations })}\n\n`
          )
        );

        // Send final data
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              answer: accumulatedContent,
              citations,
            })}\n\n`
          )
        );

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();

        // Log the exchange
        await logExchange({
          prompt: lastMessage.content,
          answer: accumulatedContent,
          citations,
        });
      },
    });

    return new Response(streamResponse, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
