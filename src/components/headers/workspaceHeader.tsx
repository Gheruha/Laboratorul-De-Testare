'use client';

import Link from 'next/link';
import { ThemeToggle } from '../theme/theme.toggler';
import { FlaskConical } from 'lucide-react';
import { Button } from '../ui/button';
import { authService } from '@/lib/services/api/auth.api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function WorkspaceHeader() {
  const router = useRouter();
  const handleSignOut = async (): Promise<void> => {
    try {
      await authService.signOut();
      toast('Message', { description: "You're logged out." });
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast('Error while logging out', {
        description: message,
      });
    }
  };

  return (
    <header className="fixed top-0 w-full flex items-center justify-between px-4 py-2 border-b border-border bg-white dark:bg-zinc-950 z-50">
      <div>
        <Link href="/">
          <FlaskConical />
        </Link>
      </div>
      <div className="flex space-x-2">
        <ThemeToggle />
        <Button variant={'outline'} onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
