import { sql } from "@vercel/postgres";

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  created_at: Date;
  last_active: Date | null;
  preferences: any;
  timezone: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  timestamp: Date;
  mood_score: number;
  energy_level: "low" | "medium" | "high";
  anxiety_score: number;
  focus_capacity: "low" | "medium" | "high";
  sleep_hours: number | null;
  sleep_quality: number | null;
  stressors: string[] | null;
  wins: string[] | null;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: Date;
  due_date: Date | null;
  status: "todo" | "in_progress" | "completed" | "abandoned";
  breakdown: any;
  total_time_estimate: number | null;
  detail_level: "high" | "medium" | "max" | null;
  hardest_part: string | null;
  completed_at: Date | null;
}

export interface Message {
  id: string;
  user_id: string;
  conversation_id: string | null;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tokens_used: number | null;
}

export interface GroundingSession {
  id: string;
  user_id: string;
  technique_used: string;
  anxiety_before: number | null;
  anxiety_after: number | null;
  duration_minutes: number | null;
  completed: boolean;
  timestamp: Date;
  notes: string | null;
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

export async function initializeDatabase() {
  try {
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_active TIMESTAMPTZ,
        preferences JSONB DEFAULT '{}'::jsonb,
        timezone VARCHAR(50) DEFAULT 'America/New_York'
      )
    `;

    // Check-ins table
    await sql`
      CREATE TABLE IF NOT EXISTS checkins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
        energy_level VARCHAR(10) CHECK (energy_level IN ('low', 'medium', 'high')),
        anxiety_score INTEGER CHECK (anxiety_score BETWEEN 1 AND 5),
        focus_capacity VARCHAR(10) CHECK (focus_capacity IN ('low', 'medium', 'high')),
        sleep_hours DECIMAL(3,1),
        sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
        stressors TEXT[],
        wins TEXT[]
      )
    `;

    // Tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        due_date DATE,
        status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'abandoned')),
        breakdown JSONB,
        total_time_estimate INTEGER,
        detail_level VARCHAR(10),
        hardest_part TEXT,
        completed_at TIMESTAMPTZ
      )
    `;

    // Messages table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        conversation_id UUID,
        role VARCHAR(10) CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        tokens_used INTEGER
      )
    `;

    // Grounding sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS grounding_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        technique_used VARCHAR(100),
        anxiety_before INTEGER CHECK (anxiety_before BETWEEN 1 AND 10),
        anxiety_after INTEGER CHECK (anxiety_after BETWEEN 1 AND 10),
        duration_minutes INTEGER,
        completed BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        notes TEXT
      )
    `;

    // Wins table
    await sql`
      CREATE TABLE IF NOT EXISTS wins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        win_description TEXT NOT NULL,
        win_category VARCHAR(50),
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        mood_boost INTEGER CHECK (mood_boost BETWEEN 1 AND 5)
      )
    `;

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function createUser(
  email: string,
  passwordHash: string,
  displayName?: string
): Promise<User> {
  const result = await sql`
    INSERT INTO users (email, password_hash, display_name)
    VALUES (${email}, ${passwordHash}, ${displayName || null})
    RETURNING *
  `;
  return result.rows[0] as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  return result.rows[0] as User | null;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id}
  `;
  return result.rows[0] as User | null;
}

export async function updateUserLastActive(userId: string): Promise<void> {
  await sql`
    UPDATE users SET last_active = NOW() WHERE id = ${userId}
  `;
}

// ============================================================================
// CHECK-IN OPERATIONS
// ============================================================================

export async function createCheckIn(data: {
  userId: string;
  moodScore: number;
  energyLevel: "low" | "medium" | "high";
  anxietyScore: number;
  focusCapacity: "low" | "medium" | "high";
  sleepHours?: number;
  sleepQuality?: number;
  stressors?: string[];
  wins?: string[];
}): Promise<CheckIn> {
  const result = await sql`
    INSERT INTO checkins (
      user_id, mood_score, energy_level, anxiety_score, focus_capacity,
      sleep_hours, sleep_quality, stressors, wins
    )
    VALUES (
      ${data.userId}, ${data.moodScore}, ${data.energyLevel},
      ${data.anxietyScore}, ${data.focusCapacity},
      ${data.sleepHours || null}, ${data.sleepQuality || null},
      ${data.stressors ? JSON.stringify(data.stressors) : null},
      ${data.wins ? JSON.stringify(data.wins) : null}
    )
    RETURNING *
  `;
  return result.rows[0] as CheckIn;
}

export async function getLatestCheckIn(userId: string): Promise<CheckIn | null> {
  const result = await sql`
    SELECT * FROM checkins
    WHERE user_id = ${userId}
    ORDER BY timestamp DESC
    LIMIT 1
  `;
  return result.rows[0] as CheckIn | null;
}

export async function getCheckInsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<CheckIn[]> {
  const result = await sql`
    SELECT * FROM checkins
    WHERE user_id = ${userId}
      AND timestamp >= ${startDate.toISOString()}
      AND timestamp <= ${endDate.toISOString()}
    ORDER BY timestamp DESC
  `;
  return result.rows as CheckIn[];
}

// ============================================================================
// TASK OPERATIONS
// ============================================================================

export async function createTask(data: {
  userId: string;
  title: string;
  description?: string;
  breakdown?: any;
  totalTimeEstimate?: number;
  detailLevel?: "high" | "medium" | "max";
  hardestPart?: string;
}): Promise<Task> {
  const result = await sql`
    INSERT INTO tasks (
      user_id, title, description, breakdown, total_time_estimate,
      detail_level, hardest_part
    )
    VALUES (
      ${data.userId}, ${data.title}, ${data.description || null},
      ${data.breakdown ? JSON.stringify(data.breakdown) : null},
      ${data.totalTimeEstimate || null}, ${data.detailLevel || null},
      ${data.hardestPart || null}
    )
    RETURNING *
  `;
  return result.rows[0] as Task;
}

export async function getUserTasks(
  userId: string,
  status?: Task["status"]
): Promise<Task[]> {
  if (status) {
    const result = await sql`
      SELECT * FROM tasks
      WHERE user_id = ${userId} AND status = ${status}
      ORDER BY created_at DESC
    `;
    return result.rows as Task[];
  } else {
    const result = await sql`
      SELECT * FROM tasks
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result.rows as Task[];
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: Task["status"]
): Promise<Task> {
  const completedAt = status === "completed" ? "NOW()" : "NULL";
  const result = await sql`
    UPDATE tasks
    SET status = ${status},
        completed_at = ${status === "completed" ? new Date() : null}
    WHERE id = ${taskId}
    RETURNING *
  `;
  return result.rows[0] as Task;
}

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

