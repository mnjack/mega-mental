import { NextRequest, NextResponse } from "next/server";
import { breakdownTask } from "@/lib/claude";
import { createTask, getLatestCheckIn } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, taskDescription, detailLevel } = await req.json();

    // Validation
    if (!userId || !taskDescription) {
      return NextResponse.json(
        { error: "User ID and task description are required" },
        { status: 400 }
      );
    }

    if (!["high", "medium", "max"].includes(detailLevel)) {
      return NextResponse.json(
        { error: "Invalid detail level (must be high, medium, or max)" },
        { status: 400 }
      );
    }

    // Get user's latest check-in for context
    const checkIn = await getLatestCheckIn(userId);

    // Generate task breakdown using Claude
    const result = await breakdownTask({
      taskDescription,
      detailLevel,
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

    // Save task to database
    const task = await createTask({
      userId,
      title: taskDescription,
      breakdown: result.breakdown.steps,
      totalTimeEstimate: result.breakdown.total_time,
      detailLevel,
      hardestPart: result.breakdown.hardest_part,
    });

    return NextResponse.json({
      task,
      breakdown: result.breakdown,
      usage: result.usage,
    });
  } catch (error: any) {
    console.error("Task breakdown error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate task breakdown" },
      { status: 500 }
    );
  }
}
