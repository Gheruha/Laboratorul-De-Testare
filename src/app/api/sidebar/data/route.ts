export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getDefaultSidebarOptions } from '@/lib/utils/sidebar/sidebar.utils';

export async function GET() {
  try {
    const data = await getDefaultSidebarOptions();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
