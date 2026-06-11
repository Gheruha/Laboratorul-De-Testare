import { NextRequest, NextResponse } from 'next/server';
import {
  createSupabaseClientApi,
  createSupabaseClientServiceRole,
} from '@/lib/supabase/client';
import type { SocialDirectoryData, SocialUser } from '@/lib/types/social.type';

export const dynamic = 'force-dynamic';

const userIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const mapUser = (
  profile: { user_id: string; display_name: string; avatar_url: string | null },
  followingIds: Set<string>,
): SocialUser => ({
  id: profile.user_id,
  displayName: profile.display_name,
  avatarUrl: profile.avatar_url,
  isFollowing: followingIds.has(profile.user_id),
});

async function getAuthenticatedUserId() {
  const authClient = await createSupabaseClientApi();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  return user?.id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createSupabaseClientServiceRole();
    const query =
      request.nextUrl.searchParams.get('q')?.trim().slice(0, 80) ?? '';
    const list = request.nextUrl.searchParams.get('list');

    const [followersResult, followingResult] = await Promise.all([
      serviceClient
        .from('user_follows')
        .select('follower_id', { count: 'exact', head: true })
        .eq('following_id', userId),
      serviceClient
        .from('user_follows')
        .select('following_id', { count: 'exact' })
        .eq('follower_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    if (followersResult.error) throw followersResult.error;
    if (followingResult.error) throw followingResult.error;

    const followingIds = new Set(
      (followingResult.data ?? []).map(follow => follow.following_id),
    );
    let profiles: {
      user_id: string;
      display_name: string;
      avatar_url: string | null;
    }[] = [];

    if (query.length >= 2) {
      const escapedQuery = query.replace(
        /[%_]/g,
        character => `\\${character}`,
      );
      const nameResult = await serviceClient
        .from('user_profiles')
        .select('user_id, display_name, avatar_url')
        .ilike('display_name', `%${escapedQuery}%`)
        .neq('user_id', userId)
        .limit(20);
      if (nameResult.error) throw nameResult.error;
      profiles = nameResult.data ?? [];
    } else if (list === 'followers') {
      const followerIdsResult = await serviceClient
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', userId)
        .order('created_at', { ascending: false });

      if (followerIdsResult.error) throw followerIdsResult.error;
      const followerIds = (followerIdsResult.data ?? []).map(
        follow => follow.follower_id,
      );

      if (followerIds.length > 0) {
        const profilesResult = await serviceClient
          .from('user_profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', followerIds);

        if (profilesResult.error) throw profilesResult.error;
        profiles = profilesResult.data ?? [];
      }
    } else if (followingIds.size > 0) {
      const profilesResult = await serviceClient
        .from('user_profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', Array.from(followingIds));

      if (profilesResult.error) throw profilesResult.error;
      profiles = profilesResult.data ?? [];
    }

    const response: SocialDirectoryData = {
      followersCount: followersResult.count ?? 0,
      followingCount: followingResult.count ?? 0,
      users: profiles.map(profile => mapUser(profile, followingIds)),
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load users';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { userId?: unknown };
    if (
      typeof body.userId !== 'string' ||
      !userIdPattern.test(body.userId) ||
      body.userId === userId
    ) {
      return NextResponse.json({ message: 'Invalid user' }, { status: 400 });
    }

    const serviceClient = createSupabaseClientServiceRole();
    const { data: profile, error: profileError } = await serviceClient
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', body.userId)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { error } = await serviceClient
      .from('user_follows')
      .upsert(
        { follower_id: userId, following_id: body.userId },
        { onConflict: 'follower_id,following_id', ignoreDuplicates: true },
      );

    if (error) throw error;
    return NextResponse.json({ following: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to follow user';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { userId?: unknown };
    if (typeof body.userId !== 'string' || !userIdPattern.test(body.userId)) {
      return NextResponse.json({ message: 'Invalid user' }, { status: 400 });
    }

    const serviceClient = createSupabaseClientServiceRole();
    const { error } = await serviceClient
      .from('user_follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', body.userId);

    if (error) throw error;
    return NextResponse.json({ following: false });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to unfollow user';
    return NextResponse.json({ message }, { status: 500 });
  }
}
