export const runtime = 'edge';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getDefaultSidebarOptions } from '@/lib/utils/sidebar/sidebar.utils';

export async function GET() {
  try {
    const data = await getDefaultSidebarOptions();
    return NextResponse.json(data, {
      // Cache getDefaultSidebarOptions response on Vercel's edge for 24 hours.
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
