import { NextRequest, NextResponse } from "next/server";
import { createCheckIn, getLatestCheckIn, getCheckInsByDateRange } from "@/lib/db";

// POST - Create new check-in
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      userId,
      moodScore,
      energyLevel,
      anxietyScore,
      focusCapacity,
      sleepHours,
      sleepQuality,
      stressors,
      wins,
    } = data;

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (
      moodScore === undefined ||
      moodScore < 1 ||
      moodScore > 5 ||
      anxietyScore === undefined ||
      anxietyScore < 1 ||
      anxietyScore > 5
    ) {
      return NextResponse.json(
        { error: "Invalid mood or anxiety score (must be 1-5)" },
        { status: 400 }
      );
    }

    if (!["low", "medium", "high"].includes(energyLevel)) {
      return NextResponse.json(
        { error: "Invalid energy level" },
        { status: 400 }
      );
    }

    if (!["low", "medium", "high"].includes(focusCapacity)) {
      return NextResponse.json(
        { error: "Invalid focus capacity" },
        { status: 400 }
      );
    }

    // Create check-in
    const checkIn = await createCheckIn({
      userId,
      moodScore,
      energyLevel,
      anxietyScore,
      focusCapacity,
      sleepHours,
      sleepQuality,
      stressors,
      wins,
    });

    return NextResponse.json({ checkIn }, { status: 201 });
  } catch (error: any) {
    console.error("Check-in creation error:", error);
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}

// GET - Get check-in(s)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") || "latest"; // 'latest' or 'range'
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (type === "latest") {
      const checkIn = await getLatestCheckIn(userId);
      return NextResponse.json({ checkIn });
    } else if (type === "range") {
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: "Start date and end date required for range query" },
          { status: 400 }
        );
      }

      const checkIns = await getCheckInsByDateRange(
        userId,
        new Date(startDate),
        new Date(endDate)
      );

      return NextResponse.json({ checkIns });
    } else {
      return NextResponse.json({ error: "Invalid query type" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Get check-in error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve check-in" },
      { status: 500 }
    );
  }
}
