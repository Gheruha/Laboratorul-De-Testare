import { NextResponse } from 'next/server';
import {
  createSupabaseClientApi,
  createSupabaseClientServiceRole,
} from '@/lib/supabase/client';
import type { Json } from '@/lib/types/database.types';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const authClient = await createSupabaseClientApi();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createSupabaseClientServiceRole();
    const { data: streak, error: streakError } = await serviceClient.rpc(
      'record_daily_activity',
      { p_user_id: user.id },
    );
    if (streakError) throw streakError;

    const now = new Date();
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    )
      .toISOString()
      .slice(0, 10);
    const nextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    )
      .toISOString()
      .slice(0, 10);
    const { data: activity, error: activityError } = await serviceClient
      .from('user_daily_activity')
      .select('activity_date')
      .eq('user_id', user.id)
      .gte('activity_date', monthStart)
      .lt('activity_date', nextMonth)
      .order('activity_date');

    if (activityError) throw activityError;

    return NextResponse.json(
      {
        ...(streak as Exclude<Json, null | string | number | boolean | Json[]>),
        activeDates: (activity ?? []).map(day => day.activity_date),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to record activity';
    return NextResponse.json({ message }, { status: 500 });
  }
}
