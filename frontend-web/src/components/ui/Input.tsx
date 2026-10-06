import type { InputHTMLAttributes, Ref } from 'react';

import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
}

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-sm text-slate-900 transition-colors placeholder:text-slate-500 focus-visible:border-primary-600 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-primary-600',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
