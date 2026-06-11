import { NextRequest, NextResponse } from 'next/server';
import {
  createSupabaseClientApi,
  createSupabaseClientServiceRole,
} from '@/lib/supabase/client';
import type { PublicSocialProfile } from '@/lib/types/social.type';

export const dynamic = 'force-dynamic';

const userIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const percentage = (success: number, total: number) =>
  total > 0 ? Math.round((success / total) * 100) : 0;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authClient = await createSupabaseClientApi();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!userIdPattern.test(id)) {
      return NextResponse.json({ message: 'Invalid user' }, { status: 400 });
    }

    const serviceClient = createSupabaseClientServiceRole();
    const [
      profileResult,
      followersResult,
      followingResult,
      relationshipResult,
      gamificationResult,
      quizAttemptsResult,
      quizProgressResult,
      quizzesResult,
      simulatorSubmissionsResult,
      simulatorProgressResult,
      scenariosResult,
    ] = await Promise.all([
      serviceClient
        .from('user_profiles')
        .select('user_id, display_name, avatar_url')
        .eq('user_id', id)
        .maybeSingle(),
      serviceClient
        .from('user_follows')
        .select('follower_id', { count: 'exact', head: true })
        .eq('following_id', id),
      serviceClient
        .from('user_follows')
        .select('following_id', { count: 'exact', head: true })
        .eq('follower_id', id),
      serviceClient
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .eq('following_id', id)
        .maybeSingle(),
      serviceClient
        .from('user_gamification')
        .select('total_points, level, level_name')
        .eq('user_id', id)
        .maybeSingle(),
      serviceClient
        .from('quiz_attempts')
        .select('score_percent, quiz_id')
        .eq('user_id', id),
      serviceClient
        .from('user_quiz_progress')
        .select('completed_100')
        .eq('user_id', id),
      serviceClient
        .from('quizzes')
        .select('id, passing_score')
        .eq('is_published', true),
      serviceClient
        .from('ai_simulator_submissions')
        .select('verdict')
        .eq('user_id', id),
      serviceClient
        .from('user_simulator_progress')
        .select('completed')
        .eq('user_id', id),
      serviceClient
        .from('ai_simulator_scenarios')
        .select('id')
        .eq('is_published', true),
    ]);

    const firstError = [
      profileResult.error,
      followersResult.error,
      followingResult.error,
      relationshipResult.error,
      gamificationResult.error,
      quizAttemptsResult.error,
      quizProgressResult.error,
      quizzesResult.error,
      simulatorSubmissionsResult.error,
      simulatorProgressResult.error,
      scenariosResult.error,
    ].find(Boolean);
    if (firstError) throw firstError;
    if (!profileResult.data) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const quizzes = new Map(
      (quizzesResult.data ?? []).map(quiz => [quiz.id, quiz.passing_score]),
    );
    const quizAttempts = quizAttemptsResult.data ?? [];
    const passedQuizAttempts = quizAttempts.filter(
      attempt => attempt.score_percent >= (quizzes.get(attempt.quiz_id) ?? 70),
    ).length;
    const simulatorSubmissions = simulatorSubmissionsResult.data ?? [];
    const correctSimulatorSubmissions = simulatorSubmissions.filter(
      submission => submission.verdict === 'correct',
    ).length;
    const completedQuizzes = (quizProgressResult.data ?? []).filter(
      progress => progress.completed_100,
    ).length;
    const completedSimulators = (simulatorProgressResult.data ?? []).filter(
      progress => progress.completed,
    ).length;

    const response: PublicSocialProfile = {
      id: profileResult.data.user_id,
      displayName: profileResult.data.display_name,
      avatarUrl: profileResult.data.avatar_url,
      isFollowing: Boolean(relationshipResult.data),
      followersCount: followersResult.count ?? 0,
      followingCount: followingResult.count ?? 0,
      gamification: {
        totalPoints: gamificationResult.data?.total_points ?? 0,
        level: gamificationResult.data?.level ?? 1,
        levelName: gamificationResult.data?.level_name ?? 'QA Trainee',
      },
      quizStats: {
        successRate: percentage(passedQuizAttempts, quizAttempts.length),
        completed: completedQuizzes,
        total: quizzes.size,
        completionRate: percentage(completedQuizzes, quizzes.size),
      },
      simulatorStats: {
        successRate: percentage(
          correctSimulatorSubmissions,
          simulatorSubmissions.length,
        ),
        completed: completedSimulators,
        total: scenariosResult.data?.length ?? 0,
        completionRate: percentage(
          completedSimulators,
          scenariosResult.data?.length ?? 0,
        ),
      },
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load profile';
    return NextResponse.json({ message }, { status: 500 });
  }
}
