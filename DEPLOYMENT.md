# MERIDIAN Deployment Guide

This guide will walk you through deploying MERIDIAN to Vercel.

---

## Prerequisites

1. **Anthropic API Key** - [Get one here](https://console.anthropic.com/)
2. **Vercel Account** - [Sign up here](https://vercel.com)
3. **GitHub Repository** - Your code is already pushed!

---

## Step-by-Step Deployment

### 1. Create Vercel Account & Connect GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repositories

### 2. Import Project

1. From Vercel dashboard, click **"Add New..." → "Project"**
2. Find `mega-mental` repository
3. Click **"Import"**

### 3. Configure Build Settings

Vercel should auto-detect Next.js. If not, set:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 4. Add Environment Variables

Click **"Environment Variables"** and add:

```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

**Important:** Don't add database variables yet - we'll create the database next!

### 5. Deploy (First Time)

Click **"Deploy"**

The first deployment will fail because database is not set up yet. That's expected!

### 6. Create Vercel Postgres Database

1. Go to your project dashboard
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Choose database name: `meridian-db` (or your choice)
6. Select region closest to your users
7. Click **"Create"**

### 7. Connect Database to Project

1. Vercel will ask: "Connect to project?"
2. Select your `mega-mental` project
3. Click **"Connect"**

This automatically adds these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 8. Redeploy

1. Go to **"Deployments"** tab
2. Find the failed deployment
3. Click **"⋯"** (three dots) → **"Redeploy"**

Or trigger new deployment:
```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

### 9. Initialize Database

The database tables will be created automatically on first API call. To manually initialize:

1. Go to **"Storage"** → Your database
2. Click **"Query"** tab
3. You can run SQL commands here if needed

Or, simply use the app - tables will be created automatically on first use!

### 10. Test Your Deployment

1. Click on the deployment URL (e.g., `meridian-xxx.vercel.app`)
2. App will auto-redirect to dashboard (no sign-up needed!)
3. Complete a check-in
4. Send a chat message
5. Try task breakdown

---

## Environment Variables Reference

### Required

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

### Auto-Added by Vercel (when you create Postgres database)

```bash
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
```

### Optional

```bash
NEXTAUTH_SECRET=                    # For NextAuth.js (future)
NEXTAUTH_URL=https://yourapp.vercel.app
NEXT_PUBLIC_APP_NAME=MERIDIAN
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

---

## Post-Deployment Checklist

- [ ] App loads and redirects to dashboard
- [ ] Can complete check-in
- [ ] Can send chat messages
- [ ] Claude responses work
- [ ] Task breakdown works
- [ ] Check-in data persists
- [ ] Crisis detection works
- [ ] Mobile responsive (test on phone)

---

## Monitoring & Costs

### Monitor Usage

**Anthropic Console:**
- [console.anthropic.com](https://console.anthropic.com/)
- Check API usage, costs, rate limits

**Vercel Dashboard:**
- Monitor function invocations
- Check database queries
- View error logs

### Expected Costs (Personal Use)

**Anthropic API** (with prompt caching):
- ~$0.50-1.00 per conversation (10 messages)
- Personal use (5-10 conversations/day): ~$2.50-10/day
- **Monthly estimate: ~$75-300/month**

**Vercel:**
- Hobby plan: Free (sufficient for personal use)

**Total estimated for personal use:** ~$75-300/month

---

## Troubleshooting

### Error: "Database connection failed"

**Solution:**
1. Verify database is created and connected
2. Check environment variables are set
3. Redeploy after adding variables

### Error: "Anthropic API key invalid"

**Solution:**
1. Verify API key is correct
2. Check it's set in environment variables
3. No spaces or quotes around the key
4. Redeploy

### Error: "Module not found"

**Solution:**
```bash
# Clear cache and rebuild
npm install
npm run build
git commit -am "Fix dependencies"
git push
```

### Chat not working

**Check:**
1. Anthropic API key is valid
2. System prompt file exists
3. Browser console for errors
4. Vercel function logs

### Database tables not created

**Solution:**
The tables are created automatically on first use. If not:
1. Go to Vercel Storage → Database → Query
2. Run the SQL from `lib/db.ts` manually

---

## Custom Domain (Optional)

1. Go to project **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `meridian.yourdomain.com`)
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` environment variables

---

## Security Best Practices

### Current Security (Personal Use)

✅ **Already Implemented:**
- HTTPS enforced (Vercel handles automatically)
- API key stored server-side only
- Database credentials in environment variables
- Personal use (single user, no authentication needed)

### If Scaling to Multiple Users (Future)

1. **Add Authentication**
   - Implement NextAuth.js
   - Add session management
   - User registration/login

2. **Add Rate Limiting**
   - Prevent API abuse
   - Use Vercel Edge Config or Redis

3. **Add Input Validation**
   - Sanitize all user inputs
   - Use Zod for validation
   - Prevent SQL injection

4. **Monitor & Alert**
   - Set up error tracking (Sentry)
   - Monitor API costs
   - Set budget alerts

---

## Scaling Considerations

*Note: For personal use, you won't need these. Include if planning to expand to multiple users.*

### If you exceed 1000 daily users:

1. **Implement Caching**
   - Cache common responses
   - Use Redis for sessions

2. **Optimize Database**
   - Add indexes
   - Connection pooling
   - Read replicas

3. **Rate Limiting**
   - Per-user limits
   - API key rotation
   - Queue system for high load

4. **CDN for Static Assets**
   - Vercel handles this automatically

---

## Backup & Data Export

### Database Backup

Vercel doesn't auto-backup Hobby plan databases!

**For production:**
1. Upgrade to Pro plan (includes backups)
2. Or implement manual backup script

### User Data Export

Implement export feature (future):
- All check-ins
- All conversations
- All tasks
- All wins

---

## Support

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Anthropic Docs:** [docs.anthropic.com](https://docs.anthropic.com/)
- **Issues:** GitHub Issues

---

🎉 **Congratulations! MERIDIAN is now live!**

Share your deployment URL and start helping people! 💜
