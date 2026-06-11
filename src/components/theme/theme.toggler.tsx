'use client';

import { useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { setTheme } = useTheme();

  const handleThemeChange = useCallback(
    (theme: 'light' | 'dark' | 'system') => {
      setTheme(theme);
    },
    [setTheme],
  );

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Change theme">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Theme</TooltipContent>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleThemeChange('light')}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('system')}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Tooltip>
  );
}
