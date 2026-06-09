import { NextRequest, NextResponse } from 'next/server';
import {
  createSupabaseClientApi,
  createSupabaseClientServiceRole,
} from '@/lib/supabase/client';
import type { Json } from '@/lib/types/database.types';

type Answers = Record<string, string[]>;

const isAnswers = (value: unknown): value is Answers => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return Object.values(value).every(
    answer =>
      Array.isArray(answer) &&
      answer.every(optionId => typeof optionId === 'string'),
  );
};

const authenticate = async () => {
  const client = await createSupabaseClientApi();
  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const serviceClient = createSupabaseClientServiceRole();
    const [attemptsResult, progressResult] = await Promise.all([
      serviceClient
        .from('quiz_attempts')
        .select(
          'id, score, total_questions, score_percent, points_awarded, created_at',
        )
        .eq('user_id', user.id)
        .eq('quiz_id', id)
        .order('created_at', { ascending: false })
        .limit(5),
      serviceClient
        .from('user_quiz_progress')
        .select(
          'best_score_percent, points_earned, completed_100, attempt_count',
        )
        .eq('user_id', user.id)
        .eq('quiz_id', id)
        .maybeSingle(),
    ]);

    if (attemptsResult.error) throw attemptsResult.error;
    if (progressResult.error) throw progressResult.error;

    return NextResponse.json(
      {
        attempts: (attemptsResult.data ?? []).map(attempt => ({
          id: attempt.id,
          score: attempt.score,
          totalQuestions: attempt.total_questions,
          scorePercent: attempt.score_percent,
          pointsAwarded: attempt.points_awarded,
          createdAt: attempt.created_at,
        })),
        progress: progressResult.data
          ? {
              bestScorePercent: progressResult.data.best_score_percent,
              pointsEarned: progressResult.data.points_earned,
              completed100: progressResult.data.completed_100,
              attemptCount: progressResult.data.attempt_count,
            }
          : null,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load quiz history';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as { answers?: unknown };
    if (!isAnswers(body.answers)) {
      return NextResponse.json({ message: 'Invalid answers.' }, { status: 400 });
    }
    const answers = body.answers;

    const serviceClient = createSupabaseClientServiceRole();
    const { data: questions, error: questionsError } = await serviceClient
      .from('quiz_questions')
      .select('id')
      .eq('quiz_id', id);

    if (questionsError) throw questionsError;
    if (!questions?.length) {
      return NextResponse.json({ message: 'Quiz not found.' }, { status: 404 });
    }

    const questionIds = questions.map(question => question.id);
    const { data: options, error: optionsError } = await serviceClient
      .from('quiz_options')
      .select('id, question_id, is_correct')
      .in('question_id', questionIds);

    if (optionsError) throw optionsError;

    const correctOptionIdsByQuestion = Object.fromEntries(
      questionIds.map(questionId => [
        questionId,
        (options ?? [])
          .filter(option => option.question_id === questionId && option.is_correct)
          .map(option => option.id),
      ]),
    );
    const validOptionIdsByQuestion = Object.fromEntries(
      questionIds.map(questionId => [
        questionId,
        new Set(
          (options ?? [])
            .filter(option => option.question_id === questionId)
            .map(option => option.id),
        ),
      ]),
    );

    const containsInvalidAnswer = Object.entries(answers).some(
      ([questionId, selected]) =>
        !validOptionIdsByQuestion[questionId] ||
        selected.some(optionId => !validOptionIdsByQuestion[questionId].has(optionId)),
    );
    if (containsInvalidAnswer) {
      return NextResponse.json({ message: 'Invalid answers.' }, { status: 400 });
    }

    const score = questionIds.reduce((total, questionId) => {
      const selected = answers[questionId] ?? [];
      const correct = correctOptionIdsByQuestion[questionId];
      const exact =
        selected.length === correct.length &&
        selected.every(optionId => correct.includes(optionId));
      return total + (exact ? 1 : 0);
    }, 0);

    const { data, error } = await serviceClient.rpc('record_quiz_attempt', {
      p_user_id: user.id,
      p_quiz_id: id,
      p_score: score,
      p_total_questions: questionIds.length,
    });

    if (error) throw error;

    return NextResponse.json({
      ...(data as Exclude<Json, null | string | number | boolean | Json[]>),
      correctOptionIdsByQuestion,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to submit quiz';
    return NextResponse.json({ message }, { status: 500 });
  }
}
