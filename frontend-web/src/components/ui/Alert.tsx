import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'fade-in flex items-start gap-3 rounded-xl border p-3.5 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-slate-200 bg-slate-50 text-slate-700',
        destructive: 'border-primary-200 bg-primary-50 text-primary-800',
        success: 'border-slate-200 bg-slate-50 text-slate-900',
        warning: 'border-blush-300 bg-blush-100 text-slate-900',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

function Alert({ className, variant, role = 'alert', ...props }: AlertProps) {
  return <div role={role} className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mb-0.5 font-semibold leading-snug', className)} {...props} />;
}

function AlertDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('leading-relaxed', className)} {...props} />;
}

export { Alert, AlertDescription, AlertTitle };
