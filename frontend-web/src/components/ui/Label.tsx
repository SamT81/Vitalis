import * as LabelPrimitive from '@radix-ui/react-label';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'mb-2 block text-sm font-medium text-slate-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
