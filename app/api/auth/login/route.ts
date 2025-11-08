import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await loginUser(email, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    // Don't send password hash to client
    const { password_hash, ...userWithoutPassword } = result.user!;

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login successful",
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
