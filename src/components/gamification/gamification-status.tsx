'use client';

import { useCallback, useEffect, useState } from 'react';
import { Award, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { GamificationStatus } from '@/lib/types/gamification.type';

const fallbackStatus: GamificationStatus = {
  totalPoints: 0,
  level: 1,
  levelName: 'QA Trainee',
};

export function GamificationStatusDisplay() {
  const [status, setStatus] = useState<GamificationStatus>(fallbackStatus);

  const loadStatus = useCallback(async () => {
    const response = await fetch('/api/gamification', { cache: 'no-store' });
    if (!response.ok) return;
    setStatus((await response.json()) as GamificationStatus);
  }, []);

  useEffect(() => {
    void loadStatus();

    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<GamificationStatus>).detail;
      if (detail) setStatus(detail);
      else void loadStatus();
    };

    window.addEventListener('gamification-updated', handleUpdate);
    return () =>
      window.removeEventListener('gamification-updated', handleUpdate);
  }, [loadStatus]);

  return (
    <div className="flex items-center gap-1.5" aria-label="Your quiz progress">
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className="hidden h-8 gap-1.5 sm:inline-flex"
          >
            <Award className="size-3.5" />
            <span className="hidden sm:inline">{status.levelName}</span>
            <span>Lv. {status.level}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>Your level</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="h-8 gap-1.5">
            <Star className="size-3.5" />
            {status.totalPoints} pts
          </Badge>
        </TooltipTrigger>
        <TooltipContent>Your points</TooltipContent>
      </Tooltip>
    </div>
  );
}
