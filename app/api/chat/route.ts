import { NextRequest, NextResponse } from "next/server";
import { chat, detectCrisisKeywords } from "@/lib/claude";
import {
  saveMessage,
  getUserMessages,
  getLatestCheckIn,
  updateUserLastActive,
} from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { message, userId, conversationId } = await req.json();

    // Validation
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Update user last active
    await updateUserLastActive(userId);

    // Get user's latest check-in for context
    const checkIn = await getLatestCheckIn(userId);

    // Get conversation history (last 10 messages)
    const history = await getUserMessages(userId, conversationId, 10);

    // Build messages array for Claude
    const messages = [
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    // Call Claude API
    const response = await chat({
      messages,
      checkIn: checkIn
        ? {
            mood_score: checkIn.mood_score,
            energy_level: checkIn.energy_level,
            anxiety_score: checkIn.anxiety_score,
            focus_capacity: checkIn.focus_capacity,
            sleep_hours: checkIn.sleep_hours || undefined,
          }
        : null,
    });

    // Save messages to database
    await saveMessage({
      userId,
      conversationId,
      role: "user",
      content: message,
      tokensUsed: response.usage.inputTokens,
    });

    await saveMessage({
      userId,
      conversationId,
      role: "assistant",
      content: response.message,
      tokensUsed: response.usage.outputTokens,
    });

    // Return response
    return NextResponse.json({
      message: response.message,
      crisisDetected: response.crisisDetected,
      usage: response.usage,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat message" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve conversation history
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const conversationId = searchParams.get("conversationId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const messages = await getUserMessages(
      userId,
      conversationId || undefined,
      limit
    );

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve messages" },
      { status: 500 }
    );
  }
}
