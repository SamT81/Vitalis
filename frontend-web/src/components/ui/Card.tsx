import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-slate-100 bg-white shadow-card', className)}
      {...props}
    />
  );
}

export { Card };
