import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Load the mega system prompt (cached at module level)
let SYSTEM_PROMPT: string | null = null;

function getSystemPrompt(): string {
  if (!SYSTEM_PROMPT) {
    const promptPath = path.join(
      process.cwd(),
      "prompts",
      "CLAUDE_MEGA_SYSTEM_PROMPT_ExecutiveFunctionCoach.md"
    );
    SYSTEM_PROMPT = fs.readFileSync(promptPath, "utf-8");
  }
  return SYSTEM_PROMPT;
}

// User context builder
interface CheckInData {
  mood_score: number;
  energy_level: "low" | "medium" | "high";
  anxiety_score: number;
  focus_capacity: "low" | "medium" | "high";
  sleep_hours?: number;
}

function buildUserContext(checkIn: CheckInData | null): string {
  if (!checkIn) {
    return "No recent check-in data available. Ask user about their current state.";
  }

  const moodLabel =
    checkIn.mood_score <= 2
      ? "Low/struggling"
      : checkIn.mood_score === 3
      ? "Okay/neutral"
      : "Good/positive";

  let adjustments: string[] = [];

  if (checkIn.mood_score <= 2 && checkIn.energy_level === "low") {
    adjustments.push(
      "- User is in low mood/energy state. Prioritize behavioral activation. Use gentler language. Suggest smaller tasks."
    );
  }

  if (checkIn.anxiety_score >= 4) {
    adjustments.push(
      "- User is experiencing high anxiety. Offer grounding techniques. Use ACT acceptance. Be especially validating."
    );
  }

  if (checkIn.focus_capacity === "low") {
    adjustments.push(
      "- User has low executive function today. Break tasks into micro-steps. Offer body doubling. Maximum detail in breakdowns."
    );
  }

  if (checkIn.mood_score >= 4 && checkIn.energy_level === "high") {
    adjustments.push(
      "- User has good energy and mood! Celebrate this. Leverage momentum. Suggest tackling bigger goals."
    );
  }

  return `
# Current User State (from recent check-in)

Mood: ${checkIn.mood_score}/5 (${moodLabel})
Energy: ${checkIn.energy_level}
Anxiety: ${checkIn.anxiety_score}/5
Focus: ${checkIn.focus_capacity}
${checkIn.sleep_hours ? `Sleep: ${checkIn.sleep_hours} hours` : ""}

# Coaching Adjustments

${adjustments.length > 0 ? adjustments.join("\n") : "User seems to be in a balanced state."}

Tailor your coaching based on their current capacity and state.
  `.trim();
}

// Crisis keyword detection
const CRISIS_KEYWORDS = [
  "want to die",
  "kill myself",
  "end it all",
  "hurt myself",
  "suicide",
  "no point living",
  "better off dead",
  "end my life",
  "can't go on",
  "want to disappear forever",
];

export function detectCrisisKeywords(message: string): boolean {
  const lower = message.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

// Main chat function
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  checkIn?: CheckInData | null;
  maxTokens?: number;
}

export interface ChatResponse {
  message: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
  };
  crisisDetected: boolean;
}

export async function chat(options: ChatOptions): Promise<ChatResponse> {
  const { messages, checkIn = null, maxTokens = 2048 } = options;

  // Check last user message for crisis keywords
  const lastUserMessage = messages
    .filter((m) => m.role === "user")
    .pop()?.content;
  const crisisDetected = lastUserMessage
    ? detectCrisisKeywords(lastUserMessage)
    : false;

  // Build system prompt with caching
  const systemPrompt = getSystemPrompt();
  const userContext = buildUserContext(checkIn);

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: maxTokens,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" }, // ← CRITICAL FOR COST SAVINGS!
        },
        {
          type: "text",
          text: userContext,
        },
      ],
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return {
      message: response.content[0].type === "text" ? response.content[0].text : "",
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheCreationTokens: response.usage.cache_creation_input_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens,
      },
      crisisDetected,
    };
  } catch (error: any) {
    console.error("Claude API Error:", error);
    throw new Error(
      error.status === 429
        ? "Too many requests. Please try again in a moment."
        : error.status === 529
        ? "Service temporarily overloaded. Please try again."
        : "Failed to get response from AI assistant."
    );
  }
}

// Task breakdown specific function
export interface TaskBreakdownOptions {
  taskDescription: string;
  detailLevel: "high" | "medium" | "max";
  checkIn?: CheckInData | null;
}

export async function breakdownTask(options: TaskBreakdownOptions) {
  const { taskDescription, detailLevel, checkIn } = options;

  const detailLevelDescriptions = {
    high: "4-6 high-level steps",
    medium: "8-12 medium-detail steps",
    max: "15-20 micro-steps (for severe executive dysfunction)",
  };

  const taskPrompt = `
The user needs help breaking down this task: "${taskDescription}"

Detail level requested: ${detailLevel} (${detailLevelDescriptions[detailLevel]})

Provide a task breakdown using the STM framework (Steps, Time, Mapping).

Return your response in this JSON format:
{
  "steps": [
    {"number": 1, "description": "...", "time_minutes": 10},
    {"number": 2, "description": "...", "time_minutes": 15}
  ],
  "total_time": 60,
  "hardest_part": "What feels hardest about this task",
  "strategy_for_hardest": "Specific strategy to help with the hardest part",
  "lowest_barrier_start": "The absolute easiest first step to begin",
  "encouragement": "Brief encouraging message"
}

Make sure all JSON is valid and properly formatted.
  `.trim();

  const response = await chat({
    messages: [{ role: "user", content: taskPrompt }],
    checkIn,
    maxTokens: 2048,
  });

  try {
    // Extract JSON from response (might have markdown code blocks)
    const jsonMatch = response.message.match(/```json\n?([\s\S]*?)\n?```/) ||
                     response.message.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const jsonString = jsonMatch[1] || jsonMatch[0];
    const breakdown = JSON.parse(jsonString);

    return {
      breakdown,
      usage: response.usage,
    };
  } catch (error) {
    console.error("Failed to parse task breakdown:", error);
    // Fallback: return raw response
    return {
      breakdown: {
        steps: [],
        total_time: 0,
        hardest_part: "Unable to parse breakdown",
        strategy_for_hardest: response.message,
        lowest_barrier_start: "Try breaking this down manually",
        encouragement: "Let's work through this together step by step.",
      },
      usage: response.usage,
    };
  }
}
