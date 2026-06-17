import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      include: { sender: { include: { profile: true } } },
      orderBy: { sentAt: 'asc' },
      take: 50
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: payload.userId,
        content: content.trim(),
        status: 'sent'
      },
      include: { sender: { include: { profile: true } } }
    });

    // Update conversation updated_at
    await prisma.conversation.update({
      where: { id: params.id },
      data: { 
        updatedAt: new Date(),
        lastMessageId: message.id
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Post message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
