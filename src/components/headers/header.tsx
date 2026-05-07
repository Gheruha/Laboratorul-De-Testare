'use client';

import Link from 'next/link';
import { ThemeToggle } from '../theme/theme.toggler';
import { FlaskConical } from 'lucide-react';
import { Button } from '../ui/button';

export function Header() {
  return (
    <header className="fixed top-0 w-full flex items-center justify-between px-4 py-2 border-b border-border z-50">
      <div>
        <Link href="/">
          <FlaskConical />
        </Link>
      </div>
      <div className="flex space-x-2">
        <ThemeToggle />
        <Link href={'/auth?mode=signIn'}>
          <Button variant={'outline'}>Sign In</Button>
        </Link>
        <Link href={'/auth?mode=signUp'}>
          <Button>Sign Up</Button>
        </Link>
      </div>
    </header>
  );
}
