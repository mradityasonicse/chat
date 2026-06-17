# Chat With You

A private real-time messaging web app built with Next.js, Tailwind CSS, Prisma, and Socket.io.

## 🚀 Quick Deploy (Free)

**Deploy in 5 minutes:**

1. **Database**: Create free PostgreSQL at [supabase.com](https://supabase.com) and get connection string
2. **Code**: Push to GitHub
3. **Deploy**: Go to [vercel.com](https://vercel.com), import your repo, add `DATABASE_URL` and `JWT_SECRET`, deploy!

**Your app is live** at `https://your-app.vercel.app`

See [DEPLOY.md](./DEPLOY.md) for complete step-by-step instructions.

---

## Getting Started (Local Development)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` based on `.env.example`
   ```bash
   cp .env.example .env.local
   ```
3. Setup database:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`

## Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run Prisma migrations

## Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- Socket.io
- Zustand
- Zod
- Framer Motion
