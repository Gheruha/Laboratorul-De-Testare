import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
  try {
    revalidatePath('/api/sidebar/data');
    return NextResponse.json({ revalidated: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
