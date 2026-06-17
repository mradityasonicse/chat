# Chat With You - Backend Schema & Architecture

**Document Version:** 1.0  
**Last Updated:** 2026-06-16  
**Status:** Draft  

---

## 1. System Architecture

```
+---------------------------------------------------------------+
|                        CLIENT LAYER                            |
|  Browser / Mobile Web / PWA                                   |
+---------------------------------------------------------------+
                              |
                              | HTTPS / WSS
                              v
+---------------------------------------------------------------+
|                       GATEWAY LAYER                            |
|  Vercel Edge (Next.js) + Socket.io Server (Railway/Render)    |
|  - API Routes        - WebSocket Events                        |
|  - Middleware        - Room Management                         |
|  - Auth checks       - Real-time Broadcast                     |
+---------------------------------------------------------------+
                              |
                              | SQL / TCP
                              v
+---------------------------------------------------------------+
|                       DATA LAYER                               |
|  Supabase (PostgreSQL) + Redis (Optional)                      |
|  - User data         - Session cache                           |
|  - Messages          - Presence tracking                       |
|  - Conversations     - Rate limiting                           |
|  - Notifications                                             |
+---------------------------------------------------------------+
                              |
                              | HTTP
                              v
+---------------------------------------------------------------+
|                     EXTERNAL SERVICES                          |
|  Cloudinary (Images) / Sentry (Errors) / SendGrid (Emails)    |
+---------------------------------------------------------------+
```

---

## 2. Database Design

### 2.1 Entity Relationship Diagram

```
+------------------+       +------------------+       +------------------+
|      users       |       |    profiles      |       |    settings      |
+------------------+       +------------------+       +------------------+
| id (PK)          |<----->| id (PK)          |       | id (PK)          |
| email            |       | userId (FK)      |<----->| userId (FK, UNQ) |
| passwordHash     |       | displayName      |       | theme            |
| role             |       | avatarUrl        |       | background       |
| createdAt        |       | bio              |       | notifications    |
| updatedAt        |       | lastSeen         |       | soundEnabled     |
+------------------+       | createdAt        |       | createdAt        |
         |                 +------------------+       | updatedAt        |
         |                                            +------------------+
         |
         | 1:N            +------------------+
         +--------------->|  conversations   |
                          +------------------+
                          | id (PK)          |
                          | creatorId (FK)   |
                          | lastMessageId(FK)|
                          | createdAt        |
                          | updatedAt        |
                          +--------+---------+
                                   |
                                   | N:M (through participants)
                                   v
+------------------+       +------------------+       +------------------+
|    messages      |       |  participants    |       |  notifications   |
+------------------+       +------------------+       +------------------+
| id (PK)          |       | id (PK)          |       | id (PK)          |
| conversationId   |<----->| conversationId   |       | userId (FK)      |
| senderId (FK)    |       | userId (FK)      |       | type             |
| content          |       | joinedAt         |       | title            |
| status           |       | lastReadAt       |       | body             |
| sentAt           |       +------------------+       | read             |
| deliveredAt      |                                  | link             |
| readAt           |                                  | createdAt        |
| createdAt        |                                  +------------------+
+------------------+
```

### 2.2 Users Table

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    email_verified  BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto | Unique identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| `role` | VARCHAR(20) | DEFAULT 'user' | user or admin |
| `is_active` | BOOLEAN | DEFAULT true | Soft delete flag |
| `email_verified` | BOOLEAN | DEFAULT false | Email verification status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Registration timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 2.3 Profiles Table

```sql
CREATE TABLE profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name    VARCHAR(50) NOT NULL,
    username        VARCHAR(30) UNIQUE,
    avatar_url      VARCHAR(500),
    bio             VARCHAR(200) DEFAULT '',
    last_seen       TIMESTAMPTZ,
    is_online       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto | Unique identifier |
| `user_id` | UUID | FK → users.id, CASCADE | One-to-one with users |
| `display_name` | VARCHAR(50) | NOT NULL | Displayed name in chat |
| `username` | VARCHAR(30) | UNIQUE | Searchable username |
| `avatar_url` | VARCHAR(500) | | Cloudinary image URL |
| `bio` | VARCHAR(200) | DEFAULT '' | Status message/bio |
| `last_seen` | TIMESTAMPTZ | | Last active timestamp |
| `is_online` | BOOLEAN | DEFAULT false | Real-time online status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Profile creation |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_display_name ON profiles(display_name);
```

### 2.4 Settings Table

