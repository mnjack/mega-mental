import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await registerUser(email, password, displayName);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Don't send password hash to client
    const { password_hash, ...userWithoutPassword } = result.user!;

    return NextResponse.json(
      { user: userWithoutPassword, message: "Registration successful" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
