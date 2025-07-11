import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  queryVectorDB,
  applyQueryGuardrails,
  evaluateRetrievalQuality,
} from "@/lib/retriever";
import { logExchange } from "@/lib/logger";
import { conversationManager } from "@/lib/conversation";
import {
  createQueryVariations,
  processQueryForRetrieval,
} from "@/lib/query-expansion";
import { trackQueryPerformance } from "@/lib/analytics";

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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

// Enhanced system prompt with robust citation requirements and BAPS-specific knowledge
const createSystemPrompt = (
  contextChunks: any[],
  conversationHistory: Message[]
) => {
  const contextText = contextChunks
    .map(
      (chunk) =>
        `Scripture: ${chunk.scripture}, Page: ${chunk.page}\nContent: ${chunk.content}\n`
    )
    .join("\n");

  const recentMessages = conversationHistory
    .slice(-6) // Last 6 messages for context
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  const conversationContext = conversationManager.getContextForQuery();

  return `You are Swami Raaji Thase, an AI assistant specialized in BAPS Satsang questions. You must:

1. **CRITICAL: Cite or Say "I Don't Know"** - You MUST either:
   - Cite specific sources from the provided scripture context, OR
   - Explicitly say "I don't have enough information from the scriptures to answer this question accurately"
   - NEVER make up information or provide answers without proper citations

2. **BAPS-Specific Knowledge**: Focus specifically on BAPS (Bochasanwasi Akshar Purushottam Swaminarayan Sanstha) and distinguish it from other Swaminarayan sects:
   - BAPS was established by Shastriji Maharaj (1860-1951)
   - Current guru is Pramukh Swami Maharaj (1921-2016) and now Mahant Swami Maharaj
   - Emphasizes Akshar-Purushottam philosophy
   - Known for systematic spiritual development and humanitarian work
   - Uses Vachanamrut and Shikshapatri as primary scriptures

3. **Maintain Spiritual Authenticity**: Respond with the wisdom and tone appropriate for spiritual discourse
4. **Language Consistency**: Respond in the same language as the user's question (English or Gujarati)
5. **Contextual Awareness**: Consider the conversation history when providing answers
6. **Practical Guidance**: Focus on practical spiritual advice and scriptural wisdom
7. **Honest Limitations**: Acknowledge when you're unsure about something

**Available Scripture Context:**
${contextText}

**Recent Conversation Context:**
${recentMessages}

${
  conversationContext
    ? `**Conversation Summary:**\n${conversationContext}\n`
    : ""
}

**BAPS-Specific Guidelines:**
- When discussing BAPS vs other sects, emphasize BAPS's unique philosophy and organizational structure
- Reference BAPS's emphasis on family values, community service, and systematic spiritual development
- Mention BAPS's global humanitarian work and educational programs
- Distinguish BAPS's approach from other Swaminarayan organizations
- Always cite BAPS-specific scriptures when available

**Response Guidelines:**
- ALWAYS cite specific sources from the scripture context provided
- If the context doesn't contain relevant information, say "I don't have enough information from the scriptures to answer this question accurately"
- Provide comprehensive answers based on the scripture context
- Include specific citations from the sources
- Maintain a respectful, spiritual tone
- Use the conversation history to provide more contextual responses
- If asked about topics not covered in the provided context, redirect to relevant spiritual topics or acknowledge limitations
- When discussing differences between sects, focus on factual, respectful comparisons`;
};

