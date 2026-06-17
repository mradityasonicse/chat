# 📍 Push Your Code to GitHub

Follow these exact steps to upload your project to GitHub and prepare it for deployment.

---

## Step 1: Create GitHub Account (if you don't have one)
1. Go to [github.com/signup](https://github.com/signup)
2. Enter email and create account
3. Verify your email

---

## Step 2: Create Repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `chat-with-you`
3. **Description**: "Real-time messaging app with Next.js"
4. **Visibility**: Public (required for Vercel free tier)
5. **Initialize**: Leave all unchecked (we already have files)
6. Click **"Create repository"**
7. **Copy the setup commands** shown on the next page

---

## Step 3: Push Code to GitHub

**Option A: Using Git Bash/Command Line**

```bash
# Navigate to project
cd "c:\Users\user\OneDrive\Documents\chat"

# Initialize git (if not already done)
git init

# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/chat-with-you.git

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Chat with You app"

# Push to GitHub
git branch -M main
git push -u origin main
```

**That's it!** Your code is now on GitHub.

---

## Step 4: Verify on GitHub

1. Go to `https://github.com/YOUR_USERNAME/chat-with-you`
2. You should see all your files listed
3. Check that `.env.local` is NOT showing (it should be in .gitignore)

---

## Step 5: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Find and select `chat-with-you`
5. Click **"Import"**
6. **Add Environment Variables:**
   - `DATABASE_URL` = Your Supabase connection string
   - `JWT_SECRET` = `your-super-secret-jwt-key-change-in-production-12345`
   - `NEXT_PUBLIC_SOCKET_URL` = `https://chat-with-you.vercel.app` (or your custom domain)
7. Click **"Deploy"**

**🎉 Your app is live!** Visit `https://chat-with-you.vercel.app`

---

## Troubleshooting

### "Permission denied" when pushing
```bash
# Generate SSH key (optional, more secure)
ssh-keygen -t ed25519 -C "your-email@example.com"
# Then add it to GitHub Settings → SSH Keys
```

### "fatal: not a git repository"
```bash
cd "c:\Users\user\OneDrive\Documents\chat"
git init
```

### ".env.local showing on GitHub" 
It shouldn't! Check that `.gitignore` contains `.env.local`

---

## Next Deployments (Auto-Deploy)

Once connected to Vercel:
1. Make code changes locally
2. Push to GitHub: `git push`
3. Vercel automatically deploys! ✅

```bash
# Quick workflow
git add .
git commit -m "Update feature"
git push
```

Done! Your changes are live in seconds.

---

## Resources
- [GitHub Docs](https://docs.github.com)
- [Vercel Docs](https://vercel.com/docs)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
