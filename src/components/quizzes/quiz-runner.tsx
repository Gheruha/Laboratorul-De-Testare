'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  History,
  Loader2,
  RotateCcw,
  Star,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  GamificationStatus,
  QuizAttempt,
  QuizAttemptResult,
  QuizProgress,
} from '@/lib/types/gamification.type';
import type { Quiz } from '@/lib/types/quiz.type';
import { cn } from '@/lib/utils';

type Answers = Record<string, string[]>;

const hasExactAnswers = (selected: string[], correct: string[]) =>
  selected.length === correct.length &&
  selected.every(optionId => correct.includes(optionId));

export function QuizRunner({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const answeredCount = Object.keys(answers).filter(
    questionId => answers[questionId]?.length,
  ).length;

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/attempts`, {
        cache: 'no-store',
      });
      if (!response.ok) return;
      const data = (await response.json()) as {
        attempts: QuizAttempt[];
        progress: QuizProgress | null;
      };
      setAttempts(data.attempts);
      setProgress(data.progress);
    } finally {
      setHistoryLoading(false);
    }
  }, [quiz.id]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const selectOption = (
    questionId: string,
    optionId: string,
    mode: 'single' | 'multiple',
  ) => {
    if (result || submitting) return;

    setAnswers(current => {
      if (mode === 'single') {
        return { ...current, [questionId]: [optionId] };
      }

      const selected = current[questionId] ?? [];
      return {
        ...current,
        [questionId]: selected.includes(optionId)
          ? selected.filter(id => id !== optionId)
          : [...selected, optionId],
      };
    });
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = (await response.json()) as QuizAttemptResult & {
        message?: string;
      };

      if (!response.ok)
        throw new Error(data.message || 'Could not submit quiz');

      setResult(data);
      window.dispatchEvent(
        new CustomEvent<GamificationStatus>('gamification-updated', {
          detail: {
            totalPoints: data.totalPoints,
            level: data.level,
            levelName: data.levelName,
          },
        }),
      );
      await loadHistory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Could not submit quiz',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setAnswers({});
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 md:px-8">
      <header className="space-y-4">
        <Button variant="ghost" asChild className="-ml-3">
          <Link href={`/workspace/lessons/${quiz.lesson_slug}`}>
            <ArrowLeft />
            Back to lesson
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Manual Testing Quiz</Badge>
          <Badge variant="outline">{quiz.questions.length} questions</Badge>
          <Badge variant="outline">Passing score: {quiz.passing_score}%</Badge>
          <Badge variant="outline">Up to {quiz.max_points} points</Badge>
        </div>
        <h1 className="text-3xl font-bold md:text-4xl">{quiz.title}</h1>
        <p className="text-muted-foreground">
          {result
            ? 'Review your answers and explanations below.'
            : `${answeredCount} of ${quiz.questions.length} questions answered.`}
        </p>
      </header>

      {result && (
        <Card
          className={cn(
            'my-8 gap-3 py-5 shadow-none',
            result.scorePercent >= quiz.passing_score
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-amber-500/40 bg-amber-500/5',
          )}
        >
          <CardHeader>
            <CardTitle>
              Score: {result.score}/{result.totalQuestions} (
              {result.scorePercent}
              %)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              {result.scorePercent >= quiz.passing_score
                ? 'You passed this quiz.'
                : 'Review the explanations and try again when ready.'}
            </p>
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              <Star className="size-4" />
              {result.pointsAwarded > 0
                ? `You earned ${result.pointsAwarded} new points.`
                : 'No new points this attempt. Your best reward is already saved.'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="my-8 gap-4 py-5 shadow-none">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-4" />
            Recent attempts
          </CardTitle>
          {progress && (
            <Badge variant={progress.completed100 ? 'secondary' : 'outline'}>
              Best: {progress.bestScorePercent}%
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading history
            </div>
          ) : attempts.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Your completed attempts will appear here.
            </p>
          ) : (
            <div className="max-h-[min(18rem,45vh)] overflow-y-auto overscroll-contain rounded-md border">
              <Table className="min-w-[34rem]">
                <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Points earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map(attempt => (
                    <TableRow key={attempt.id}>
                      <TableCell>
                        {new Intl.DateTimeFormat(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(attempt.createdAt))}
                      </TableCell>
                      <TableCell>
                        {attempt.score}/{attempt.totalQuestions} (
                        {attempt.scorePercent}%)
                      </TableCell>
                      <TableCell className="text-right">
                        +{attempt.pointsAwarded}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="my-8 space-y-6">
        {quiz.questions.map((question, questionIndex) => {
          const selected = answers[question.id] ?? [];
          const correctIds =
            result?.correctOptionIdsByQuestion[question.id] ?? [];
          const isCorrect = result
            ? hasExactAnswers(selected, correctIds)
            : false;

          return (
            <Card key={question.id} className="gap-4 py-5 shadow-none">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base leading-6">
                    {questionIndex + 1}. {question.prompt}
                  </CardTitle>
                  {result &&
                    (isCorrect ? (
                      <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="size-5 shrink-0 text-destructive" />
                    ))}
                </div>
                {question.selection_mode === 'multiple' && (
                  <Badge variant="outline">Select all correct answers</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selected.includes(option.id);
                  const isCorrectOption = correctIds.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={Boolean(result)}
                      onClick={() =>
                        selectOption(
                          question.id,
                          option.id,
                          question.selection_mode,
                        )
                      }
                      className={cn(
                        'flex w-full items-start gap-3 rounded-md border p-3 text-left text-sm transition-colors',
                        'hover:bg-accent disabled:cursor-default disabled:opacity-100',
                        isSelected && !result && 'border-primary bg-accent',
                        result &&
                          isCorrectOption &&
                          'border-emerald-500/50 bg-emerald-500/10',
                        result &&
                          isSelected &&
                          !isCorrectOption &&
                          'border-destructive/50 bg-destructive/10',
                      )}
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-sm border bg-background font-medium">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span className="leading-6">{option.label}</span>
                    </button>
                  );
                })}

                {result && question.explanation && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-sm leading-6 text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Explanation:{' '}
                      </span>
                      {question.explanation}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t py-6">
        <Button variant="outline" asChild>
          <Link href={`/workspace/lessons/${quiz.lesson_slug}`}>
            <ArrowLeft />
            Back to lesson
          </Link>
        </Button>
        {result ? (
          <Button onClick={retry}>
            <RotateCcw />
            Try Again
          </Button>
        ) : (
          <Button
            onClick={submit}
            disabled={
              submitting ||
              answeredCount !== quiz.questions.length ||
              quiz.questions.length === 0
            }
          >
            {submitting ? <Loader2 className="animate-spin" /> : null}
            Submit Answers
          </Button>
        )}
      </footer>
    </div>
  );
}
