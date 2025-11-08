# MERIDIAN Quick Start Guide

Get MERIDIAN running locally in 5 minutes!

---

## Prerequisites

- Node.js 18+ installed
- Anthropic API key ([get one free](https://console.anthropic.com/))
- Vercel account (for database)

---

## Quick Setup

### 1. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up / Log in
3. Go to **"API Keys"**
4. Click **"Create Key"**
5. Copy your key: `sk-ant-xxxxxxxxxxxxx`

### 2. Create Vercel Postgres Database

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Go to **Storage** → **Create Database** → **Postgres**
4. Name it `meridian-db`
5. Click **"Connect to Project"**
6. Go to **.env.local** tab
7. Copy all `POSTGRES_*` variables

**Option B: Local Development (SQLite - Not Included)**
For local dev without Vercel, you'd need to set up a local Postgres instance.

### 3. Clone & Install

```bash
git clone <your-repo-url>
cd mega-mental
npm install
```

### 4. Environment Variables

```bash
# Copy example
cp .env.example .env.local

# Edit .env.local
nano .env.local  # or use your editor
```

Add your keys:
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Paste the POSTGRES_* variables from Vercel:
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## First Use

1. **App Auto-Opens**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Automatically redirects to dashboard
   - No sign-up needed!

2. **Complete Check-In**
   - Click "📊 Check-In" button
   - Set your mood, energy, anxiety, focus
   - Click "Save Check-In"

3. **Start Chatting**
   - Type a message or click a Quick Action
   - Try: "I need help breaking down a task"
   - MERIDIAN will respond with compassionate, evidence-based support

4. **Test Features**
   - **Task Breakdown:** "I need to write a report but feel overwhelmed"
   - **Grounding:** "I'm feeling anxious right now"
   - **Affirmation:** "I need some encouragement"
   - **Crisis:** "I'm in crisis" (will show crisis resources)

---

## Verify It's Working

### Check Prompt Caching

Open browser console (F12) → Network tab → Send a message

**Look for:**
- First message: Higher cost
- Second message: Much lower cost (90% off!)

**In terminal output:**
```bash
Usage: {
  inputTokens: 15234,
  cacheReadTokens: 14000,  # ← Should be high after first message!
  cacheCreationTokens: 0
}
```

If `cacheReadTokens` is 0 after the first message, caching isn't working!

### Check Database

Send a message, then:

**Via Vercel:**
1. Go to Storage → Your database → Query
2. Run: `SELECT * FROM messages LIMIT 5;`
3. Should see your messages!

---

## Common Issues

### "Failed to load modules"

```bash
rm -rf node_modules package-lock.json
npm install
```

### "Database connection failed"

- Check `.env.local` has all `POSTGRES_*` variables
- No extra spaces or quotes
- Restart dev server: `Ctrl+C` then `npm run dev`

### "Anthropic API error"

- Verify API key is correct
- Check you have credits: [console.anthropic.com](https://console.anthropic.com/)
- Key format: `sk-ant-` followed by long string

### Chat not responding

- Check terminal for errors
- Check browser console (F12)
- Verify `prompts/CLAUDE_MEGA_SYSTEM_PROMPT_ExecutiveFunctionCoach.md` exists

---

## Development Tips

### Hot Reload

Changes auto-reload! Just save files and browser refreshes.

### View Logs

**Server logs:** Check terminal where `npm run dev` is running
**Client logs:** Browser console (F12)

### Test Different States

Change check-in values to test different coaching approaches:
- **Low mood + low energy** → Gentler language, smaller tasks
- **High anxiety** → More grounding techniques offered
- **Good mood + high energy** → More ambitious goal suggestions

### Database Exploration

**Via Vercel Dashboard:**
1. Storage → Database → Query tab
2. Run SQL queries to inspect data

**Example queries:**
```sql
-- See all users
SELECT * FROM users;

-- See recent check-ins
SELECT * FROM checkins ORDER BY timestamp DESC LIMIT 10;

-- See conversation history
SELECT role, content FROM messages ORDER BY timestamp DESC LIMIT 20;

-- See task breakdowns
SELECT title, breakdown FROM tasks;
```

---

## Project Structure

```
mega-mental/
├── app/
│   ├── api/              # API routes
│   │   ├── chat/         # Main chat endpoint
│   │   ├── checkin/      # Daily check-in
│   │   └── tasks/        # Task breakdown
│   ├── dashboard/        # Main app interface
│   └── page.tsx          # Auto-redirects to dashboard
├── lib/
│   ├── claude.ts         # Claude API integration
│   └── db.ts             # Database operations
├── prompts/
│   └── CLAUDE_MEGA_SYSTEM_PROMPT_ExecutiveFunctionCoach.md
└── .env.local            # Your environment variables
```

---

## Next Steps

### Customize the Bot

Edit `prompts/CLAUDE_MEGA_SYSTEM_PROMPT_ExecutiveFunctionCoach.md` to:
- Add more therapy techniques
- Adjust personality/tone
- Add domain-specific knowledge

**Note:** Large changes may affect caching!

### Add Features

Ideas from the roadmap:
- More grounding techniques (25+ total)
- Affirmations library
- Progress tracking charts
- Wins celebration
- Body doubling mode
- Export data

### Deploy to Production

See `DEPLOYMENT.md` for Vercel deployment guide!

---

## Testing Checklist

Before deploying, test:

- [ ] App loads and redirects to dashboard
- [ ] Check-in saves and loads
- [ ] Chat messages send and receive
- [ ] Claude responses are contextual
- [ ] Task breakdown generates valid JSON
- [ ] Crisis keywords trigger alert
- [ ] Conversation history persists
- [ ] Mobile responsive (resize browser)

---

## Cost Monitoring

### Track Your Usage

**Anthropic Console:**
- [console.anthropic.com](https://console.anthropic.com/) → Usage
- Set up billing alerts
- Monitor daily spend

**Expected costs (local dev):**
- Testing (50-100 messages): ~$5-10
- With caching: ~$0.50-1.00

### Optimize Costs

1. **Use prompt caching** ✅ (already implemented)
2. Limit max_tokens when possible
3. Clear old conversations periodically
4. Use shorter check-in intervals

---

## Get Help

- **Documentation:** See `README.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Issues:** Check GitHub Issues
- **API Docs:** [docs.anthropic.com](https://docs.anthropic.com/)

---

## You're Ready! 🚀

Start MERIDIAN and begin helping people with executive function, anxiety, depression, and self-esteem challenges!

**Remember:** MERIDIAN is a supportive tool, not professional therapy. Always include crisis resources and disclaimers.

Have fun building! 💜
