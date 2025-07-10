import { supabase } from "./supabase";

export interface LogEntry {
  prompt: string;
  answer: string;
  citations: Array<{
    scripture: string;
    page: string;
    snippet: string;
  }>;
}

export async function logExchange(logEntry: LogEntry) {
  try {
    const { error } = await supabase.from("logs").insert({
      prompt: logEntry.prompt,
      answer: logEntry.answer,
      citations: logEntry.citations,
    });

    if (error) {
      console.error("Error logging exchange:", error);
    } else {
      console.log("Successfully logged exchange");
    }
  } catch (error) {
    console.error("Error in logExchange:", error);
  }
}
