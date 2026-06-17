# 🚀 Deployment Guide - Chat With You

## Prerequisites
Before deploying, ensure you have:
- [x] GitHub account
- [x] Node.js 18+ installed locally
- [x] Git installed
- [x] One of: Vercel account OR Railway account OR Supabase account (free)

---

## ⚡ QUICKEST PATH (5 Minutes)

### Step 1: Setup Supabase Database (Free PostgreSQL)
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** → Sign up with GitHub
3. Create a new project (choose region closest to you)
4. Go to **Settings** → **Database** → **Connection Strings**
5. Copy the **Connection String** (URI format)
6. **Save it** - you'll need it in Step 3

### Step 2: Prepare Code for GitHub
```bash
# Navigate to your project
cd "c:\Users\user\OneDrive\Documents\chat"

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Chat app - ready for deployment"

# Create repository on GitHub
# 1. Go to github.com
# 2. Click "+" → "New repository"
# 3. Name it: "chat-with-you"
# 4. Do NOT initialize with README/gitignore
# 5. Copy the commands shown

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/chat-with-you.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel (Free)
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Search for `chat-with-you` → Select it
5. Click **"Import"**
6. **Environment Variables** → Add these:
   ```
   DATABASE_URL = <paste-from-supabase>
   JWT_SECRET = your-super-secret-jwt-key-change-in-production-12345
   NEXT_PUBLIC_SOCKET_URL = https://chat-with-you.vercel.app
   ```
7. Click **"Deploy"** ✅

**Your app is now live at**: `https://chat-with-you.vercel.app`

---

## Alternative: Railway.app (Even Easier - Includes Database)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select `chat-with-you`
5. Add environment variables (same as above)
6. Click **"Deploy"** ✅

**Your app is now live at**: `https://chat-with-you.up.railway.app`

---

## Local Testing Before Deploy

```bash
# Install dependencies
npm install

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Test Users** (from seed):
- Email: `alice@example.com` / Password: `password123`
- Email: `bob@example.com` / Password: `password123`

---

## Production Checklist

- [ ] Supabase account created
- [ ] Code pushed to GitHub
- [ ] Environment variables set in Vercel/Railway
- [ ] First deploy successful
- [ ] Can login at your live URL
- [ ] Can send messages between test accounts

---

## Troubleshooting

### "Build failed"
→ Check that `DATABASE_URL` is set correctly in environment variables

### "Database connection error"
→ Verify Supabase connection string is copied exactly
→ Check database hasn't been paused (Supabase pauses after 1 week of inactivity on free tier)

### "Can't send messages"
→ Run `npm run prisma:seed` to create test users
→ Check database migrations ran: `npm run prisma:migrate`

---

## Next Steps

After deployment:
1. Share your live URL
2. Add custom domain (optional - $10/year from Vercel)
3. Enable Socket.io for real-time (see SOCKET_IO.md)
4. Add SSL certificate (automatic on Vercel)

**Questions?** Check FULL_DOCUMENTATION.md for complete API documentation.
