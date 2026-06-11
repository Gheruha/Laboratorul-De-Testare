'use client';

import React from 'react';
import Link from 'next/link';
import { Hospital, Landmark, Plane } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function WorkspacePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Workspace Control Panel
        </h1>
        <p className="text-xs text-muted-foreground md:text-sm">
          Select the available tool to start the testing session.{' '}
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-2xl gap-4">
        <Card className="border-blue-200 bg-blue-50/70 text-foreground shadow-sm transition-colors hover:border-blue-400 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-950 dark:text-white">
              <Plane className="size-5" />
              Airports Simulator
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 dark:text-zinc-400 md:text-sm">
              Test flight data, search, services, and airport operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/simAirport"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 md:text-sm"
            >
              Open simulator
            </Link>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/70 text-foreground shadow-sm transition-colors hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-emerald-950 dark:text-white">
              <Hospital className="size-5" />
              Hospital Simulator
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 dark:text-zinc-400 md:text-sm">
              Test doctor directories, appointments, and patient contact flows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/simHospital"
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 md:text-sm"
            >
              Open simulator
            </Link>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-cyan-50/70 text-foreground shadow-sm transition-colors hover:border-cyan-400 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-cyan-950 dark:text-white">
              <Landmark className="size-5" />
              Banking Simulator
            </CardTitle>
            <CardDescription className="text-xs text-slate-600 dark:text-zinc-400 md:text-sm">
              Test balances, transactions, transfers, cards, and payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/simBanking"
              className="inline-flex items-center justify-center rounded-md bg-cyan-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-cyan-800 md:text-sm"
            >
              Open simulator
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
