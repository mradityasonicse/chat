# Environment Setup Guide

## Database Setup

### Option 1: Local PostgreSQL (Development)

1. Install PostgreSQL: https://www.postgresql.org/download/
2. Create a database:
   ```bash
   createdb chat_db
   ```
3. Update `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/chat_db"
   JWT_SECRET="your-secret-key"
   ```

### Option 2: Supabase (Cloud)

1. Create a Supabase project: https://supabase.com
2. Get your connection string from the Supabase dashboard
3. Update `.env.local`:
   ```
   DATABASE_URL="your-supabase-connection-string"
   JWT_SECRET="your-secret-key"
   ```

## Initial Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

3. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Access the app at `http://localhost:3000`

## Testing

1. Register a new account at `/register`
2. Log in at `/login`
3. Start a new chat from the dashboard
4. Try sending messages

## Deployment

### Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables: `DATABASE_URL` and `JWT_SECRET`
4. Deploy

### Other Platforms

Ensure Node.js 18+ is available and environment variables are set.
