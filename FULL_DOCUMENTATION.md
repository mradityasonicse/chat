# Chat With You - Full Documentation

## Project Overview

Chat With You is a modern, privacy-focused real-time messaging platform built with:
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io for WebSocket communication
- **State Management**: Zustand
- **Authentication**: JWT tokens with bcrypt hashing

## Architecture

```
┌─────────────────┐
│   React App     │
│  (Frontend)     │
└────────┬────────┘
         │
         ├─── REST API (HTTP)
         │    • Auth
         │    • Conversations
         │    • Messages
         │    • Users
         │
         └─── Socket.io (WebSocket)
              • Real-time messaging
              • Typing indicators
              • Presence
              • Read receipts
              │
         ┌────┴─────────────────┐
         │                      │
    ┌────▼────┐          ┌──────▼──────┐
    │PostgreSQL│          │  Socket.io  │
    │Database  │          │   Server    │
    └──────────┘          └─────────────┘
```

## Features Implemented

### Authentication
- ✅ User registration with email/password
- ✅ Login with JWT tokens
- ✅ Session persistence with localStorage
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ Token refresh mechanism

### Chat Features
- ✅ One-to-one conversations
- ✅ Message sending and receiving
- ✅ Message history (pagination ready)
- ✅ Conversation list with recent first sorting
- ✅ User search functionality
- ✅ Create new conversations

### UI/UX
- ✅ Responsive dashboard layout
- ✅ Dark theme (Tailwind CSS)
- ✅ Beautiful animations (Framer Motion ready)
- ✅ Message bubbles with timestamps
- ✅ Form validation (Zod)
- ✅ Loading states
- ✅ Error handling
- ✅ Settings page

### Database
- ✅ Complete Prisma schema
- ✅ User management
- ✅ Conversation management
- ✅ Message storage
- ✅ Participant tracking
- ✅ Profile and settings tables

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 12+ or Supabase account
- Git

### 2. Setup

```bash
# Clone the repository
git clone <repo-url>
cd chat

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your database URL and secrets
# DATABASE_URL="postgresql://..."
# JWT_SECRET="your-secret-key"

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Login/Register: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard

### 4. Test Users

Create a few test accounts:

1. Go to `/register`
2. Create accounts with different emails
3. Log in to each and start conversations

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Conversations
- `GET /api/conversations` - List user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/[id]` - Get messages in conversation
- `POST /api/conversations/[id]` - Send message

### Users
- `GET /api/users/search` - Search users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/settings` - Get user settings
- `PUT /api/users/settings` - Update settings

## Database Schema

### Key Tables
- **users** - User accounts and authentication
- **profiles** - User display info and preferences
- **conversations** - Chat groups/channels
- **participants** - User membership in conversations
- **messages** - Chat messages
- **settings** - User preferences
- **notifications** - System notifications

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/chat_db
JWT_SECRET=your-super-secret-key-here
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Development Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
```

## Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Connect to Vercel
# Set environment variables in Vercel dashboard
# DATABASE_URL
# JWT_SECRET
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run prisma:generate
RUN npm run build
CMD ["npm", "start"]
```

## Real-Time Features (Socket.io)

Ready to implement:
- Typing indicators
- Read receipts
- Online/offline status
- Live message delivery status
- Presence tracking

See `src/lib/socket.ts` and `src/lib/socketClient.ts` for implementation.

## Future Enhancements

- [ ] End-to-end encryption (E2EE)
- [ ] Message editing
- [ ] Message deletion
- [ ] Message reactions/emojis
- [ ] File sharing
- [ ] Image sharing
- [ ] Group conversations
- [ ] Voice/video calls
- [ ] Message search
- [ ] Conversation pinning
- [ ] Dark/light theme toggle
- [ ] Notifications (browser push)
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWTs are signed with HS256
- Tokens expire after 7 days
- API routes require authentication
- CORS configured for localhost development
- SQL injection prevention with Prisma

## Troubleshooting

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -c "SELECT 1"

# Check environment variables
echo $DATABASE_URL
```

### Prisma Issues
```bash
# Regenerate Prisma client
npm run prisma:generate

# Reset database (development only)
npx prisma migrate reset
```

### Port Already in Use
```bash
# Change port in next.config.js or use:
PORT=3001 npm run dev
```

## Support & Contributing

For issues or feature requests, please open a GitHub issue.

## License

MIT License - See LICENSE file for details