```sql
CREATE TABLE settings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme               VARCHAR(10) NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    chat_background     VARCHAR(100) NOT NULL DEFAULT 'default',
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    sound_enabled       BOOLEAN NOT NULL DEFAULT true,
    typing_indicator    BOOLEAN NOT NULL DEFAULT true,
    read_receipts       BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto | Unique identifier |
| `user_id` | UUID | FK → users.id, CASCADE | One-to-one with users |
| `theme` | VARCHAR(10) | DEFAULT 'system' | light, dark, or system |
| `chat_background` | VARCHAR(100) | DEFAULT 'default' | Background style/pattern |
| `notifications_enabled` | BOOLEAN | DEFAULT true | Browser notifications |
| `sound_enabled` | BOOLEAN | DEFAULT true | Message sound effects |
| `typing_indicator` | BOOLEAN | DEFAULT true | Show typing indicators |
| `read_receipts` | BOOLEAN | DEFAULT true | Show read receipts |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### 2.5 Conversations Table

```sql
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    last_message_id UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto | Unique identifier |
| `last_message_id` | UUID | FK → messages.id | Reference to latest message |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Conversation creation |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last activity |

**Indexes:**
```sql
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_id);
```

### 2.6 Participants Table

```sql
CREATE TABLE participants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_read_at    TIMESTAMPTZ,
    is_typing       BOOLEAN NOT NULL DEFAULT false,
    typing_started_at TIMESTAMPTZ,
    UNIQUE(conversation_id, user_id)
);
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto | Unique identifier |
| `conversation_id` | UUID | FK → conversations.id, CASCADE | Belongs to conversation |
| `user_id` | UUID | FK → users.id, CASCADE | Participant user |
| `joined_at` | TIMESTAMPTZ | DEFAULT NOW() | When user joined |
| `last_read_at` | TIMESTAMPTZ | | Last time user read messages |
| `is_typing` | BOOLEAN | DEFAULT false | Currently typing |
| `typing_started_at` | TIMESTAMPTZ | | When typing started |

**Indexes:**
```sql
CREATE INDEX idx_participants_conversation ON participants(conversation_id);
CREATE INDEX idx_participants_user ON participants(user_id);
CREATE INDEX idx_participants_last_read ON participants(last_read_at);
```

### 2.7 Messages Table

```sql
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'sending' CHECK (status IN ('sending', 'sent', 'delivered', 'read')),
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at    TIMESTAMPTZ,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto | Unique identifier |
| `conversation_id` | UUID | FK → conversations.id, CASCADE | Belongs to conversation |
| `sender_id` | UUID | FK → users.id, CASCADE | Message sender |
| `content` | TEXT | NOT NULL | Message text content |
| `status` | VARCHAR(20) | DEFAULT 'sending' | sending/sent/delivered/read |
| `sent_at` | TIMESTAMPTZ | DEFAULT NOW() | When message was sent |
| `delivered_at` | TIMESTAMPTZ | | When recipient received |
| `read_at` | TIMESTAMPTZ | | When recipient read |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_messages_conversation ON messages(conversation_id, sent_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_conversation_sent ON messages(conversation_id, sent_at);
```

### 2.8 Notifications Table

```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('message', 'system', 'alert')),
    title           VARCHAR(100) NOT NULL,
    body            TEXT,
    link            VARCHAR(500),
    read            BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto | Unique identifier |
| `user_id` | UUID | FK → users.id, CASCADE | Recipient |
| `type` | VARCHAR(20) | NOT NULL | message/system/alert |
| `title` | VARCHAR(100) | NOT NULL | Notification title |
| `body` | TEXT | | Notification body |
| `link` | VARCHAR(500) | | Click navigation URL |
| `read` | BOOLEAN | DEFAULT false | Read status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes:**
```sql
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
```

### 2.9 Sessions Table

```sql
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address      INET,
    user_agent      VARCHAR(500),
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto | Unique identifier |
| `user_id` | UUID | FK → users.id, CASCADE | Session owner |
| `token_hash` | VARCHAR(255) | NOT NULL, UNIQUE | Hashed access token |
| `refresh_token_hash` | VARCHAR(255) | NOT NULL, UNIQUE | Hashed refresh token |
| `ip_address` | INET | | Client IP |
| `user_agent` | VARCHAR(500) | | Client browser info |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Session expiry |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `last_used_at` | TIMESTAMPTZ | DEFAULT NOW() | Last activity |

**Indexes:**
```sql
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

---

## 3. Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// Users & Authentication
// ============================================

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  passwordHash    String    @map("password_hash")
  role            UserRole  @default(USER)
  isActive        Boolean   @default(true) @map("is_active")
  emailVerified   Boolean   @default(false) @map("email_verified")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  profile         Profile?
  settings        Settings?
  sessions        Session[]
  sentMessages    Message[] @relation("SentMessages")
  conversations   Participant[]
  notifications   Notification[]

  @@index([email])
  @@index([role])
  @@index([createdAt])
  @@map("users")
}

