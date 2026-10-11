import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-primary-100 bg-primary-50 text-primary-700',
        success: 'border-slate-900 bg-slate-900 text-white',
        muted: 'border-slate-200 bg-slate-100 text-slate-600',
        pill: 'rounded-full border-blush-300 bg-blush-100 px-3.5 py-1.5 text-slate-900',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
