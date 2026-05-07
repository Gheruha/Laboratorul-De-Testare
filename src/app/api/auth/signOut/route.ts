import { NextResponse } from 'next/server';
import { signOutUser } from '@/lib/utils/auth/auth.utils';

export async function POST() {
  try {
    await signOutUser();

    return NextResponse.json({
      message: 'User signed out successfuly.',
    });
  } catch (error: unknown) {
    console.error('Sign-out error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
