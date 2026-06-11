import { NextResponse } from 'next/server';
import {
  createSupabaseClientApi,
  createSupabaseClientServiceRole,
} from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const percentage = (success: number, total: number) =>
  total > 0 ? Math.round((success / total) * 100) : 0;

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
    const [
      quizAttemptsResult,
      quizProgressResult,
      simulatorProgressResult,
      quizzesResult,
      simulatorResult,
      scenariosResult,
      gamificationResult,
      activityResult,
      streakResult,
    ] = await Promise.all([
      serviceClient
        .from('quiz_attempts')
        .select(
          'id, quiz_id, score, total_questions, score_percent, points_awarded, created_at',
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      serviceClient
        .from('user_quiz_progress')
        .select('completed_100')
        .eq('user_id', user.id),
      serviceClient
        .from('user_simulator_progress')
        .select('completed')
        .eq('user_id', user.id),
      serviceClient
        .from('quizzes')
        .select('id, title, passing_score')
        .eq('is_published', true),
      serviceClient
        .from('ai_simulator_submissions')
        .select(
          'id, scenario_id, report, verdict, matched_defect_id, created_at',
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      serviceClient
        .from('ai_simulator_scenarios')
        .select('id, title')
        .eq('is_published', true),
      serviceClient
        .from('user_gamification')
        .select('total_points, level, level_name')
        .eq('user_id', user.id)
        .maybeSingle(),
      serviceClient
        .from('user_daily_activity')
        .select('activity_date')
        .eq('user_id', user.id)
        .order('activity_date'),
      serviceClient
        .from('user_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

    const firstError = [
      quizAttemptsResult.error,
      quizProgressResult.error,
      simulatorProgressResult.error,
      quizzesResult.error,
      simulatorResult.error,
      scenariosResult.error,
      gamificationResult.error,
      activityResult.error,
      streakResult.error,
    ].find(Boolean);
    if (firstError) throw firstError;

    const quizzes = new Map(
      (quizzesResult.data ?? []).map(quiz => [quiz.id, quiz]),
    );
    const scenarios = new Map(
      (scenariosResult.data ?? []).map(scenario => [
        scenario.id,
        scenario.title,
      ]),
    );
    const quizAttempts = quizAttemptsResult.data ?? [];
    const passedAttempts = quizAttempts.filter(
      attempt =>
        attempt.score_percent >=
        (quizzes.get(attempt.quiz_id)?.passing_score ?? 70),
    ).length;
    const simulatorSubmissions = simulatorResult.data ?? [];
    const correctSubmissions = simulatorSubmissions.filter(
      submission => submission.verdict === 'correct',
    ).length;
    const solvedDefects = new Set(
      simulatorSubmissions
        .filter(submission => submission.verdict === 'correct')
        .map(submission => submission.matched_defect_id)
        .filter(Boolean),
    ).size;
    const perfectQuizzes = (quizProgressResult.data ?? []).filter(
      progress => progress.completed_100,
    ).length;
    const completedSimulators = (simulatorProgressResult.data ?? []).filter(
      progress => progress.completed,
    ).length;

    const metadataName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split('@')[0] ??
      'QA Learner';

    return NextResponse.json(
      {
        profile: {
          email: user.email ?? '',
          displayName: metadataName,
          avatarUrl:
            user.user_metadata?.avatar_url ??
            user.user_metadata?.picture ??
            null,
        },
        gamification: {
          totalPoints: gamificationResult.data?.total_points ?? 0,
          level: gamificationResult.data?.level ?? 1,
          levelName: gamificationResult.data?.level_name ?? 'QA Trainee',
        },
        streak: {
          currentStreak: streakResult.data?.current_streak ?? 0,
          longestStreak: streakResult.data?.longest_streak ?? 0,
          lastActivityDate: streakResult.data?.last_activity_date ?? null,
          activeDates: (activityResult.data ?? []).map(
            day => day.activity_date,
          ),
        },
        quizStats: {
          attempts: quizAttempts.length,
          passed: passedAttempts,
          successRate: percentage(passedAttempts, quizAttempts.length),
          perfectQuizzes,
          totalQuizzes: quizzes.size,
          completionRate: percentage(perfectQuizzes, quizzes.size),
        },
        simulatorStats: {
          submissions: simulatorSubmissions.length,
          correct: correctSubmissions,
          successRate: percentage(
            correctSubmissions,
            simulatorSubmissions.length,
          ),
          solvedDefects,
          completedSimulators,
          totalSimulators: scenarios.size,
          completionRate: percentage(completedSimulators, scenarios.size),
        },
        quizHistory: quizAttempts.slice(0, 20).map(attempt => ({
          id: attempt.id,
          quizId: attempt.quiz_id,
          quizTitle: quizzes.get(attempt.quiz_id)?.title ?? attempt.quiz_id,
          score: attempt.score,
          totalQuestions: attempt.total_questions,
          scorePercent: attempt.score_percent,
          pointsAwarded: attempt.points_awarded,
          passed:
            attempt.score_percent >=
            (quizzes.get(attempt.quiz_id)?.passing_score ?? 70),
          createdAt: attempt.created_at,
        })),
        simulatorHistory: simulatorSubmissions.slice(0, 20).map(submission => ({
          id: submission.id,
          scenarioId: submission.scenario_id,
          scenarioTitle:
            scenarios.get(submission.scenario_id) ?? submission.scenario_id,
          report: submission.report,
          verdict: submission.verdict,
          createdAt: submission.created_at,
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load account';
    return NextResponse.json({ message }, { status: 500 });
  }
}
