"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Personal use - hardcoded user ID (no authentication needed)
const PERSONAL_USER_ID = "personal-user-001";

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check-in state
  const [moodScore, setMoodScore] = useState(3);
  const [energyLevel, setEnergyLevel] = useState<"low" | "medium" | "high">("medium");
  const [anxietyScore, setAnxietyScore] = useState(3);
  const [focusCapacity, setFocusCapacity] = useState<"low" | "medium" | "high">("medium");
  const [sleepHours, setSleepHours] = useState<number>(7);

  useEffect(() => {
    // Load chat history on mount
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat?userId=${PERSONAL_USER_ID}&limit=20`);
      const data = await response.json();

      if (data.messages) {
        setMessages(
          data.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    setCrisisAlert(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          userId: PERSONAL_USER_ID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);

      if (data.crisisDetected) {
        setCrisisAlert(true);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: PERSONAL_USER_ID,
          moodScore,
          energyLevel,
          anxietyScore,
          focusCapacity,
          sleepHours,
        }),
      });

      if (response.ok) {
        setShowCheckIn(false);
        // Add a message to chat
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Thanks for checking in! I can see you're feeling ${
              moodScore <= 2 ? "a bit low" : moodScore >= 4 ? "pretty good" : "okay"
            } today with ${energyLevel} energy. I'll tailor my support based on your current state. How can I help you today?`,
          },
        ]);
      }
    } catch (error) {
      console.error("Check-in error:", error);
    }
  };

  const quickActions = [
    { icon: "🎯", label: "Task Help", message: "I need help breaking down a task" },
    { icon: "🌬️", label: "Ground Me", message: "I'm feeling anxious and need to ground myself" },
    { icon: "💎", label: "Affirmation", message: "I need some encouragement" },
    { icon: "🆘", label: "Crisis", message: "I'm in crisis and need immediate help" },
  ];

  const handleQuickAction = (message: string) => {
    setInput(message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Crisis Alert */}
      {crisisAlert && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-4 z-50">
          <div className="max-w-4xl mx-auto">
            <p className="font-bold mb-2">🆘 Crisis Resources</p>
            <p className="text-sm">
              <strong>988</strong> - Suicide & Crisis Lifeline |{" "}
              <strong>Text 741741</strong> - Crisis Text Line |{" "}
              <strong>911</strong> - Emergency
            </p>
            <button
              onClick={() => setCrisisAlert(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              MERIDIAN
            </h1>
            <p className="text-sm text-gray-600">
              Your Personal Executive Function Coach
            </p>
          </div>
          <div>
            <button
              onClick={() => setShowCheckIn(!showCheckIn)}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              📊 Check-In
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-100px)]">
        {/* Sidebar - Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h2 className="font-bold text-gray-800 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.message)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors text-left"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              ⚠️ This is supportive coaching, not professional therapy. In
              crisis, call 988.
            </p>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg flex flex-col h-full">
          {/* Check-In Modal */}
          {showCheckIn && (
            <div className="p-6 border-b border-gray-200 bg-purple-50">
              <h3 className="font-bold text-gray-800 mb-4">
                Daily Check-In ☀️
              </h3>
              <form onSubmit={handleCheckIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood (1=Low, 5=Great): {moodScore}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={moodScore}
                    onChange={(e) => setMoodScore(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energy Level
                  </label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setEnergyLevel(level)}
                        className={`flex-1 py-2 rounded-lg font-medium capitalize ${
                          energyLevel === level
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anxiety (1=Low, 5=High): {anxietyScore}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={anxietyScore}
                    onChange={(e) => setAnxietyScore(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Focus Capacity
                  </label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFocusCapacity(level)}
                        className={`flex-1 py-2 rounded-lg font-medium capitalize ${
                          focusCapacity === level
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Hours: {sleepHours}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                  >
                    Save Check-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCheckIn(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <div className="text-4xl mb-4">👋</div>
                <h2 className="text-xl font-bold mb-2">
                  Welcome to MERIDIAN!
                </h2>
                <p className="text-sm">
                  I'm here to help you with executive function, anxiety,
                  depression, and self-esteem challenges.
                </p>
                <p className="text-sm mt-2">
                  Try clicking a quick action or just tell me what's on your
                  mind.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
