'use client';

import { useEffect, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RotateCcw,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type {
  SimulatorEvaluationResponse,
  SimulatorTask,
} from '@/lib/types/simulator.type';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'airport-simulator-confirmed-defects';

const verdictLabels = {
  correct: 'Correct',
  incorrect: 'Incorrect',
  out_of_scope: 'Invalid submission',
} as const;

export function AirportSimulatorAssistant() {
  const [tasks, setTasks] = useState<SimulatorTask[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [confirmedDefects, setConfirmedDefects] = useState<string[]>([]);
  const [report, setReport] = useState('');
  const [evaluation, setEvaluation] =
    useState<SimulatorEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const storedSessionId = window.localStorage.getItem(
      'airport-simulator-session-id',
    );
    const currentSessionId = storedSessionId ?? crypto.randomUUID();
    window.localStorage.setItem(
      'airport-simulator-session-id',
      currentSessionId,
    );
    setSessionId(currentSessionId);

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfirmedDefects(JSON.parse(saved) as string[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    void (async () => {
      try {
        const response = await fetch('/api/simulator/airport/tasks', {
          cache: 'no-store',
        });
        const data = (await response.json()) as {
          tasks?: SimulatorTask[];
          message?: string;
        };

        if (!response.ok)
          throw new Error(data.message || 'Failed to load tasks');
        setTasks(data.tasks ?? []);
      } catch (error: unknown) {
        setLoadError(
          error instanceof Error ? error.message : 'Failed to load tasks',
        );
      }
    })();
  }, []);

  const submitReport = async () => {
    setLoading(true);
    setEvaluation(null);

    try {
      const response = await fetch('/api/simulator/airport/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report, sessionId }),
      });
      const data = (await response.json()) as SimulatorEvaluationResponse & {
        message?: string;
      };

      if (!response.ok && !data.feedback) {
        throw new Error(data.message || 'Evaluation failed');
      }

      setEvaluation(data);

      if (
        data.verdict === 'correct' &&
        data.matchedDefectId &&
        !confirmedDefects.includes(data.matchedDefectId)
      ) {
        const updated = [...confirmedDefects, data.matchedDefectId];
        setConfirmedDefects(updated);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setReport('');
      }
    } catch (error: unknown) {
      setEvaluation({
        verdict: 'out_of_scope',
        feedback:
          error instanceof Error
            ? error.message
            : 'The evaluator is unavailable.',
        matchedDefectId: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="mx-auto mb-6 max-w-7xl gap-4 border-blue-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 text-foreground dark:text-slate-100 shadow-none">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="size-5 text-blue-600 dark:text-blue-400" />
              Testing Mission
            </CardTitle>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Inspect the airport experience and report one defect at a time.
              Describe what you observed and why it is incorrect. The evaluator
              will not provide hints or reveal hidden defects.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {confirmedDefects.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-700 hover:bg-blue-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={() => {
                  setConfirmedDefects([]);
                  window.localStorage.removeItem(STORAGE_KEY);
                }}
              >
                <RotateCcw />
                Reset
              </Button>
            )}
            <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300">
              {confirmedDefects.length}/{tasks.length || 6} confirmed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadError ? (
            <p className="text-sm text-red-700 dark:text-red-300">
              {loadError}
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map(task => {
                const completed = confirmedDefects.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className={cn(
                      'flex min-h-24 items-start gap-3 rounded-md border border-blue-200 dark:border-slate-800 bg-blue-50/70 dark:bg-slate-950/50 p-3',
                      completed && 'border-emerald-500/40 bg-emerald-500/5',
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-sm border border-blue-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                        {task.order_index}
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                        {task.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed right-5 bottom-5 z-40 bg-blue-600 text-white shadow-xl hover:bg-blue-700"
          >
            <Bot />
            Report a defect
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5" />
              Defect Evaluator
            </SheetTitle>
            <SheetDescription>
              Submit one observed airport simulator defect. Questions, hints,
              unrelated topics, code, and links are rejected.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
            <label htmlFor="defect-report" className="text-sm font-medium">
              Your defect report
            </label>
            <textarea
              id="defect-report"
              value={report}
              maxLength={600}
              onChange={event => setReport(event.target.value)}
              placeholder="Observed behavior and why it is incorrect..."
              className="min-h-40 resize-none rounded-md border bg-background p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <p className="text-right text-xs text-muted-foreground">
              {report.length}/600
            </p>

            {evaluation && (
              <Card
                className={cn(
                  'gap-3 py-4 shadow-none',
                  evaluation.verdict === 'correct' &&
                    'border-emerald-500/40 bg-emerald-500/5',
                  evaluation.verdict === 'incorrect' &&
                    'border-amber-500/40 bg-amber-500/5',
                  evaluation.verdict === 'out_of_scope' &&
                    'border-destructive/40 bg-destructive/5',
                )}
              >
                <CardHeader className="px-4">
                  <CardTitle className="flex items-center gap-2 text-base capitalize">
                    {evaluation.verdict === 'correct' ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <XCircle className="size-4 text-destructive" />
                    )}
                    {verdictLabels[evaluation.verdict]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 text-sm leading-6 text-muted-foreground">
                  {evaluation.feedback}
                </CardContent>
              </Card>
            )}
          </div>

          <SheetFooter>
            <Button
              onClick={submitReport}
              disabled={loading || !sessionId || report.trim().length < 20}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send />}
              Evaluate report
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