enum UserRole {
  USER
  ADMIN
}

// ============================================
// Profile
// ============================================

model Profile {
  id            String    @id @default(uuid())
  userId        String    @unique @map("user_id")
  displayName   String    @map("display_name")
  username      String?   @unique
  avatarUrl     String?   @map("avatar_url")
  bio           String    @default("")
  lastSeen      DateTime? @map("last_seen")
  isOnline      Boolean   @default(false) @map("is_online")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([username])
  @@index([displayName])
  @@map("profiles")
}

// ============================================
// Settings
// ============================================

model Settings {
  id                    String   @id @default(uuid())
  userId                String   @unique @map("user_id")
  theme                 Theme    @default(SYSTEM)
  chatBackground        String   @default("default") @map("chat_background")
  notificationsEnabled  Boolean  @default(true) @map("notifications_enabled")
  soundEnabled          Boolean  @default(true) @map("sound_enabled")
  typingIndicator       Boolean  @default(true) @map("typing_indicator")
  readReceipts          Boolean  @default(true) @map("read_receipts")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  // Relations
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("settings")
}

enum Theme {
  LIGHT
  DARK
  SYSTEM
}

// ============================================
// Conversations
// ============================================

model Conversation {
  id              String    @id @default(uuid())
  lastMessageId   String?   @map("last_message_id")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  participants    Participant[]
  messages        Message[]
  lastMessage     Message?  @relation("LastMessage", fields: [lastMessageId], references: [id])

  @@index([updatedAt])
  @@map("conversations")
}

// ============================================
// Participants
// ============================================

model Participant {
  id              String    @id @default(uuid())
  conversationId  String    @map("conversation_id")
  userId          String    @map("user_id")
  joinedAt        DateTime  @default(now()) @map("joined_at")
  lastReadAt      DateTime? @map("last_read_at")
  isTyping        Boolean   @default(false) @map("is_typing")
  typingStartedAt DateTime? @map("typing_started_at")

  // Relations
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([conversationId, userId])
  @@index([conversationId])
  @@index([userId])
  @@map("participants")
}

// ============================================
// Messages
// ============================================

model Message {
  id              String        @id @default(uuid())
  conversationId  String        @map("conversation_id")
  senderId        String        @map("sender_id")
  content         String
  status          MessageStatus @default(SENDING)
  sentAt          DateTime      @default(now()) @map("sent_at")
  deliveredAt     DateTime?     @map("delivered_at")
  readAt          DateTime?     @map("read_at")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  // Relations
  conversation    Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender          User          @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  lastInConversation Conversation? @relation("LastMessage")

  @@index([conversationId, sentAt])
  @@index([senderId])
  @@index([status])
  @@map("messages")
}

enum MessageStatus {
  SENDING
  SENT
  DELIVERED
  READ
}

// ============================================
// Notifications
// ============================================

model Notification {
  id        String           @id @default(uuid())
  userId    String           @map("user_id")
  type      NotificationType
  title     String
  body      String?
  link      String?
  read      Boolean          @default(false)
  createdAt DateTime         @default(now()) @map("created_at")

  // Relations
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([userId, read])
  @@map("notifications")
}

enum NotificationType {
  MESSAGE
  SYSTEM
  ALERT
}

// ============================================
// Sessions
// ============================================

model Session {
  id                 String    @id @default(uuid())
  userId             String    @map("user_id")
  tokenHash          String    @unique @map("token_hash")
  refreshTokenHash   String    @unique @map("refresh_token_hash")
  ipAddress          String?   @map("ip_address")
  userAgent          String?   @map("user_agent")
  expiresAt          DateTime  @map("expires_at")
  createdAt          DateTime  @default(now()) @map("created_at")
  lastUsedAt         DateTime  @default(now()) @map("last_used_at")

  // Relations
  user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@index([expiresAt])
  @@map("sessions")
}
```

---

## 4. API Endpoints

### 4.1 Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe"
}
```

**Validation:**
```typescript
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  displayName: z.string().min(1, "Display name is required").max(50)
});
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "user"
    },
    "tokens": {
      "accessToken": "jwt_string",
      "refreshToken": "jwt_string"
    }
  }
}
```

**Errors:**
- `409 Conflict` — Email already registered
- `400 Bad Request` — Validation error
- `500 Internal Server Error` — Server error

---

#### POST /api/auth/login
Authenticate and receive tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

**Validation:**
```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false)
});
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "user",
      "avatarUrl": "https://..."
    },
    "tokens": {
      "accessToken": "jwt_string",
      "refreshToken": "jwt_string"
    }
  }
}
```

**Errors:**
- `401 Unauthorized` — Invalid credentials
- `400 Bad Request` — Validation error

