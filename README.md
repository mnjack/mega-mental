# MERIDIAN - Your Personal Executive Function Coach

![MERIDIAN](https://img.shields.io/badge/MERIDIAN-Mental%20Health%20Coach-purple)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Claude](https://img.shields.io/badge/Claude-3.5%20Sonnet-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

**MERIDIAN** is your personal AI-powered mental health coaching companion built with Claude 3.5 Sonnet. It provides evidence-based support for:

- 🎯 **Executive Function & ADHD** - Task breakdown, planning, and completion strategies
- 🌬️ **Anxiety Management** - Grounding techniques, crisis support
- 💎 **Depression Support** - Behavioral activation, self-compassion
- ⭐ **Self-Esteem Building** - CBT techniques, affirmations

**🏠 Personal Use** - This is designed as a personal tool, not a public-facing app. No sign-up or authentication needed!

## ⚠️ Important Disclaimer

**MERIDIAN is NOT:**
- Professional therapy
- Medical advice
- Crisis intervention
- A substitute for professional mental health treatment

**MERIDIAN IS:**
- Your personal supportive coaching companion
- Evidence-based techniques available 24/7
- A complement to therapy (not a replacement)
- Practical strategy guidance

**In Crisis?**
- 🆘 **Call 988** (US Suicide & Crisis Lifeline)
- 📱 **Text 741741** (Crisis Text Line)
- 🚨 **Call 911** or go to nearest emergency room

---

## 🚀 Features

### ✅ Ready to Use

1. **Chat with Claude AI Coach**
   - Real-time conversation with compassionate AI
   - Context-aware responses based on your state
   - Crisis keyword detection with immediate resources

2. **Daily Check-In System**
   - Track mood, energy, anxiety, focus, sleep
   - Personalized coaching based on current state
   - Historical data for progress tracking

3. **Task Breakdown (STM Framework)**
   - Break overwhelming tasks into manageable steps
   - Time estimates for each step
   - Identify lowest-barrier entry points
   - Customizable detail levels (high/medium/max)

4. **Grounding Techniques**
   - 5-4-3-2-1 sensory method
   - Box breathing
   - Crisis resources

5. **Quick Actions**
   - One-click access to common needs
   - Task help, grounding, affirmations, crisis

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **AI:** Anthropic Claude 3.5 Sonnet with **prompt caching**
- **Database:** Vercel Postgres
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## 📦 Quick Setup

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Vercel account (for database)

### Installation

1. **Clone and install:**
   ```bash
   cd mega-mental
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```bash
   # Get from https://console.anthropic.com/
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

   # Get these from Vercel after creating a Postgres database
   POSTGRES_URL=
   POSTGRES_PRISMA_URL=
   POSTGRES_URL_NON_POOLING=
   POSTGRES_USER=
   POSTGRES_HOST=
   POSTGRES_PASSWORD=
   POSTGRES_DATABASE=
   ```

3. **Create Vercel Postgres Database:**
   - Go to [vercel.com](https://vercel.com)
   - Create a new project (or use existing)
   - Go to **Storage** → **Create Database** → **Postgres**
   - Copy the connection strings to `.env.local`

4. **Run locally:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

That's it! No sign-up needed - just start using it!

---

## 🌐 Deploy to Vercel (Optional)

Want to access MERIDIAN from anywhere?

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "My personal MERIDIAN instance"
   git push
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Add your `ANTHROPIC_API_KEY` to environment variables
   - The database is already connected!
   - Deploy!

3. **Access from anywhere:**
   - Your app will be at: `your-app-name.vercel.app`
   - Use it on your phone, tablet, or any device!

---

## 💰 Cost Information

### Prompt Caching = 90% Savings ✅

The mega system prompt is ~15,000 tokens. With prompt caching:

**Per conversation (10 messages):** ~$0.50-1.00 ✅
**Per day (heavy use, 5 conversations):** ~$2.50-5.00
**Per month:** ~$75-150

**Without caching it would be:** ~$50-80 per day! 💸

### How to Monitor Costs

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Check **Usage** tab
3. Set up billing alerts
4. Monitor daily spend

### Reduce Costs

- Use check-in system (tailors responses to be more efficient)
- Clear old conversations occasionally
- The caching is already optimized!

---

## 📁 Project Structure

```
mega-mental/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Main chat endpoint
│   │   ├── checkin/route.ts       # Daily check-in
│   │   └── tasks/breakdown/route.ts # Task breakdown
│   ├── dashboard/page.tsx         # Main app interface
│   └── page.tsx                   # Redirects to dashboard
├── lib/
│   ├── claude.ts                  # Claude API integration
│   └── db.ts                      # Database operations
├── prompts/
│   └── CLAUDE_MEGA_SYSTEM_PROMPT_ExecutiveFunctionCoach.md
└── .env.local                     # Your configuration
```

---

## 🧠 How MERIDIAN Works

### The Mega System Prompt

`prompts/CLAUDE_MEGA_SYSTEM_PROMPT_ExecutiveFunctionCoach.md` contains:
- Bot personality and values (~15,000 tokens)
- Evidence-based therapy techniques from 29 sources
- Crisis response protocols
- Coaching scripts and examples

### Context Awareness

For each conversation, MERIDIAN considers:
- Your latest check-in data (mood, energy, anxiety, focus)
- Recent conversation history
- Crisis keyword detection

This allows responses tailored to your current state.

### Therapeutic Approaches

MERIDIAN integrates:
- **Behavioral Activation** - Action creates motivation
- **CBT** - Challenge negative thoughts
- **ACT** - Acceptance + values-based action
- **DBT** - Distress tolerance, grounding
- **CFT** - Self-compassion, soothing
- **Motivational Interviewing** - Evoke intrinsic motivation
- **Executive Function Coaching** - STM framework

---

## 🎯 How to Use MERIDIAN

### Daily Routine

1. **Morning Check-In**
   - Click "📊 Check-In"
   - Set your mood, energy, anxiety, focus, sleep
   - MERIDIAN adapts to your current state

2. **Throughout the Day**
   - Use Quick Actions for common needs
   - Chat about what's on your mind
   - Break down overwhelming tasks
   - Ground yourself when anxious

3. **End of Day**
   - Reflect on wins (even small ones!)
   - Set intentions for tomorrow
   - Use grounding if needed

### Quick Actions Explained

- **🎯 Task Help** - Break down overwhelming tasks into tiny steps
- **🌬️ Ground Me** - 5-4-3-2-1 grounding for anxiety
- **💎 Affirmation** - Get encouragement and validation
- **🆘 Crisis** - Immediate access to crisis resources

### Example Conversations

**For Task Overwhelm:**
```
You: "I need to write a report but it feels impossible"
MERIDIAN: "Let's break this down together using the STM method..."
[Generates specific, time-estimated steps]
```

**For Anxiety:**
```
You: "I'm feeling anxious right now"
MERIDIAN: "Let's ground together with 5-4-3-2-1..."
[Guides through grounding exercise]
```

**For Self-Criticism:**
```
You: "I'm such a failure, I can't do anything right"
MERIDIAN: "Whoa, hold on. I hear your inner critic being harsh..."
[Challenges thought with compassion]
```

---

## 🔐 Privacy & Data

### Your Data

- All conversations stored in **your** Vercel Postgres database
- Only you have access
- No third-party sharing
- No tracking or analytics

### Security

- Anthropic API key is server-side only
- Database credentials in environment variables
- HTTPS enforced by Vercel
- Password-protected if you add auth later

---

## 🧪 Testing Your Setup

After installation, test these:

- [ ] App loads at localhost:3000 (or your Vercel URL)
- [ ] Redirects automatically to dashboard
- [ ] Can complete check-in
- [ ] Can send chat messages
- [ ] Claude responds (may take 5-10 seconds first time)
- [ ] Crisis keywords trigger alert
- [ ] Conversation history persists after refresh
- [ ] Mobile responsive (resize browser)

---

## 🎨 Customization

### Modify the Bot Personality

Edit `prompts/CLAUDE_MEGA_SYSTEM_PROMPT_ExecutiveFunctionCoach.md` to:
- Adjust tone (more casual, more formal, etc.)
- Add personal context (your specific challenges)
- Include domain-specific knowledge
- Customize crisis resources

**Note:** Large changes may affect caching efficiency.

### Change Colors/Style

Edit `app/globals.css` or component files to change:
- Color scheme
- Fonts
- Layout
- Animations

---

## 📊 Track Your Progress

### In the Database

You can query your data directly in Vercel:

```sql
-- See your check-ins over time
SELECT timestamp, mood_score, energy_level, anxiety_score
FROM checkins
ORDER BY timestamp DESC
LIMIT 30;

-- See your conversations
SELECT role, content, timestamp
FROM messages
ORDER BY timestamp DESC
LIMIT 50;

-- See completed tasks
SELECT title, completed_at
FROM tasks
WHERE status = 'completed'
ORDER BY completed_at DESC;
```

### Future: Export Feature

Plan to add:
- Export all data as JSON
- Progress charts
- Mood trends visualization

---

## 🆘 Troubleshooting

### "Anthropic API Error"

- Verify your API key is correct in `.env.local`
- Check you have credits: [console.anthropic.com](https://console.anthropic.com/)
- No spaces or quotes around the key

### "Database Connection Failed"

- Verify all `POSTGRES_*` variables are set in `.env.local`
- Restart dev server: `Ctrl+C` then `npm run dev`

### Chat Not Responding

- Check terminal for errors
- Check browser console (F12)
- Verify prompt file exists at `prompts/CLAUDE_MEGA_SYSTEM_PROMPT_ExecutiveFunctionCoach.md`
- First response may take 5-10 seconds (it's loading the large prompt)

### "Module Not Found"

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🎓 Learning Resources

### Understanding the Code

- `lib/claude.ts` - Claude API integration with caching
- `lib/db.ts` - Database operations
- `app/api/chat/route.ts` - Main chat endpoint
- `app/dashboard/page.tsx` - UI components

### Evidence Base

MERIDIAN draws from 29 evidence-based therapy sources (see system prompt for full citations).

### Further Reading

- [Anthropic Claude Documentation](https://docs.anthropic.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Behavioral Activation](https://www.apa.org/ptsd-guideline/treatments/behavioral-activation-therapy)
- [Self-Compassion (Kristin Neff)](https://self-compassion.org/)

---

## 🔄 Updates & Maintenance

### Update Dependencies

```bash
npm update
```

### Pull Latest Code

```bash
git pull origin main
npm install
```

### Database Migrations

If you modify `lib/db.ts` schema:
- Database tables auto-update on next API call
- Or manually run SQL in Vercel dashboard

---

## 💡 Tips for Best Results

### For ADHD/Executive Dysfunction

- Use check-in daily to track patterns
- Request maximum detail level for task breakdowns
- Use quick actions for lower friction
- Don't judge yourself - MERIDIAN won't!

### For Anxiety

- Do check-ins to notice anxiety patterns
- Use grounding techniques proactively
- Practice self-compassion daily
- Remember: feelings are valid

### For Depression

- Check-in even when hard (especially then!)
- Use behavioral activation ("5-minute starter")
- Track small wins
- Be patient with yourself

### For Low Self-Esteem

- Challenge negative thoughts with MERIDIAN's help
- Request affirmations when needed
- Keep wins list
- Practice self-compassion breaks

---

## 🌟 Remember

MERIDIAN is here to support you, not replace professional help. It's a tool for:
- Daily emotional support
- Practical strategy guidance
- Evidence-based techniques
- Compassionate encouragement

You deserve support. You deserve compassion. You're doing great by taking this step! 💜

---

## 📞 Need More Help?

- **Documentation:** See `QUICKSTART.md` and `DEPLOYMENT.md`
- **Anthropic Docs:** [docs.anthropic.com](https://docs.anthropic.com/)
- **In Crisis:** Call 988, text 741741, or dial 911

---

Built with care for the neurodivergent community 💜

**You've got this!** 🚀
