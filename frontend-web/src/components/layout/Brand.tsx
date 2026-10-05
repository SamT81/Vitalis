import { Link } from 'react-router-dom';
import logo from '@/assets/logo-vitalis.png';
import { cn } from '@/lib/utils';

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Vitalis · Ir al inicio"
      className={cn('inline-flex items-center gap-2', className)}
    >
      <img src={logo} alt="" width={40} height={40} className="size-10 object-contain" />
      <span className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight text-slate-900">Vitalis</span>
        <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-wider text-slate-500">
          Red RIBAS
        </span>
      </span>
    </Link>
  );
}