---

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request:**
```http
Cookie: refreshToken={jwt_refresh_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_string",
    "refreshToken": "new_jwt_string"
  }
}
```

**Errors:**
- `401 Unauthorized` — Invalid or expired refresh token

---

#### POST /api/auth/logout
Invalidate current session.

**Headers:**
```http
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST /api/auth/forgot-password
Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account exists, a reset email has been sent"
}
```

**Note:** Always returns 200 to prevent email enumeration.

---

#### POST /api/auth/reset-password
Reset password with token.

**Request:**
```json
{
  "token": "reset_token_string",
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Validation:**
```typescript
const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match"
});
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Errors:**
- `400 Bad Request` — Invalid or expired token
- `400 Bad Request` — Password validation failed

---

#### GET /api/auth/me
Get current authenticated user.

**Headers:**
```http
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "username": "johndoe",
    "avatarUrl": "https://...",
    "bio": "Hello!",
    "role": "user",
    "isOnline": true,
    "lastSeen": "2026-06-16T10:30:00Z"
  }
}
```

---

### 4.2 User Endpoints

#### GET /api/users/search
Search users by username or display name.

**Query:**
```
?q={searchQuery}&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "displayName": "John Doe",
        "username": "johndoe",
        "avatarUrl": "https://...",
        "bio": "Hello!",
        "isOnline": true,
        "lastSeen": "2026-06-16T10:30:00Z"
      }
    ]
  }
}
```

**Validation:**
```typescript
const searchSchema = z.object({
  q: z.string().min(1).max(50),
  limit: z.coerce.number().min(1).max(20).default(10)
});
```

---

#### GET /api/users/:id
Get user profile by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "displayName": "John Doe",
    "username": "johndoe",
    "avatarUrl": "https://...",
    "bio": "Hello!",
    "isOnline": true,
    "lastSeen": "2026-06-16T10:30:00Z",
    "createdAt": "2026-01-15T08:00:00Z"
  }
}
```

---

#### PATCH /api/users/profile
Update current user profile.

**Request:**
```json
{
  "displayName": "New Name",
  "username": "newusername",
  "bio": "New bio text"
}
```

**Validation:**
```typescript
const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(200).optional()
});
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "displayName": "New Name",
    "username": "newusername",
    "bio": "New bio text"
  }
}
```

---

#### POST /api/users/avatar
Upload profile avatar.

**Request:**
```http
Content-Type: multipart/form-data

file: [binary image data]
```

**Validation:**
- Max file size: 5MB
- Allowed types: image/jpeg, image/png, image/webp
- Dimensions: min 100x100, max 2000x2000

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg"
  }
}
```

---

### 4.3 Conversation Endpoints

#### GET /api/conversations
Get all conversations for current user.

**Query:**
```
?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "participant": {
          "id": "uuid",
          "displayName": "John Doe",
          "username": "johndoe",
          "avatarUrl": "https://...",
          "isOnline": true,
          "lastSeen": "2026-06-16T10:30:00Z"
        },
        "lastMessage": {
          "id": "uuid",
          "content": "Hey! How are you?",
          "status": "read",
          "sentAt": "2026-06-16T10:30:00Z",
          "senderId": "uuid"
        },
        "unreadCount": 0,
        "updatedAt": "2026-06-16T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "hasMore": false
    }
  }
}
```

---

#### POST /api/conversations
Create a new conversation with a user.

**Request:**
```json
{
  "participantId": "uuid-of-other-user"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "participant": {
      "id": "uuid",
      "displayName": "John Doe",
      "avatarUrl": "https://...",
      "isOnline": true
    },
    "createdAt": "2026-06-16T10:30:00Z"
  }
}
```

**Errors:**
- `409 Conflict` — Conversation already exists
- `404 Not Found` — User not found

---

#### GET /api/conversations/:id
Get conversation details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "participant": {
      "id": "uuid",
      "displayName": "John Doe",
      "username": "johndoe",
      "avatarUrl": "https://...",
      "isOnline": true,
      "lastSeen": "2026-06-16T10:30:00Z"
    },
    "createdAt": "2026-06-16T10:30:00Z"
  }
}
```

---

#### DELETE /api/conversations/:id
Delete a conversation.

**Response (200):**
```json
{
  "success": true,
  "message": "Conversation deleted"
}
```

---

### 4.4 Message Endpoints

#### GET /api/conversations/:id/messages
Get messages for a conversation.

**Query:**
```
?page=1&limit=50&before={messageId}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "senderId": "uuid",
        "content": "Hello!",
        "status": "read",
        "sentAt": "2026-06-16T10:30:00Z",
        "deliveredAt": "2026-06-16T10:30:01Z",
        "readAt": "2026-06-16T10:30:05Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 234,
      "hasMore": true
    }
  }
}
```

---

#### POST /api/conversations/:id/messages
Send a message (HTTP fallback for WebSocket).

**Request:**
```json
{
  "content": "Hello!",
  "tempId": "client-generated-temp-id"
}
```

**Validation:**
```typescript
const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  tempId: z.string().optional()
});
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "senderId": "uuid",
    "content": "Hello!",
    "status": "sent",
    "sentAt": "2026-06-16T10:30:00Z",
    "tempId": "client-generated-temp-id"
  }
}
```

---

#### POST /api/conversations/:id/read
Mark conversation as read.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "markedAsRead": true,
    "updatedCount": 5
  }
}
```

