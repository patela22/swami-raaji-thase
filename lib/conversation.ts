export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: Array<{
    scripture: string;
    page: string;
    snippet: string;
    relevance?: number;
  }>;
}

export interface ConversationContext {
  messages: ConversationMessage[];
  summary?: string;
  topics: string[];
  lastUpdated: Date;
}

export class ConversationManager {
  private context: ConversationContext;
  private maxMessages: number = 20; // Keep last 20 messages
  private maxTokens: number = 8000; // Approximate token limit

  constructor() {
    this.context = {
      messages: [],
      topics: [],
      lastUpdated: new Date(),
    };
  }

  addMessage(message: Omit<ConversationMessage, "timestamp">): void {
    const newMessage: ConversationMessage = {
      ...message,
      timestamp: new Date(),
    };

    this.context.messages.push(newMessage);
    this.context.lastUpdated = new Date();

    // Maintain conversation size
    this.trimConversation();

    // Update topics
    this.updateTopics();
  }

  private trimConversation(): void {
    if (this.context.messages.length > this.maxMessages) {
      // Keep the most recent messages
      this.context.messages = this.context.messages.slice(-this.maxMessages);
    }

    // Estimate tokens and trim if needed
    const estimatedTokens = this.estimateTokens();
    if (estimatedTokens > this.maxTokens) {
      // Remove oldest messages until we're under the limit
      while (
        this.context.messages.length > 5 &&
        this.estimateTokens() > this.maxTokens
      ) {
        this.context.messages.shift();
      }
    }
  }

  private estimateTokens(): number {
    // Rough estimation: 1 token ≈ 4 characters
    const totalChars = this.context.messages.reduce(
      (sum, msg) => sum + msg.content.length,
      0
    );
    return Math.ceil(totalChars / 4);
  }

  private updateTopics(): void {
    // Extract key topics from recent messages
    const recentContent = this.context.messages
      .slice(-5)
      .map((msg) => msg.content)
      .join(" ");

    // Simple topic extraction (could be enhanced with NLP)
    const topics = this.extractTopics(recentContent);
    this.context.topics = topics.slice(0, 5); // Keep top 5 topics
  }

  private extractTopics(text: string): string[] {
    const commonTopics = [
      "satsang",
      "scripture",
      "spiritual",
      "bhakti",
      "devotion",
      "guru",
      "swami",
      "maharaj",
      "bhagwan",
      "swaminarayan",
      "meditation",
      "prayer",
      "worship",
      "karma",
      "dharma",
      "moksha",
      "liberation",
      "enlightenment",
      "consciousness",
      "sadhu",
      "sant",
      "ashram",
      "temple",
      "mandir",
    ];

    const words = text.toLowerCase().split(/\s+/);
    const topicCounts: { [key: string]: number } = {};

    words.forEach((word) => {
      const cleanWord = word.replace(/[^\w]/g, "");
      if (commonTopics.includes(cleanWord)) {
        topicCounts[cleanWord] = (topicCounts[cleanWord] || 0) + 1;
      }
    });

    return Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([topic]) => topic);
  }

  getRecentMessages(count: number = 10): ConversationMessage[] {
    return this.context.messages.slice(-count);
  }

  getConversationSummary(): string {
    if (this.context.messages.length === 0) return "";

    const recentMessages = this.getRecentMessages(5);
    const userMessages = recentMessages.filter((msg) => msg.role === "user");

    if (userMessages.length === 0) return "";

    // Create a simple summary of recent user questions
    const questions = userMessages.map((msg) => msg.content).join("; ");
    return `Recent conversation focused on: ${questions}`;
  }

  getContextForQuery(): string {
    const summary = this.getConversationSummary();
    const topics = this.context.topics.join(", ");

    let context = "";
    if (summary) context += `Conversation context: ${summary}\n`;
    if (topics) context += `Relevant topics: ${topics}\n`;

    return context;
  }

  clear(): void {
    this.context = {
      messages: [],
      topics: [],
      lastUpdated: new Date(),
    };
  }

  getContext(): ConversationContext {
    return { ...this.context };
  }
}

// Global conversation manager instance
export const conversationManager = new ConversationManager();
