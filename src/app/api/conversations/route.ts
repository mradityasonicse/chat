import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
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

    // Get conversations for this user
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: payload.userId }
        }
      },
      include: {
        participants: {
          include: { user: { include: { profile: true } } }
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { participantIds } = await request.json();

    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: 'Invalid participants' }, { status: 400 });
    }

    // Add current user to participants
    const allParticipants = [payload.userId, ...participantIds];

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: { in: allParticipants }
          }
        }
      }
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        creatorId: payload.userId,
        participants: {
          createMany: {
            data: allParticipants.map((userId) => ({ userId }))
          }
        }
      },
      include: {
        participants: {
          include: { user: { include: { profile: true } } }
        }
      }
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
