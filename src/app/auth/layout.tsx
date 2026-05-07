'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <div className="relative flex min-h-screen items-center">
      <div className="absolute top-16">
        <Button
          onClick={handleGoBack}
          variant="link"
          className="flex items-center gap-1"
        >
          <ArrowLeft size={15} />
          <p>Back</p>
        </Button>
      </div>
      <main className="w-full">{children}</main>
    </div>
  );
}
