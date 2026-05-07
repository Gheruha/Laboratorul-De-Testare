import { NextRequest, NextResponse } from 'next/server';
import { signUpUser } from '@/lib/utils/auth/auth.utils';
import { SignDto } from '@/lib/types/auth.type';
import { isSignDtoValid } from '@/lib/utils/auth/auth.utils';
import { checkUserExists } from '@/lib/utils/user/user.utils';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const body: unknown = await req.json();

    if (!isSignDtoValid(body)) {
      return NextResponse.json(
        { message: 'Invalid request body.' },
        { status: 400 },
      );
    }

    const { email, password }: SignDto = body;

    // Check if user already exist
    const doesUserExist = await checkUserExists(email);
    if (doesUserExist) {
      return NextResponse.json(
        { message: 'Already signed up, you must sign in.' },
        { status: 400 },
      );
    }

    // Sign up the user
    const userSession = await signUpUser({
      email,
      password,
      redirectUrl: `${url.origin}/api/auth/callback`,
    });

    return NextResponse.json({
      message:
        'Sign-up successful! Please check your email to verify your account.',
      session: userSession,
    });
  } catch (error: unknown) {
    console.error('Sign-up error', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