---

### 4.5 Settings Endpoints

#### GET /api/settings
Get current user settings.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "theme": "dark",
    "chatBackground": "gradient-purple",
    "notificationsEnabled": true,
    "soundEnabled": true,
    "typingIndicator": true,
    "readReceipts": true
  }
}
```

---

#### PATCH /api/settings
Update user settings.

**Request:**
```json
{
  "theme": "dark",
  "chatBackground": "gradient-blue",
  "notificationsEnabled": false
}
```

**Validation:**
```typescript
const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  chatBackground: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  typingIndicator: z.boolean().optional(),
  readReceipts: z.boolean().optional()
});
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "theme": "dark",
    "chatBackground": "gradient-blue",
    "notificationsEnabled": false,
    "soundEnabled": true,
    "typingIndicator": true,
    "readReceipts": true
  }
}
```

---

### 4.6 Admin Endpoints

#### GET /api/admin/users
Get all users (admin only).

**Headers:**
```http
Authorization: Bearer {adminToken}
```

**Query:**
```
?page=1&limit=25&search=john&role=user&sortBy=createdAt&sortOrder=desc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "displayName": "John Doe",
        "username": "johndoe",
        "role": "user",
        "isActive": true,
        "isOnline": true,
        "createdAt": "2026-01-15T08:00:00Z",
        "lastSeen": "2026-06-16T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 18,
      "hasMore": false
    }
  }
}
```

**Errors:**
- `403 Forbidden` — Not an admin

---

#### GET /api/admin/stats
Get platform statistics (admin only).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 18,
    "activeToday": 12,
    "newThisWeek": 3,
    "totalMessages": 4521,
    "messagesToday": 156,
    "averageMessagesPerUser": 251
  }
}
```

---

#### PATCH /api/admin/users/:id
Update user (admin only — deactivate/promote).

**Request:**
```json
{
  "role": "admin",
  "isActive": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "admin",
    "isActive": false
  }
}
```

---

## 5. Authentication Flow

### 5.1 Registration Flow

```
+--------+                                         +--------+
| Client |                                         | Server |
+---+----+                                         +----+---+
    |                                                   |
    | POST /api/auth/register                         |
    | { email, password, displayName }                 |
    +--------------------------------------------------->
    |                                                   |
    |                                              +----v----+
    |                                              | Validate  |
    |                                              | input     |
    |                                              +----v----+
    |                                                   |
    |                                              +----v----+
    |                                              | Check     |
    |                                              | email     |
    |                                              | unique    |
    |                                              +----v----+
    |                                                   |
    |                                              +----v----+
    |                                              | Hash      |
    |                                              | password  |
    |                                              | (bcrypt)  |
    |                                              +----v----+
    |                                                   |
    |                                              +----v----+
    |                                              | Create    |
    |                                              | user +    |
    |                                              | profile   |
    |                                              +----v----+
    |                                                   |
    |                                              +----v----+
    |                                              | Generate  |
    |                                              | JWT tokens|
    |                                              +----v----+
    |                                                   |
    | 201 Created                                       |
    | { user, tokens }                                  |
    <---------------------------------------------------+
    |                                                   |
    | Store tokens (httpOnly cookie)                   |
    | Connect WebSocket                                 |
    | Redirect to /dashboard                            |
    |                                                   |
```

### 5.2 Login Flow

```
+--------+                                         +--------+
| Client |                                         | Server |
+---+----+                                         +----+---+
    |                                                   |
    | POST /api/auth/login                            |
    | { email, password }                              |
    +--------------------------------------------------->
    |                                                   |
    |                                              +----v----+
    |                                              | Find user |
    |                                              | by email  |
    |                                              +----v----+
    |                                                   |
    |                                              +----v----+
    |                                              | Compare   |
    |                                              | password  |
    |                                              | (bcrypt)  |
    |                                              +----v----+
    |                                                   |
    |                                              +----v----+
    |                                              | Generate  |
    |                                              | tokens    |
    |                                              +----v----+
    |                                                   |
    | 200 OK                                            |
    | { user, tokens }                                  |
    | Set-Cookie: accessToken, refreshToken             |
    <---------------------------------------------------+
    |                                                   |
    | Store tokens                                      |
    | Connect WebSocket                                 |
    | Redirect to /dashboard                            |
    |                                                   |
```

