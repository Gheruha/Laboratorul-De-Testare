'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RadialBar, RadialBarChart } from 'recharts';
import {
  Award,
  CheckCircle2,
  Flame,
  Loader2,
  Star,
  UserRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AccountDashboardData } from '@/lib/types/account.type';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));

function SuccessChart({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: number;
  detail: string;
  color: string;
}) {
  const chartConfig = {
    value: {
      label,
      color,
    },
  } satisfies ChartConfig;

  return (
    <div className="flex min-w-0 flex-col items-center">
      <ChartContainer
        config={chartConfig}
        className="aspect-square h-52 w-full max-w-60"
      >
        <RadialBarChart
          data={[{ value, fill: 'var(--color-value)' }]}
          startAngle={90}
          endAngle={90 - value * 3.6}
          innerRadius={66}
          outerRadius={96}
        >
          <ChartTooltip
            cursor={false}
            content={({ active }) =>
              active ? (
                <div className="rounded-md border bg-popover px-3 py-2 text-popover-foreground shadow-md">
                  {label}: {value}%
                </div>
              ) : null
            }
          />
          <RadialBar dataKey="value" background cornerRadius={6} />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-3xl font-bold"
          >
            {value}%
          </text>
        </RadialBarChart>
      </ChartContainer>
      <div className="-mt-4 text-center">
        <p className="font-semibold">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

export function AccountDashboard() {
  const [data, setData] = useState<AccountDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch('/api/account', { cache: 'no-store' });
        const body = (await response.json()) as AccountDashboardData & {
          message?: string;
        };
        if (!response.ok)
          throw new Error(body.message || 'Failed to load account');
        setData(body);
      } catch (loadError: unknown) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load account',
        );
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <Card className="border-destructive/40 shadow-none">
          <CardContent className="text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-80 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading account
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 md:px-8">
      <section className="flex flex-col gap-5 border-b pb-8 sm:flex-row sm:items-center">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-full border bg-muted">
          <UserRound className="size-10 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold">
            {data.profile.displayName}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {data.profile.email}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">
              <Award />
              {data.gamification.levelName} · Level {data.gamification.level}
            </Badge>
            <Badge variant="outline">
              <Star />
              {data.gamification.totalPoints} points
            </Badge>
            <Badge variant="outline">
              <Flame className="fill-orange-500 text-orange-500" />
              {data.streak.currentStreak} day streak
            </Badge>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Quiz attempts', data.quizStats.attempts],
          ['Perfect quizzes', data.quizStats.perfectQuizzes],
          ['Simulator reports', data.simulatorStats.submissions],
          ['Solved defects', data.simulatorStats.solvedDefects],
        ].map(([label, value]) => (
          <Card key={label} className="gap-2 py-5 shadow-none">
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Success rates</CardTitle>
          <CardDescription>
            Passing quiz attempts and correctly identified simulator defects.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
          <SuccessChart
            label="Quizzes"
            value={data.quizStats.successRate}
            detail={`${data.quizStats.passed} passed of ${data.quizStats.attempts}`}
            color="var(--chart-1)"
          />
          <SuccessChart
            label="Simulator"
            value={data.simulatorStats.successRate}
            detail={`${data.simulatorStats.correct} correct of ${data.simulatorStats.submissions}`}
            color="var(--chart-2)"
          />
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Completion progress</CardTitle>
          <CardDescription>
            Fully completed quizzes and testing simulators.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
          <SuccessChart
            label="Quizzes completed"
            value={data.quizStats.completionRate}
            detail={`${data.quizStats.perfectQuizzes} of ${data.quizStats.totalQuizzes}`}
            color="var(--chart-3)"
          />
          <SuccessChart
            label="Simulators completed"
            value={data.simulatorStats.completionRate}
            detail={`${data.simulatorStats.completedSimulators} of ${data.simulatorStats.totalSimulators}`}
            color="var(--chart-4)"
          />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Quiz history</h2>
          <p className="text-sm text-muted-foreground">
            Your latest completed quiz attempts.
          </p>
        </div>
        <Card className="overflow-hidden py-0 shadow-none">
          <div className="max-h-[min(28rem,60vh)] overflow-y-auto overscroll-contain">
            <Table className="min-w-[42rem]">
              <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.quizHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No quiz attempts yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.quizHistory.map(attempt => (
                    <TableRow key={attempt.id}>
                      <TableCell>
                        <Button variant="link" className="h-auto p-0" asChild>
                          <Link href={`/workspace/quizzes/${attempt.quizId}`}>
                            {attempt.quizTitle}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(attempt.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            attempt.passed
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400',
                          )}
                        >
                          {attempt.scorePercent}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        +{attempt.pointsAwarded}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Simulator history</h2>
          <p className="text-sm text-muted-foreground">
            Your latest evaluated defect reports.
          </p>
        </div>
        <div className="max-h-[min(36rem,65vh)] space-y-3 overflow-y-auto overscroll-contain pr-1 sm:pr-2">
          {data.simulatorHistory.length === 0 ? (
            <Card className="shadow-none">
              <CardContent className="text-sm text-muted-foreground">
                No simulator submissions yet.
              </CardContent>
            </Card>
          ) : (
            data.simulatorHistory.map(submission => (
              <Card key={submission.id} className="gap-3 py-5 shadow-none">
                <CardHeader className="flex-col items-start justify-between gap-3 sm:flex-row">
                  <div>
                    <CardTitle className="text-base">
                      {submission.scenarioTitle}
                    </CardTitle>
                    <CardDescription>
                      {formatDate(submission.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      submission.verdict === 'correct' ? 'secondary' : 'outline'
                    }
                    className={cn(
                      submission.verdict === 'correct' &&
                        'text-emerald-700 dark:text-emerald-400',
                    )}
                  >
                    {submission.verdict === 'correct' && <CheckCircle2 />}
                    {submission.verdict.replace('_', ' ')}
                  </Badge>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  {submission.report}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
