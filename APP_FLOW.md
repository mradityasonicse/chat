# Chat With You - Application Flow Document

**Document Version:** 1.0  
**Last Updated:** 2026-06-16  
**Status:** Draft  

---

## 1. User Journey Map

```
DISCOVERY          ONBOARDING           ENGAGEMENT           RETENTION
    |                  |                     |                    |
    v                  v                     v                    v
+--------+      +-------------+      +----------------+     +-----------+
| Learns |      |  Creates    |      | Starts chats   |     | Customizes|
| about  |  --> |  account    |  --> | Sends messages | --> | settings  |
| app    |      |  Sets up    |      | Real-time conv |     | Invites   |
|        |      |  profile    |      | Discovers users|     | others    |
+--------+      +-------------+      +----------------+     +-----------+
```

---

## 2. Guest Flow

```
                    +------------------+
                    |   Landing Page   |
                    |  (Marketing/Info)|
                    +--------+---------+
                             |
                    +--------v---------+
                    |   CTA Buttons    |
                    |  Login | Sign Up|
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+       +-----------v--------+
    |   Login Page      |       |   Sign Up Page     |
    |   (/login)        |       |   (/register)      |
    +-------------------+       +--------------------+
```

**Guest Access Rules:**
- Unauthenticated users can only access `/login` and `/register`
- All other routes redirect to `/login`
- Landing page shows app overview and value proposition

---

## 3. Signup Flow

```
+------------------+     +------------------+     +------------------+
|   Sign Up Page   |     |  Email Verification|   |   Onboarding     |
|                  |     |                  |     |                  |
| - Email input    | --> | - Check email    | --> | - Set display    |
| - Password input |     | - Verify token   |     |   name           |
| - Confirm pass   |     | - Auto-verify    |     | - Upload avatar  |
| - Submit button  |     |   on click       |     | - Complete       |
+------------------+     +------------------+     +------------------+
        |                                                    |
        v                                                    v
+------------------+                               +------------------+
| Validation Error |                               |   Dashboard      |
| (show inline)    |                               |   (/dashboard)   |
+------------------+                               +------------------+
```

**Detailed Flow:**

1. **User accesses `/register`**
2. **Form displayed:**
   - Email field (validated: format, uniqueness)
   - Password field (validated: min 8 chars, 1 uppercase, 1 number)
   - Confirm password (must match)
   - "Create Account" button
   - Link to login page
3. **Client-side validation** on blur/submit
4. **Submit to API:** `POST /api/auth/register`
5. **Server validation:**
   - Check email uniqueness
   - Hash password (bcrypt)
   - Create user record
   - Create profile record
   - Generate JWT tokens
6. **Auto-login** after successful registration
7. **Redirect to onboarding** (first-time) or dashboard (returning)
8. **Error handling:**
   - Email exists → show error, suggest login
   - Validation fails → inline errors
   - Server error → toast notification

---

## 4. Login Flow

```
+------------------+     +------------------+     +------------------+
|   Login Page     |     |   2FA (Future)   |     |   Dashboard      |
|                  |     |                  |     |                  |
| - Email input    | --> | - OTP input      | --> |   (/dashboard)   |
| - Password input |     | - Verify         |     |                  |
| - Remember me    |     |                  |     |                  |
| - Submit button  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |
        v
+------------------+     +------------------+
| Forgot Password? | --> | Password Reset   |
| Link             |     | Flow             |
+------------------+     +------------------+
```

**Detailed Flow:**

1. **User accesses `/login`**
2. **Form displayed:**
   - Email field
   - Password field
   - "Remember me" checkbox
   - "Sign In" button
   - "Forgot password?" link
   - Link to register page
3. **Client-side validation**
4. **Submit to API:** `POST /api/auth/login`
5. **Server validation:**
   - Find user by email
   - Verify password (bcrypt compare)
   - Generate JWT access + refresh tokens
   - Store refresh token hash
6. **Store tokens:**
   - Access token: httpOnly cookie
   - Refresh token: httpOnly cookie
7. **Initialize WebSocket** connection
8. **Redirect to dashboard**
9. **Error handling:**
   - Invalid credentials → generic error (security)
   - Account not found → suggest registration
   - Server error → retry option

---

## 5. Forgot Password Flow

