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
        'flex h-12 w-full rounded-xl border border-slate-500 bg-white px-4 text-base text-slate-900 transition-[border-color,box-shadow] duration-150 placeholder:text-slate-500 hover:border-slate-700 focus-visible:border-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-primary-600 aria-[invalid=true]:focus-visible:ring-primary-600/15',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