// Enhanced context processing with dynamic top_k
const processContext = (contextChunks: any[], userQuery: string) => {
  // Sort by relevance and remove duplicates
  const uniqueChunks = contextChunks.filter(
    (chunk, index, self) =>
      index ===
      self.findIndex(
        (c) => c.scripture === chunk.scripture && c.page === chunk.page
      )
  );

  // Prioritize chunks with higher similarity scores
  const sortedChunks = uniqueChunks.sort((a, b) => b.similarity - a.similarity);

  // Dynamic top_k based on query complexity and available context
  const queryComplexity = userQuery.split(" ").length;
  const maxChunks = Math.min(8, Math.max(3, Math.floor(queryComplexity / 2)));
  const limitedChunks = sortedChunks.slice(0, maxChunks);

  return limitedChunks;
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { messages } = await request.json();
    const lastMessage = messages[messages.length - 1];

    // Apply query guardrails
    const sanitizedQuery = applyQueryGuardrails(lastMessage.content);

    // Add user message to conversation manager
    conversationManager.addMessage({
      role: "user",
      content: sanitizedQuery,
    });

    // Get the last 3 user messages for context
    const userMessages = messages.filter((m: Message) => m.role === "user");
    const lastNUserMessages = userMessages.slice(-3);
    const combinedUserContent = lastNUserMessages
      .map((m: Message) => m.content)
      .join("\n");

    if (!sanitizedQuery || sanitizedQuery.trim() === "") {
      const rejectionMessage =
        "Please enter a question about BAPS Satsang, scriptures, or spiritual topics.";

      await logExchange({
        prompt: sanitizedQuery,
        answer: rejectionMessage,
        citations: [],
      });

      return NextResponse.json({
        answer: rejectionMessage,
        citations: [],
      });
    }

    // Process query for better retrieval
    const processedQuery = processQueryForRetrieval(combinedUserContent);
    const queryVariations = createQueryVariations(processedQuery);

    // Query vector database with enhanced retrieval options
    let allContextChunks: any[] = [];

    // Try the original query first with dynamic top_k
    const primaryResults = await queryVectorDB(processedQuery, {
      topK: 6,
      similarityThreshold: 0.2,
      useHybridSearch: true,
      useReranking: true,
      useCache: true,
    });
    allContextChunks.push(...primaryResults);

    // Try query variations if primary results are insufficient
    if (primaryResults.length < 3) {
      for (const variation of queryVariations.slice(1, 3)) {
        const variationResults = await queryVectorDB(variation, {
          topK: 4,
          similarityThreshold: 0.1,
          useHybridSearch: true,
          useReranking: true,
          useCache: true,
        });
        allContextChunks.push(...variationResults);
      }
    }

    // Remove duplicates and get best results
    const uniqueChunks = allContextChunks.filter(
      (chunk, index, self) => index === self.findIndex((c) => c.id === chunk.id)
    );
    const contextChunks = uniqueChunks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 8);

    // Evaluate retrieval quality
    evaluateRetrievalQuality(sanitizedQuery, contextChunks);

    if (contextChunks.length === 0) {
      const noContextMessage =
        "I don't have enough information from the scriptures to answer this question accurately. Could you please rephrase your question or ask about a different aspect of BAPS Satsang?";

      // Track failed query
      trackQueryPerformance(sanitizedQuery, Date.now() - startTime, [], 0);

      await logExchange({
        prompt: sanitizedQuery,
        answer: noContextMessage,
        citations: [],
      });

      return NextResponse.json({
        answer: noContextMessage,
        citations: [],
      });
    }

    // Process and enhance context
    const processedContext = processContext(contextChunks, sanitizedQuery);

    // Construct enhanced system prompt
    const systemPrompt = createSystemPrompt(processedContext, messages);

    // Create streaming response with enhanced parameters
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      temperature: 0.7,
      max_tokens: 1500,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
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

        // Send enhanced citations with relevance scores
        const citations = processedContext.map((chunk) => ({
          scripture: chunk.scripture,
          page: chunk.page,
          snippet: chunk.content.substring(0, 200) + "...",
          relevance: chunk.similarity,
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

        // Add assistant response to conversation manager
        conversationManager.addMessage({
          role: "assistant",
          content: accumulatedContent,
          citations,
        });

        // Track successful query performance
        trackQueryPerformance(
          sanitizedQuery,
          Date.now() - startTime,
          contextChunks,
          citations.length
        );

        // Log the exchange
        await logExchange({
          prompt: sanitizedQuery,
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

    // Track failed query
    trackQueryPerformance("ERROR", Date.now() - startTime, [], 0);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