### 5.3 Token Refresh Flow

```
+--------+                                         +--------+
| Client |                                         | Server |
+---+----+                                         +----+---+
    |                                                   |
    | API Call with expired token                     |
    | Authorization: Bearer {expired}                  |
    +--------------------------------------------------->
    |                                                   |
    | 401 Unauthorized                                  |
    | { code: "TOKEN_EXPIRED" }                         |
    <---------------------------------------------------+
    |                                                   |
    | POST /api/auth/refresh                            |
    | Cookie: refreshToken={token}                      |
    +--------------------------------------------------->
    |                                                   |
    |                                              +----v----+
    |                                              | Verify   |
    |                                              | refresh  |
    |                                              | token    |
    |                                              +----v----+
    |                                                   |
    |                                              +----v----+
    |                                              | Generate |
    |                                              | new pair |
    |                                              +----v----+
    |                                                   |
    | 200 OK                                            |
    | { accessToken, refreshToken }                     |
    | Set-Cookie: new tokens                            |
    <---------------------------------------------------+
    |                                                   |
    | Retry original request                            |
    | Authorization: Bearer {newToken}                  |
    +--------------------------------------------------->
    |                                                   |
    | 200 OK (original response)                        |
    <---------------------------------------------------+
```

### 5.4 JWT Token Specification

**Access Token:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1718524800,
  "exp": 1718611200,
  "type": "access"
}
```
- **Expiry:** 24 hours
- **Storage:** httpOnly cookie (secure, sameSite=strict)

**Refresh Token:**
```json
{
  "sub": "user-uuid",
  "tokenId": "token-uuid",
  "iat": 1718524800,
  "exp": 1721299200,
  "type": "refresh"
}
```
- **Expiry:** 30 days
- **Storage:** httpOnly cookie (secure, sameSite=strict)
- **Database:** Hash stored in sessions table for revocation

---

## 6. Authorization Rules

### 6.1 Role-Based Access Control (RBAC)

| Resource | Action | User (Owner) | User (Other) | Admin |
|----------|--------|--------------|--------------|-------|
| Profile | Read | Yes | Yes | Yes |
| Profile | Update | Yes | No | No |
| Settings | Read/Update | Yes | No | No |
| Conversation | Create | Yes | Yes | Yes |
| Conversation | Read | Participant only | No | Yes |
| Conversation | Delete | Participant only | No | Yes |
| Message | Send | In conversation | No | No |
| Message | Read | In conversation | No | Yes |
| Message | Delete | Own messages only | No | No |
| User (Admin) | List | No | No | Yes |
| User (Admin) | Update | No | No | Yes |
| Stats | View | No | No | Yes |

### 6.2 Middleware Stack

```typescript
// Request pipeline:
// 1. CORS middleware
// 2. Rate limiting middleware
// 3. Authentication middleware (optional for public routes)
// 4. Authorization middleware (role check)
// 5. Validation middleware (Zod schema)
// 6. Route handler
```

---

## 7. Real-Time Architecture

### 7.1 WebSocket Server Architecture

```
+-------------------------------------------------------+
|                    LOAD BALANCER                       |
+-------------------------------------------------------+
         |                      |
+--------v--------+    +--------v--------+
|  Socket.io      |    |  Socket.io      |
|  Server 1       |    |  Server 2       |
|  (Port 3001)    |    |  (Port 3001)    |
+--------+--------+    +--------+--------+
         |                      |
+--------v----------------------v--------+
|              REDIS                     |
|         (Pub/Sub Adapter)              |
+----------------------------------------+
```

### 7.2 Room Structure

| Room Name | Purpose | Join Condition |
|-----------|---------|----------------|
| `user:{userId}` | Personal notifications | On authentication |
| `conv:{conversationId}` | Conversation messages | On conversation open |

### 7.3 Event Flow

```
User A sends message to User B:

1. User A emits "message:send" to server
2. Server validates and saves to database
3. Server emits "message:sent" to User A (confirmation)
4. Server emits "message:new" to User B's user room
5. If User B is in the conversation room, message appears
6. User B emits "message:read" when viewing
7. Server updates database, emits "message:read" to User A
```

---

## 8. File Upload Architecture

### 8.1 Avatar Upload Flow

```
+--------+      +--------+      +----------+      +----------+
| Client |      | Server |      | Cloudinary|      | Database |
+---+----+      +---+----+      +-----+----+      +-----+----+
    |               |                  |                 |
    | Select file   |                  |                 |
    | Validate      |                  |                 |
    | (size, type)  |                  |                 |
    |               |                  |                 |
    | Upload file   |                  |                 |
    +-------------->|                  |                 |
    |               | Validate         |                 |
    |               | Generate         |                 |
    |               | signature        |                 |
    |               |                  |                 |
    |               | Upload image     |                 |
    |               +----------------->|                 |
    |               |                  | Process         |
    |               |                  | Optimize        |
    |               |                  |                 |
    |               | Return URL       |                 |
    |               |<-----------------+                 |
    |               |                  |                 |
    |               | Update profile   |                 |
    |               | avatarUrl        |                 |
    |               +------------------------------------>|
    |               |                  |                 |
    | Return URL    |                  |                 |
    |<--------------+                  |                 |
