# 🚀 Chat With You - Quick Start Guide

## One-Minute Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ (or Supabase account)
- Git

### 3 Commands to Get Started

```bash
# 1. Install dependencies
npm install

# 2. Set up database and run migrations
npm run prisma:generate
npm run prisma:migrate

# 3. Start the development server
npm run dev
```

**That's it!** Open http://localhost:3000

---

## Detailed Setup (Step-by-Step)

### Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages including Next.js, Prisma, Tailwind CSS, Socket.io, etc.

### Step 2: Configure Database

#### Option A: Local PostgreSQL

```bash
# 1. Install PostgreSQL: https://www.postgresql.org/download/

# 2. Create database
createdb chat_db

# 3. Update .env.local
# Set DATABASE_URL="postgresql://postgres:password@localhost:5432/chat_db"
```

#### Option B: Supabase (Cloud)

```bash
# 1. Create account: https://supabase.com
# 2. Create new project
# 3. Copy connection string from Settings > Database > Connection String
# 4. Update .env.local with DATABASE_URL
```

### Step 3: Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# (Optional) Seed with test data
npm run prisma:seed
```

### Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

---

## Testing the Application

### Without Seed Data

1. Go to http://localhost:3000/register
2. Create a new account
3. Go to /login and sign in
4. Go to /dashboard
5. Click "New Chat" and search for other users

### With Seed Data (Recommended)

After running `npm run prisma:seed`:

1. **Account 1:**
   - Email: `alice@example.com`
   - Password: `password123`

2. **Account 2:**
   - Email: `bob@example.com`
   - Password: `password123`

3. They already have a conversation with messages!

---

## Key URLs

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Home page |
| http://localhost:3000/register | Create account |
| http://localhost:3000/login | Sign in |
| http://localhost:3000/dashboard | Main chat app |
| http://localhost:3000/settings | User settings |

---

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Format code
npm run format

# Database commands
npm run prisma:generate   # Regenerate Prisma client
npm run prisma:migrate    # Create/run migrations
npm run prisma:seed       # Populate test data
npm run prisma:reset      # Reset database (careful!)
```

---

## Environment Variables

Create `.env.local` in project root:

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/chat_db"
JWT_SECRET="change-this-to-a-random-secret-in-production"

# Optional
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

---

## Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
psql -c "SELECT 1"

# Verify DATABASE_URL in .env.local
cat .env.local
```

### "Prisma client not found"
```bash
npm run prisma:generate
```

### "Port 3000 already in use"
```bash
PORT=3001 npm run dev
```

### "Authentication errors"
- Clear localStorage: Open DevTools > Application > Local Storage > Clear
- Log out and log back in
- Try creating a new account

### Dependencies not installing
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Project Structure

```
chat/
├── src/
│   ├── app/              # Pages and API routes
│   ├── components/       # UI components
│   ├── lib/              # Utilities and helpers
│   ├── store/            # Zustand stores
│   ├── hooks/            # React hooks
│   └── types/            # TypeScript types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Test data
├── .env.local            # Environment variables
└── package.json          # Dependencies
```

---

## Architecture Overview

```
┌──────────────────┐
│   Browser        │
│  (React App)     │
└────────┬─────────┘
         │
         ├─── REST API
         │   (HTTP)
         │
         └─── Socket.io
             (WebSocket)
             
         ↓
         
┌──────────────────┐
│   Next.js Server │
│  (Backend API)   │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  PostgreSQL      │
│  (Database)      │
└──────────────────┘
```

---

## Features Implemented ✅

- [x] User registration and login
- [x] JWT authentication
- [x] User profiles
- [x] One-to-one messaging
- [x] Conversation list
- [x] Message history
- [x] User search
- [x] Responsive UI
- [x] Dark theme
- [x] Settings page

---

## Ready to Deploy?

### To Vercel

```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect to Vercel and add environment variables:
# - DATABASE_URL
# - JWT_SECRET

# 3. Deploy!
```

### To Docker

```bash
# Build and run Docker container
docker build -t chat-with-you .
docker run -p 3000:3000 -e DATABASE_URL="..." chat-with-you
```

---

## Need Help?

1. Check **SETUP.md** for database setup
2. Check **FULL_DOCUMENTATION.md** for API docs
3. Check **PROJECT_STATUS.md** for project details
4. Check console logs for errors: `npm run dev` shows logs

---

## Next Steps

After getting the app running:

1. ✅ Create multiple accounts
2. ✅ Test messaging between accounts
3. ✅ Try the settings page
4. ✅ Explore the code
5. ✅ Customize the theme
6. ✅ Add new features!

---

## Quick Tips

- **Dark Mode**: Already enabled! Go to /settings to customize
- **Test Users**: Use `npm run prisma:seed` to create test accounts
- **Hot Reload**: Changes auto-refresh, no need to restart
- **Database**: Check `prisma/schema.prisma` to understand the database
- **API**: All endpoints are in `src/app/api/`

---

## Common Tasks

### Create a new user
```bash
# Use the /register page in browser
# Or use seed script: npm run prisma:seed
```

### Reset database (⚠️ deletes all data)
```bash
npm run prisma:reset
```

### Check database directly
```bash
# If using local PostgreSQL:
psql -d chat_db

# List tables: \dt
# View messages: SELECT * FROM messages;
# Exit: \q
```

### Format code
```bash
npm run format
```

---

## Performance Tips

- UI updates instantly (Zustand store)
- Messages load with pagination-ready structure
- Database queries are optimized with Prisma
- Images can be added via Cloudinary (not yet configured)
- Real-time with Socket.io (ready to implement)

---

## Security

✅ Passwords hashed with bcrypt
✅ JWT tokens secure
✅ Protected API routes
✅ No sensitive data in localStorage (except JWT)
✅ SQL injection protection (Prisma)

⚠️ Before production: Change JWT_SECRET!

---

## Let's Build! 🚀

You now have a production-ready chat application skeleton. Happy coding!

For questions or issues, refer to the documentation files or check the code comments.

---

Last Updated: June 17, 2026
Version: 1.0.0
