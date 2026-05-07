'use client';
import { authService } from '@/lib/services/api/auth.api';
import { SubmitHandler } from 'react-hook-form';
import { SignDto } from '@/lib/types/auth.type';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const handleError = (error: unknown) => {
  const errorMessage =
    error instanceof Error ? error.message : 'An unknown error occurred';
  toast('Event has been created', {
    description: errorMessage,
  });
};

export function useAuthHandlers() {
  const router = useRouter();

  const signUpHandler: SubmitHandler<SignDto> = async data => {
    try {
      const { message } = await authService.signUp(data);
      toast('Signed up!', {
        description: (
          <div className="flex items-center">
            <Check className="mr-2 text-[hsl(var(--foreground))]" />
            <span>{message}</span>
          </div>
        ),
      });
      setTimeout(() => router.push('/workspace'), 1500);
    } catch (e) {
      handleError(e);
    }
  };

  const signInHandler: SubmitHandler<SignDto> = async data => {
    try {
      const { message } = await authService.signIn(data);
      toast('Signed in!', {
        description: (
          <div className="flex items-center">
            <Check className="mr-2 text-[hsl(var(--foreground))]" />
            <span>{message}</span>
          </div>
        ),
      });
      setTimeout(() => router.push('/workspace'), 1500);
    } catch (e) {
      handleError(e);
    }
  };

  return { signUpHandler, signInHandler };
}

// Sign In with Google OAuth Handler
export const signInWithGoogleHandler = async (): Promise<void> => {
  try {
    await authService.signInWithGoogle();
  } catch (error: unknown) {
    handleError(error);
  }
};