```

### 8.2 Upload Constraints

| Constraint | Value |
|------------|-------|
| Max file size | 5 MB |
| Allowed formats | JPEG, PNG, WebP |
| Min dimensions | 100 x 100 px |
| Max dimensions | 2000 x 2000 px |
| Storage format | WebP (auto-converted) |
| Variants | 64x64 (thumbnail), 256x256 (standard) |

---

## 9. Security Architecture

### 9.1 Security Layers

```
+--------------------------------------------------+
|  LAYER 1: NETWORK                                |
|  - HTTPS (TLS 1.3)                               |
|  - HSTS header                                   |
|  - Secure cookie flags                           |
+--------------------------------------------------+
|  LAYER 2: APPLICATION                            |
|  - Input validation (Zod)                        |
|  - Output encoding                               |
|  - XSS protection (CSP headers)                  |
|  - CSRF protection (SameSite cookies)            |
+--------------------------------------------------+
|  LAYER 3: AUTHENTICATION                         |
|  - bcrypt password hashing (cost: 12)            |
|  - JWT with short expiry                         |
|  - Refresh token rotation                        |
|  - Session invalidation                          |
+--------------------------------------------------+
|  LAYER 4: AUTHORIZATION                          |
|  - Role-based access control                     |
|  - Resource ownership checks                     |
|  - Participant validation                        |
+--------------------------------------------------+
|  LAYER 5: DATA                                   |
|  - Parameterized queries (Prisma)                |
|  - SQL injection prevention                      |
|  - Data encryption at rest (Supabase)            |
+--------------------------------------------------+
```

### 9.2 Rate Limiting Rules

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/register` | 5 requests | 15 minutes |
| `/api/auth/login` | 10 requests | 15 minutes |
| `/api/auth/forgot-password` | 3 requests | 1 hour |
| `/api/auth/reset-password` | 5 requests | 1 hour |
| API routes (general) | 100 requests | 1 minute |
| WebSocket events | 50 events | 10 seconds |

---

## 10. Validation Rules

### 10.1 Input Validation Matrix

| Field | Rules | Error Message |
|-------|-------|---------------|
| `email` | Valid email format, max 255 chars | "Invalid email address" |
| `password` | Min 8 chars, 1 uppercase, 1 number | "Password must be 8+ chars with uppercase and number" |
| `displayName` | 1-50 chars, no special chars | "Display name must be 1-50 characters" |
| `username` | 3-30 chars, alphanumeric + underscore | "Username: 3-30 chars, letters/numbers/underscores only" |
| `bio` | Max 200 chars | "Bio must be 200 characters or less" |
| `content` (message) | 1-5000 chars | "Message must be 1-5000 characters" |
| `avatar` | Max 5MB, JPEG/PNG/WebP | "Image must be under 5MB (JPEG, PNG, WebP)" |

### 10.2 Zod Schema Examples

```typescript
// User registration
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain a number"),
  displayName: z.string().min(1).max(50)
});

// Message
const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  tempId: z.string().optional()
});

// Settings update
const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  chatBackground: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  typingIndicator: z.boolean().optional(),
  readReceipts: z.boolean().optional()
});
```

---

## 11. Error Handling

### 11.1 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "password", "message": "Must be at least 8 characters" }
    ]
  }
}
```

### 11.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BAD_REQUEST` | 400 | Invalid request format |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `TOKEN_EXPIRED` | 401 | JWT token expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## 12. Scalability Plan

### 12.1 Current Scale (10-20 users)

```
Single Next.js instance on Vercel
Single Socket.io server on Railway/Render
Supabase (free tier)
Cloudinary (free tier)
```

### 12.2 Growth Scale (100+ users)

```
Vercel Pro (team features, analytics)
Multiple Socket.io servers + Redis adapter
Supabase Pro (connection pooling, backups)
Cloudinary paid plan (more storage)
CDN for static assets (Cloudflare)
```

### 12.3 Scale Triggers

