import { Lock } from 'lucide-react';
import { AccountCard } from '@/features/auth';

export function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <header className="pb-2 pt-10">
        <h1 className="text-[clamp(1.6rem,3.5vw,2.1rem)] text-slate-900">Mi cuenta</h1>
        <p className="mt-1.5 text-[0.95rem] text-slate-600">
          Datos de tu cuenta y de la sesión activa en la red RIBAS.
        </p>
      </header>

      <AccountCard />

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>
          Tu sesión se cierra automáticamente al vencer. Tratamos tus datos personales conforme a la
          Ley 1581 de 2012.
        </span>
      </p>
    </div>
  );
}
