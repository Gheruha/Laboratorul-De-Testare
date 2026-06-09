'use client';

import { Button } from '@/components/ui/button';
import { signInWithGoogleHandler } from '@/app/auth/handleFunctions';
import { ThemeImage } from '../theme/theme-image';

export const OAuth = () => {
  return (
    <div className="flex w-full justify-center pt-10">
      <Button
        type="button"
        variant="outline"
        className="size-16 rounded-full border"
        aria-label="Continue with Google"
        title="Continue with Google"
        onClick={signInWithGoogleHandler}
      >
        <ThemeImage
          lightSrc="/icons/google.png"
          darkSrc="/icons/google.png"
          alt=""
          className="size-8 object-contain"
          width={32}
          height={32}
        />
      </Button>
    </div>
  );
};