| Metric | Current Limit | Scale Trigger | Action |
|--------|--------------|---------------|--------|
| Concurrent users | 20 | 50 | Add Redis adapter |
| Messages/day | 1,000 | 10,000 | Optimize queries, add caching |
| API requests/min | 100 | 500 | Add rate limiter, CDN |
| Storage | 1GB | 5GB | Upgrade Cloudinary plan |
| Database size | 500MB | 2GB | Optimize indexes, archive old data |

### 12.4 Query Optimization

```sql
-- Index strategy for message queries
CREATE INDEX idx_messages_conversation_sent 
  ON messages(conversation_id, sent_at DESC);

-- Partial index for unread messages
CREATE INDEX idx_messages_unread 
  ON messages(conversation_id, status) 
  WHERE status IN ('sent', 'delivered');

-- Covering index for conversation list
CREATE INDEX idx_conversations_updated 
  ON conversations(updated_at DESC) 
  INCLUDE (last_message_id);
```

---

## 13. Database Migration Strategy

### 13.1 Initial Migration

```bash
# Generate initial migration
npx prisma migrate dev --name init

# Apply to production
npx prisma migrate deploy
```

### 13.2 Migration Rules

1. **Always backward-compatible:** Never remove columns in the same deploy
2. **Two-phase migrations:** Add column → Update code → Remove old column
3. **Test migrations:** Run against copy of production data
4. **Rollback plan:** Keep previous version deployable

### 13.3 Seeding

```typescript
// prisma/seed.ts
const seedUsers = [
  {
    email: "admin@chatwithyou.app",
    password: await bcrypt.hash("AdminPass123!", 12),
    role: "ADMIN",
    profile: { displayName: "Admin", username: "admin" }
  }
];
```

---

## 14. Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/chatwithyou"
DIRECT_URL="postgresql://user:pass@host:5432/chatwithyou"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# App
NEXT_PUBLIC_APP_URL="https://chatwithyou.app"
NEXT_PUBLIC_WS_URL="wss://ws.chatwithyou.app"

# Optional: Redis (for scaling)
REDIS_URL="redis://localhost:6379"

# Optional: Sentry
SENTRY_DSN="https://your-dsn@sentry.io/project"

# Optional: Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-key"
EMAIL_FROM="noreply@chatwithyou.app"
```

---

## 15. API Versioning Strategy

Current version: **v1**

All endpoints prefixed with `/api/v1/...` (or `/api/...` for v1 as default)

Future versions will use:
- `/api/v2/...` for breaking changes
- Header-based: `Accept: application/vnd.chatwithyou.v2+json`
- Deprecation notices in response headers

---

## 16. WebSocket Event Specification

### 16.1 Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticate` | `{ token: string }` | Authenticate connection |
| `conversation:join` | `{ conversationId: string }` | Join conversation room |
| `conversation:leave` | `{ conversationId: string }` | Leave conversation room |
| `message:send` | `{ conversationId, content, tempId? }` | Send message |
| `message:read` | `{ conversationId }` | Mark messages as read |
| `typing:start` | `{ conversationId }` | Start typing indicator |
| `typing:stop` | `{ conversationId }` | Stop typing indicator |
| `presence:ping` | `{}` | Heartbeat ping |

### 16.2 Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticated` | `{ userId: string }` | Auth confirmed |
| `message:new` | `{ message, conversation }` | New message received |
| `message:sent` | `{ messageId, tempId, status }` | Message confirmed |
| `message:delivered` | `{ messageId, deliveredAt }` | Message delivered |
| `message:read` | `{ messageIds: string[], readerId }` | Messages read |
| `typing:start` | `{ userId, conversationId }` | User typing |
| `typing:stop` | `{ userId, conversationId }` | User stopped typing |
| `presence:online` | `{ userId, lastSeen? }` | User came online |
| `presence:offline` | `{ userId, lastSeen }` | User went offline |
| `error` | `{ code, message }` | Error notification |

---

## 17. Data Retention Policy

| Data Type | Retention | Action |
|-----------|-----------|--------|
| Messages | Indefinite | Keep unless account deleted |
| Notifications | 30 days | Auto-delete after 30 days |
| Sessions | 30 days inactive | Purge expired sessions |
| Failed login attempts | 24 hours | Clear after 24 hours |
| Password reset tokens | 15 minutes | Auto-expire |
| Deleted accounts | 30 days | Hard delete after grace period |
| WebSocket logs | 7 days | Rotate logs |

---

## 18. Backup Strategy

| Type | Frequency | Method |
|------|-----------|--------|
| Database | Daily | Supabase automated backups |
| Database | Weekly | Manual export for local archive |
| Code | Every commit | Git repository |
| Environment config | On change | Secure vault (1Password/Vercel) |

**Recovery Time Objective (RTO):** 1 hour  
**Recovery Point Objective (RPO):** 24 hours (daily backups)
