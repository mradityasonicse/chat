import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { generateToken } from '@/lib/jwt';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Display name required')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName } = RegisterSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'user',
        profile: {
          create: {
            displayName,
            username: email.split('@')[0] + '_' + Math.random().toString(36).slice(2, 9)
          }
        },
        settings: {
          create: {}
        }
      },
      include: { profile: true, settings: true }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
