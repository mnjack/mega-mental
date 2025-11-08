import bcrypt from "bcryptjs";
import { getUserByEmail, createUser, User } from "./db";

// Password hashing
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// User registration
export async function registerUser(
  email: string,
  password: string,
  displayName?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Invalid email format" };
    }

    // Validate password strength
    if (password.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters",
      };
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash, displayName);

    return { success: true, user };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed" };
  }
}

// User login
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Login failed" };
  }
}

// Session management (simple JWT-like approach)
export interface SessionData {
  userId: string;
  email: string;
  displayName: string | null;
}

// For now, we'll use a simple approach. In production, use proper JWT or NextAuth
export function createSession(user: User): SessionData {
  return {
    userId: user.id,
    email: user.email,
    displayName: user.display_name,
  };
}
