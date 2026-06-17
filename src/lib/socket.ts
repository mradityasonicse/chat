import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function initializeSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Middleware for authentication
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      socket.userId = payload.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    // Join conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // New message event
    socket.on('new_message', async (conversationId: string, message: any) => {
      io.to(`conversation_${conversationId}`).emit('message_received', {
        ...message,
        senderId: socket.userId
      });

      // Update message status in database
      if (message.id) {
        await prisma.message.update({
          where: { id: message.id },
          data: { status: 'delivered' }
        });
      }
    });

    // Typing indicator
    socket.on('user_typing', (conversationId: string) => {
      socket.to(`conversation_${conversationId}`).emit('typing_indicator', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('user_stopped_typing', (conversationId: string) => {
      socket.to(`conversation_${conversationId}`).emit('typing_indicator', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // Message read receipt
    socket.on('message_read', async (messageId: string) => {
      await prisma.message.update({
        where: { id: messageId },
        data: { 
          status: 'read',
          readAt: new Date()
        }
      });

      io.emit('read_receipt', { messageId });
    });

    // Online status
    socket.on('user_online', async () => {
      await prisma.profile.update({
        where: { userId: socket.userId },
        data: { 
          isOnline: true,
          lastSeen: new Date()
        }
      });

      io.emit('presence_changed', { userId: socket.userId, isOnline: true });
    });

    socket.on('disconnect', async () => {
      console.log(`User ${socket.userId} disconnected`);

      if (socket.userId) {
        await prisma.profile.update({
          where: { userId: socket.userId },
          data: { 
            isOnline: false,
            lastSeen: new Date()
          }
        });

        io.emit('presence_changed', { userId: socket.userId, isOnline: false });
      }
    });
  });

  return io;
}
