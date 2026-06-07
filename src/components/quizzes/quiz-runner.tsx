'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Quiz } from '@/lib/types/quiz.type';
import { cn } from '@/lib/utils';

type Answers = Record<string, string[]>;

const hasExactAnswers = (selected: string[], correct: string[]) =>
  selected.length === correct.length &&
  selected.every(optionId => correct.includes(optionId));

export function QuizRunner({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).filter(
    questionId => answers[questionId]?.length,
  ).length;

  const score = useMemo(
    () =>
      quiz.questions.reduce((total, question) => {
        const selected = answers[question.id] ?? [];
        const correct = question.options
          .filter(option => option.is_correct)
          .map(option => option.id);
        return total + (hasExactAnswers(selected, correct) ? 1 : 0);
      }, 0),
    [answers, quiz.questions],
  );

  const percentage =
    quiz.questions.length > 0
      ? Math.round((score / quiz.questions.length) * 100)
      : 0;

  const selectOption = (
    questionId: string,
    optionId: string,
    mode: 'single' | 'multiple',
  ) => {
    if (submitted) return;

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

  const retry = () => {
    setAnswers({});
    setSubmitted(false);
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
        </div>
        <h1 className="text-3xl font-bold md:text-4xl">{quiz.title}</h1>
        <p className="text-muted-foreground">
          {submitted
            ? 'Review your answers and explanations below.'
            : `${answeredCount} of ${quiz.questions.length} questions answered.`}
        </p>
      </header>

      {submitted && (
        <Card
          className={cn(
            'my-8 gap-3 py-5 shadow-none',
            percentage >= quiz.passing_score
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-amber-500/40 bg-amber-500/5',
          )}
        >
          <CardHeader>
            <CardTitle>
              Score: {score}/{quiz.questions.length} ({percentage}%)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {percentage >= quiz.passing_score
              ? 'You passed this quiz.'
              : 'Review the explanations and try again when ready.'}
          </CardContent>
        </Card>
      )}

      <div className="my-8 space-y-6">
        {quiz.questions.map((question, questionIndex) => {
          const selected = answers[question.id] ?? [];
          const correctIds = question.options
            .filter(option => option.is_correct)
            .map(option => option.id);
          const isCorrect = hasExactAnswers(selected, correctIds);

          return (
            <Card key={question.id} className="gap-4 py-5 shadow-none">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base leading-6">
                    {questionIndex + 1}. {question.prompt}
                  </CardTitle>
                  {submitted &&
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
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={submitted}
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
                        isSelected && !submitted && 'border-primary bg-accent',
                        submitted &&
                          option.is_correct &&
                          'border-emerald-500/50 bg-emerald-500/10',
                        submitted &&
                          isSelected &&
                          !option.is_correct &&
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

                {submitted && question.explanation && (
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
        {submitted ? (
          <Button onClick={retry}>
            <RotateCcw />
            Try Again
          </Button>
        ) : (
          <Button
            onClick={() => setSubmitted(true)}
            disabled={
              answeredCount !== quiz.questions.length ||
              quiz.questions.length === 0
            }
          >
            Submit Answers
          </Button>
        )}
      </footer>
    </div>
  );
}