```
+------------------+     +------------------+     +------------------+
| Forgot Password  |     | Check Email      |     | Reset Password   |
|                  |     |                  |     |                  |
| - Email input    | --> | - Instructions   | --> | - New password   |
| - Submit         |     | - Resend option  |     | - Confirm        |
|                  |     | - 15-min expiry  |     | - Submit         |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
                                                   +------------------+
                                                   | Login Page       |
                                                   | (redirect)       |
                                                   +------------------+
```

**Detailed Flow:**

1. **User clicks "Forgot password?"** on login page
2. **Form displayed:**
   - Email input
   - "Send Reset Link" button
3. **Submit to API:** `POST /api/auth/forgot-password`
4. **Server:**
   - Find user by email (always return success — don't leak existence)
   - Generate secure random token (32 bytes)
   - Store hashed token with expiry (15 minutes)
   - Send email with reset link
5. **Show success message** (regardless of email existence)
6. **User clicks email link** → `/reset-password?token=xyz`
7. **Verify token:** `GET /api/auth/verify-reset-token`
8. **Reset form:**
   - New password
   - Confirm password
9. **Submit:** `POST /api/auth/reset-password`
10. **Server:**
    - Verify token
    - Hash new password
    - Update user record
    - Invalidate all existing sessions
    - Delete reset token
11. **Redirect to login** with success message

---

## 6. Dashboard Flow

```
+------------------+     +------------------+     +------------------+
|   Dashboard      |     |  Conversation    |     |   Chat View      |
|   (/dashboard)   |     |  List (Sidebar)  |     |   (Main Panel)   |
|                  |     |                  |     |                  |
| +--------------+ |     | +--------------+ |     | +--------------+ |
| |   Header     | |     | |  Search Bar  | |     | | Chat Header  | |
| | (User menu)  | |     | |  (Cmd+K)     | |     | | (User info)  | |
| +--------------+ |     | +--------------+ |     | +--------------+ |
| |              | |     | |              | |     | |              | |
| |   Sidebar    | | --> | | Conversation | | --> | |  Messages    | |
| |   + Main     | |     | | Items        | |     | |  (Scrollable)| |
| |              | |     | |              | |     | |              | |
| +--------------+ |     | +--------------+ |     | +--------------+ |
|                  |     |                  |     | |  Input Area  | |
|                  |     |                  |     | +--------------+ |
+------------------+     +------------------+     +------------------+
```

**Dashboard Layout:**
- **Three-column layout** (desktop):
  - Left: Navigation/Conversation list (280px)
  - Center: Chat area (flexible)
  - Right: Optional info panel (future)
- **Two-column layout** (tablet):
  - Collapsible sidebar
  - Full chat area
- **Single-column** (mobile):
  - Conversation list OR chat view
  - Back button to switch

**Conversation List States:**
```
+----------------------------------+
| Search... (Cmd+K)               |
+----------------------------------+
|                                  |
| [Avatar] John Doe       2m ago  |
| [Online] Hey! How are...  [2]   |
|                                  |
| [Avatar] Jane Smith     1h ago  |
| [Offline] See you tomorrow      |
|                                  |
| [Avatar] Mike Johnson   3h ago  |
| [Online] Thanks!                |
|                                  |
+----------------------------------+
|         Empty State              |
|   "No conversations yet"         |
|   "Search for users to start"    |
+----------------------------------+
```

---

## 7. Profile Flow

```
+------------------+     +------------------+     +------------------+
| Dashboard        |     | Profile Modal/   |     | Edit Profile     |
|                  |     | Page             |     |                  |
| User clicks      | --> | - View profile   | --> | - Edit name      |
| avatar/menu      |     | - Edit button    |     | - Change avatar  |
|                  |     | - Settings link  |     | - Update bio     |
+------------------+     +------------------+     +------------------+
                               |                          |
                               v                          v
                        +------------------+     +------------------+
                        | Settings Panel   |     | Save changes     |
                        |                  |     | Validation       |
                        | - Theme          |     | Success toast    |
                        | - Notifications  |     +------------------+
                        | - Security       |
                        | - Logout         |
                        +------------------+
```

---

## 8. Search Flow

```
+------------------+     +------------------+     +------------------+
|  Trigger Search  |     |  Search Modal    |     |  User Selected   |
|                  |     |                  |     |                  |
| - Click search   | --> | - Input field    | --> | - Check existing |
| - Cmd/Ctrl+K     |     | - Recent searches|     |   conversation   |
|                  |     | - Live results   |     | - Create or open |
+------------------+     +------------------+     +------------------+
                                                          |
                                    +---------------------+---------------------+
                                    |                                           |
                            +-------v--------+                        +---------v---------+
                            | Conversation   |                        | New Conversation  |
                            | Exists         |                        | Created           |
                            |                |                        |                   |
                            | Open existing  |                        | Show in list      |
                            +----------------+                        | Open chat         |
                                                                      +-------------------+
```

**Detailed Search Flow:**

1. **Trigger:** Cmd/Ctrl+K or click search bar
2. **Modal opens** with focus on input
3. **Default state:** Show recent searches (last 5)
4. **Typing state:** Debounced 300ms API call
5. **API:** `GET /api/users/search?q={query}`
6. **Results:**
   - Avatar, name, username, online status
   - Keyboard navigation (↑/↓/Enter)
7. **Selection:**
   - Check if conversation exists
   - If yes: navigate to conversation
   - If no: create conversation, then navigate

---

## 9. Conversation Flow

```
+------------------+     +------------------+     +------------------+
|  Select/Create   |     |  Load Messages   |     |  Send Message    |
|  Conversation    |     |                  |     |                  |
|                  | --> | - Fetch history  | --> | - Optimistic UI  |
| - From list      |     | - Join WS room   |     | - WS broadcast   |
| - From search    |     | - Mark as read   |     | - Persist to DB  |
| - Auto-created   |     | - Scroll to bottom|    | - Update status  |
+------------------+     +------------------+     +------------------+
        |                                                    |
        v                                                    v
+------------------+                               +------------------+
|  Real-time Updates                              |  Message States  |
|                                                  |                  |
| - New messages     <----------------------------| - Sending       |
| - Typing indicators                              | - Sent          |
| - Read receipts                                  | - Delivered     |
| - Presence changes                               | - Read          |
+------------------+                               +------------------+
```

**Conversation Lifecycle:**

1. **Create/Select**
   - Check for existing conversation
   - Create if new: `POST /api/conversations`
   - Fetch messages: `GET /api/conversations/:id/messages`
   - Join WebSocket room

2. **Message Loading**
   - Load last 50 messages
   - Paginated scroll-up loading (infinite scroll)
   - Mark unread messages as read

3. **Send Message**
   - User types in input
   - Optimistic UI: show immediately
   - WebSocket emit: `message:send`
   - Server persists to database
   - Server broadcasts to recipient
   - Sender receives confirmation
   - Status updates: Sending → Sent → Delivered → Read

4. **Receive Message**
   - WebSocket event: `message:new`
   - If conversation active: append, mark read
   - If conversation inactive: increment badge, notify

5. **Read Receipts**
   - User opens conversation → emit `conversation:read`
   - Server marks messages as read
   - Broadcast `message:read` to sender
   - Sender UI updates checkmarks

---

## 10. Messaging Flow (Detailed)

```
SENDER SIDE                              SERVER                              RECIPIENT SIDE
------------                             ------                              ---------------
     |                                      |                                      |
     |  1. Type message                     |                                      |
     |  2. Press Enter                      |                                      |
     |                                      |                                      |
     |  3. Optimistic UI:                   |                                      |
     |     Add to messages list             |                                      |
     |     Status: "sending"                |                                      |
     |                                      |                                      |
     |  4. WS: message:send                 |                                      |
     | ------------------------------------>|                                      |
     |     {content, conversationId,        |                                      |
     |      tempId, timestamp}              |                                      |
     |                                      |  5. Validate message                 |
     |                                      |  6. Save to database                 |
     |                                      |  7. Update conversation              |
     |                                      |     (lastMessage, updatedAt)         |
     |                                      |                                      |
     |  8. WS: message:sent                 |                                      |
     | <------------------------------------|                                      |
     |     {messageId, tempId, status}      |                                      |
     |                                      |                                      |
     |  9. Update UI:                       |  10. WS: message:new                |
     |     Status: "sent"                   | ------------------------------------>|
     |                                      |     {message, conversation}          |
     |                                      |                                      |
     |                                      |                                      |  11. If active conv:
     |                                      |                                      |     Append message
     |                                      |                                      |     Send read receipt
     |                                      |                                      |
     |                                      |  12. WS: message:read               |
     |                                      | <------------------------------------|
     |                                      |                                      |
     |  13. WS: message:read               |                                      |
     | <------------------------------------|                                      |
     |     {messageIds}                     |                                      |
     |                                      |                                      |
     |  14. Update UI:                      |                                      |
     |     Status: "read"                   |                                      |
     |     Update checkmarks                |                                      |
```

---

## 11. Settings Flow

```
+------------------+     +------------------+     +------------------+
|  Open Settings   |     |  Settings Panel  |     |  Section Detail  |
|                  |     |  (Slide-over)    |     |                  |
| - Click gear     | --> |                  | --> | - Form fields    |
| - Menu item      |     | - Account        |     | - Toggles        |
|                  |     | - Appearance     |     | - Save/Cancel    |
+------------------+     | - Notifications  |     +------------------+
                         | - Security       |              |
                         | - About          |              v
                         |                  |     +------------------+
                         +------------------+     |  Confirmation    |
                               |                  |  - Toast         |
                               v                  |  - Auto-save     |
                        +------------------+      +------------------+
                        |  Close Settings  |
                        |  - Click overlay |
                        |  - Press Escape  |
                        |  - Click close   |
                        +------------------+
```

**Settings Sections:**

1. **Account**
   - Profile photo (upload, remove)
   - Display name (edit)
   - Bio/status (edit)
   - Email (view only)

2. **Appearance**
   - Theme: Light / Dark / System
   - Chat background: solid, gradient, pattern
   - Preview of changes

3. **Notifications**
   - Browser notifications: on/off
   - Sound: on/off
   - Muted conversations list

4. **Security**
   - Change password
   - Active sessions (view, revoke)
   - Log out all devices
   - Delete account

---

## 12. Admin Flow

```
+------------------+     +------------------+     +------------------+
|  Admin Access    |     |  Admin Dashboard |     |  User Detail     |
|                  |     |                  |     |                  |
| - Route: /admin  | --> | - Stats cards    | --> | - Profile info   |
| - Role check     |     | - User table     |     | - Activity       |
| - Redirect if    |     | - Search/filter  |     | - Actions        |
|   not admin      |     | - Pagination     |     |                  |
+------------------+     +------------------+     +------------------+
```

**Admin Dashboard:**
- **Stats Row:** Total users, active today, messages sent, new this week
- **Users Table:**
  - Columns: Avatar, Name, Email, Status, Joined Date, Actions
  - Sortable columns
  - Search by name/email
  - Filter by status
  - Pagination (25 per page)
- **Actions:**
  - View profile
  - Deactivate account
  - Delete account
  - Promote to admin

---

## 13. Logout Flow

```
+------------------+     +------------------+     +------------------+
|  Trigger Logout  |     |  Cleanup         |     |  Redirect        |
|                  |     |                  |     |                  |
| - Settings menu  | --> | - Clear tokens   | --> | - /login page    |
| - Confirm dialog |     | - Disconnect WS  |     | - Clear state    |
|                  |     | - Clear cache    |     | - Show message   |
+------------------+     | - Reset store    |     +------------------+
                         +------------------+
```

---

## 14. State Management Flow

```
+-----------------------------------------------------------+
|                      Global Store                          |
|  (Zustand / React Context)                                |
+-----------------------------------------------------------+
|                                                            |
|  +----------------+  +----------------+  +--------------+ |
|  |   Auth State   |  |   Chat State   |  |  UI State    | |
|  |                |  |                |  |              | |
|  | - user         |  | - conversations|  | - theme      | |
|  | - token        |  | - activeConv   |  | - sidebar    | |
|  | - isLoading    |  | - messages     |  |   open       | |
|  | - isAdmin      |  | - typingUsers  |  | - settings   | |
|  |                |  | - unreadCounts |  |   open       | |
|  +--------+-------+  +--------+-------+  +------+-------+ |
|           |                   |                  |         |
+-----------|-------------------|------------------|---------+
            |                   |                  |
            v                   v                  v
    +---------------+   +---------------+   +---------------+
    |  Persist to   |   |  Sync with    |   |  Local        |
    |  localStorage |   |  WebSocket    |   |  Storage      |
    |  (remember)   |   |  (real-time)  |   |  (preferences)|
    +---------------+   +---------------+   +---------------+
```

**State Synchronization:**

| State Type | Storage | Sync Method |
|------------|---------|-------------|
| Auth token | httpOnly cookie | Automatic (browser) |
| User profile | Zustand store | API fetch on login |
| Conversations | Zustand + localStorage | WebSocket events |
| Messages | Zustand (per conversation) | WebSocket + API |
| UI preferences | localStorage | Immediate |
| Online status | WebSocket | Real-time |

---

## 15. Real-Time Flow

```
                    WebSocket Connection Lifecycle
                    =============================

    CLIENT                              SERVER
    ------                              ------
      |                                   |
      |  1. Authenticate (JWT cookie)     |
      |---------------------------------->|
      |                                   |
      |  2. Connection established        |
      |<----------------------------------|
      |     {userId, socketId}            |
      |                                   |
      |  3. Join user room                |
      |---------------------------------->|
      |     room: `user:{userId}`         |
      |                                   |
      |  4. Broadcast online status       |
      |     to all friends                |
      |                                   |
      |<==================================|  Events
      |                                   |
      |  message:new                      |
      |  message:sent                     |
      |  message:read                     |
      |  typing:start                     |
      |  typing:stop                      |
      |  presence:online                  |
      |  presence:offline                 |
      |                                   |
      |  5. Heartbeat ping/pong           |
      |<--------------->|                 |
      |     (every 30s)                   |
      |                                   |
      |  6. Disconnect                    |
      |     (navigate away, close)        |
      |----------------------------------x|
      |                                   |
      |  7. Grace period (60s)            |
      |     before marking offline        |
      |                                   |
      |  8. Auto-reconnect                |
      |     (exponential backoff)         |
      |                                   |
```

**WebSocket Events:**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `connection` | C→S | JWT (auto) | Authenticate connection |
| `disconnect` | C→S | - | Close connection |
| `conversation:join` | C→S | `{conversationId}` | Join conversation room |
| `conversation:leave` | C→S | `{conversationId}` | Leave conversation room |
| `message:send` | C→S | `{content, conversationId, tempId}` | Send message |
| `message:read` | C→S | `{conversationId}` | Mark conversation as read |
| `typing:start` | C→S | `{conversationId}` | Start typing indicator |
| `typing:stop` | C→S | `{conversationId}` | Stop typing indicator |
| `message:new` | S→C | `{message, conversation}` | New message received |
| `message:sent` | S→C | `{messageId, tempId}` | Message confirmed sent |
| `message:read` | S→C | `{messageIds, readerId}` | Messages read by recipient |
| `typing:start` | S→C | `{userId, conversationId}` | User is typing |
| `typing:stop` | S→C | `{userId, conversationId}` | User stopped typing |
| `presence:online` | S→C | `{userId}` | User came online |
| `presence:offline` | S→C | `{userId, lastSeen}` | User went offline |
| `error` | S→C | `{code, message}` | Error notification |

---

## 16. Notification Flow

```
+------------------+     +------------------+     +------------------+
|  New Message     |     |  Notification    |     |  User Action     |
|  Received        |     |  Decision        |     |                  |
|                  |     |                  |     |                  |
| - WS event       | --> | - App focused?   | --> | - Click: open    |
|   message:new    |     | - Conversation   |     |   conversation   |
|                  |     |   active?        |     | - Dismiss: ignore|
+------------------+     | - Notifications  |     | - Settings: mute |
                         |   enabled?       |     +------------------+
                         | - Sound enabled? |
                         +------------------+
                                  |
                                  v
                         +------------------+
                         |  Deliver         |
                         |  - Browser push  |
                         |  - In-app badge  |
                         |  - Sound effect  |
                         +------------------+
```

**Notification Rules:**

| Scenario | Behavior |
|----------|----------|
| App focused + conversation active | No notification, just append message |
| App focused + other conversation | Badge update, subtle sound |
| App in background | Browser push notification + sound |
| Notifications disabled | Badge only, no sound |
| Conversation muted | No notification at all |
| Do not disturb | Badge only, stored silently |

---

## 17. Error Handling Flow

```
+------------------+     +------------------+     +------------------+
|  Error Detected  |     |  Error Type      |     |  User Response   |
|                  |     |                  |     |                  |
| - API error      | --> | - Network        | --> | - Retry button   |
| - WS error       |     | - Auth           |     | - Login redirect |
| - Validation     |     | - Server         |     | - Inline error   |
| - Timeout        |     | - Client         |     | - Toast message  |
+------------------+     +------------------+     +------------------+
```

**Error Categories:**

| Code | Type | User Message | Action |
|------|------|--------------|--------|
| `NETWORK_ERROR` | Connection lost | "Connection lost. Retrying..." | Auto-retry |
| `AUTH_EXPIRED` | Session expired | "Session expired. Please log in again." | Redirect to login |
| `AUTH_INVALID` | Invalid credentials | "Invalid email or password." | Show inline |
| `RATE_LIMITED` | Too many requests | "Too many attempts. Please wait." | Show timer |
| `SERVER_ERROR` | Server error | "Something went wrong. Please try again." | Retry button |
| `NOT_FOUND` | Resource not found | "This conversation doesn't exist." | Redirect |
| `FORBIDDEN` | Access denied | "You don't have permission." | Go back |
| `VALIDATION` | Invalid input | Field-specific errors | Show inline |

---

## 18. Data Flow Diagram

```
+--------+     +-----------+     +-------------+     +------------+
| Client |     |  Next.js  |     |  WebSocket  |     | PostgreSQL |
|        |     |  API      |     |  Server     |     | (Prisma)   |
+---+----+     +-----+-----+     +------+------+     +-----+------+
    |                |                  |                  |
    |  HTTP Request  |                  |                  |
    |--------------->|                  |                  |
    |                |  DB Query        |                  |
    |                |------------------------------------->|
    |                |                  |  DB Result       |
    |                |<-------------------------------------|
    |                |                  |                  |
    |  HTTP Response |                  |                  |
    |<---------------|                  |                  |
    |                |                  |                  |
    |  WS Connect    |                  |                  |
    |---------------------------------->|                  |
    |                |                  |  Auth check      |
    |                |                  |----------------->|
    |                |                  |  Session valid   |
    |                |                  |<-----------------|
    |  WS Events     |                  |                  |
    |<--------------------------------->|                  |
    |                |                  |  Persist msg     |
    |                |                  |----------------->|
    |                |                  |  Confirm         |
    |                |                  |<-----------------|
    |  Broadcast     |                  |                  |
    |                |                  |  Push to others  |
    |                |                  |------->          |
```

---

## 19. Flow Diagram Summary

```
                           APPLICATION FLOW OVERVIEW
                           ========================

                                +---------+
                                | Landing |
                                |  Page   |
                                +----+----+
                                     |
                    +----------------+----------------+
                    |                                 |
               +----v----+                      +----v----+
               |  Login  |                      | Sign Up |
               +----+----+                      +----+----+
                    |                                 |
                    +----------------+----------------+
                                     |
                                +----v----+
                                | Onboard |
                                |  (new)  |
                                +----+----+
                                     |
                                +----v---------+
                                |  Dashboard   |
                                |              |
                                | +----------+ |
                                | | Sidebar  | |
                                | | (conv list|
                                | +----------+ |
                                | +----------+ |
                                | | Chat     | |
                                | | Area     | |
                                | +----------+ |
                                +----+----+----+
                                     |
                    +----------------+----------------+
                    |                |                |
               +----v----+     +----v----+     +----v----+
               | Search  |     | Settings|     | Profile |
               | (Cmd+K) |     | (slide) |     | (modal) |
               +----+----+     +----+----+     +----+----+
                    |                |                |
                    v                v                v
               +---------+     +---------+     +---------+
               | New Chat|     | Theme   |     | Edit    |
               | (create)|     | Notif   |     | Avatar  |
               +---------+     | Security|     | Name    |
                               +---------+     +---------+
                                     |
                                +----v----+
                                |  Admin  |
                                | (role)  |
                                +---------+
                                     |
                                +----v---------+
                                |   Logout     |
                                |   (/login)   |
                                +--------------+
```
