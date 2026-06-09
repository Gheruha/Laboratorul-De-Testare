'use client';

import { useEffect, useMemo, useState } from 'react';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { StreakStatus } from '@/lib/types/account.type';
import { cn } from '@/lib/utils';

const emptyStreak: StreakStatus = {
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  activeDates: [],
};

export function StreakStatusDisplay() {
  const [streak, setStreak] = useState<StreakStatus>(emptyStreak);

  useEffect(() => {
    void (async () => {
      const response = await fetch('/api/activity', { method: 'POST' });
      if (response.ok) setStreak((await response.json()) as StreakStatus);
    })();
  }, []);

  const calendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const leadingDays = new Date(year, month, 1).getDay();
    const dateKey = (day: number) =>
      `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return {
      label: new Intl.DateTimeFormat(undefined, {
        month: 'long',
        year: 'numeric',
      }).format(now),
      leadingDays,
      days: Array.from({ length: days }, (_, index) => ({
        number: index + 1,
        active: streak.activeDates.includes(dateKey(index + 1)),
        today: index + 1 === now.getDate(),
      })),
    };
  }, [streak.activeDates]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2"
          aria-label={`${streak.currentStreak} day streak`}
        >
          <Flame
            className={cn(
              'size-5',
              streak.currentStreak > 0
                ? 'fill-orange-500 text-orange-500'
                : 'text-muted-foreground',
            )}
          />
          <span className="font-semibold">{streak.currentStreak}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{streak.currentStreak} day streak</p>
            <p className="text-xs text-muted-foreground">
              Longest streak: {streak.longestStreak} days
            </p>
          </div>
          <Flame className="size-7 fill-orange-500 text-orange-500" />
        </div>
        <p className="mb-3 text-sm font-medium">{calendar.label}</p>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {'SMTWTFS'.split('').map((day, index) => (
            <span key={`${day}-${index}`} className="py-1 text-muted-foreground">
              {day}
            </span>
          ))}
          {Array.from({ length: calendar.leadingDays }, (_, index) => (
            <span key={`empty-${index}`} />
          ))}
          {calendar.days.map(day => (
            <span
              key={day.number}
              className={cn(
                'flex aspect-square items-center justify-center rounded-sm',
                day.active && 'bg-blue-600 font-semibold text-white',
                day.today && !day.active && 'border border-blue-500 text-blue-600',
              )}
            >
              {day.number}
            </span>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
