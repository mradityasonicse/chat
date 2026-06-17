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

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: payload.userId } },
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { profile: { displayName: { contains: query, mode: 'insensitive' } } },
              { profile: { username: { contains: query, mode: 'insensitive' } } }
            ]
          }
        ]
      },
      include: { profile: true },
      take: 10
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
