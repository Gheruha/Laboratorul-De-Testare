import { NextResponse } from 'next/server';
import {
  createSupabaseClientApi,
  createSupabaseClientServiceRole,
} from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authClient = await createSupabaseClientApi();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createSupabaseClientServiceRole();
    const { data, error } = await serviceClient
      .from('user_gamification')
      .select('total_points, level, level_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json(
      {
        totalPoints: data?.total_points ?? 0,
        level: data?.level ?? 1,
        levelName: data?.level_name ?? 'QA Trainee',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load points';
    return NextResponse.json({ message }, { status: 500 });
  }
}
