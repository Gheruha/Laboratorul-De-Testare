import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CenteredLoader({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-80 items-center justify-center text-muted-foreground',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="mr-2 size-5 animate-spin" />
      {label}
    </div>
  );
}
