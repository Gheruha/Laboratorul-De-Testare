import { NextRequest, NextResponse } from 'next/server';
import { authWithCode } from '@/lib/utils/auth/auth.utils';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const authCode = url.searchParams.get('code');

    if (authCode) {
      await authWithCode(authCode);
    }

    return NextResponse.redirect(`${url.origin}/workspace`);
  } catch (error: unknown) {
    console.error('Callback failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