export async function saveMessage(data: {
  userId: string;
  conversationId?: string;
  role: "user" | "assistant";
  content: string;
  tokensUsed?: number;
}): Promise<Message> {
  const result = await sql`
    INSERT INTO messages (user_id, conversation_id, role, content, tokens_used)
    VALUES (
      ${data.userId}, ${data.conversationId || null}, ${data.role},
      ${data.content}, ${data.tokensUsed || null}
    )
    RETURNING *
  `;
  return result.rows[0] as Message;
}

export async function getUserMessages(
  userId: string,
  conversationId?: string,
  limit: number = 20
): Promise<Message[]> {
  if (conversationId) {
    const result = await sql`
      SELECT * FROM messages
      WHERE user_id = ${userId} AND conversation_id = ${conversationId}
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;
    return (result.rows as Message[]).reverse();
  } else {
    const result = await sql`
      SELECT * FROM messages
      WHERE user_id = ${userId}
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;
    return (result.rows as Message[]).reverse();
  }
}

// ============================================================================
// GROUNDING SESSION OPERATIONS
// ============================================================================

export async function createGroundingSession(data: {
  userId: string;
  techniqueUsed: string;
  anxietyBefore?: number;
}): Promise<GroundingSession> {
  const result = await sql`
    INSERT INTO grounding_sessions (user_id, technique_used, anxiety_before)
    VALUES (${data.userId}, ${data.techniqueUsed}, ${data.anxietyBefore || null})
    RETURNING *
  `;
  return result.rows[0] as GroundingSession;
}

export async function completeGroundingSession(
  sessionId: string,
  anxietyAfter: number,
  durationMinutes: number,
  notes?: string
): Promise<GroundingSession> {
  const result = await sql`
    UPDATE grounding_sessions
    SET completed = true,
        anxiety_after = ${anxietyAfter},
        duration_minutes = ${durationMinutes},
        notes = ${notes || null}
    WHERE id = ${sessionId}
    RETURNING *
  `;
  return result.rows[0] as GroundingSession;
}

// ============================================================================
// WINS OPERATIONS
// ============================================================================

export async function createWin(data: {
  userId: string;
  winDescription: string;
  winCategory?: string;
  moodBoost?: number;
}): Promise<any> {
  const result = await sql`
    INSERT INTO wins (user_id, win_description, win_category, mood_boost)
    VALUES (
      ${data.userId}, ${data.winDescription}, ${data.winCategory || null},
      ${data.moodBoost || null}
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function getUserWins(userId: string, limit: number = 50): Promise<any[]> {
  const result = await sql`
    SELECT * FROM wins
    WHERE user_id = ${userId}
    ORDER BY timestamp DESC
    LIMIT ${limit}
  `;
  return result.rows;
}
