'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { signInWithGoogleHandler } from '@/app/auth/handleFunctions';

export const OAuth = () => {
  return (
    <div className="mx-auto mt-4 w-full max-w-sm">
      <Button
        type="button"
        variant="outline"
        className="relative w-full"
        onClick={signInWithGoogleHandler}
      >
        <Image
          src="/icons/google.png"
          alt=""
          className="absolute left-3 size-4 object-contain"
          width={16}
          height={16}
        />
        Continue with Google
      </Button>
    </div>
  );
};
