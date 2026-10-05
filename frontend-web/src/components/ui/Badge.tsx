import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-primary-100 bg-primary-50 text-primary-700',
        success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
        muted: 'border-slate-200 bg-slate-100 text-slate-600',
        pill: 'rounded-full border-primary-100 bg-primary-50 px-3.5 py-1.5 text-primary-700',
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
