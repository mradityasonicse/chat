import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<Response>
) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return handler(request, payload);
}
