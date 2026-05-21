'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function WorkspacePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Приветственный блок внутри личного кабинета */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Panoul de Control Workspace
        </h1>
        <p className="text-zinc-400 text-xs md:text-sm">
          Selectați instrumentul disponibil pentru a începe sesiunea de testare.
        </p>
      </div>

      {/* Карточка запуска симулятора аэропорта */}
      <Card className="border-zinc-850 bg-zinc-900/40 backdrop-blur text-zinc-100 shadow-xl transition-all hover:border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-white font-semibold">
            🛫 Airports Simulator
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs md:text-sm">
            Platformă de simulare a tabelelor de zbor. Analizați erorile logice .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/airportsSimulator"
            className="inline-flex items-center justify-center px-4 py-2 text-xs md:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-all duration-200"
          >
            Spre simulare ➔
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
