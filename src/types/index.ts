export interface User {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  bio: string;
  lastSeen?: Date;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User & { profile?: Profile };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageId?: string;
}

export interface Participant {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: Date;
  lastReadAt?: Date;
  isTyping: boolean;
}
