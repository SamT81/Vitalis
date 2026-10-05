import type { ReactNode } from 'react';

interface AuthCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}

/** Tarjeta centrada de las pantallas de acceso (login, recuperar, próximamente). */
export function AuthCard({ icon, title, description, children }: AuthCardProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-12">
      <section className="w-full max-w-[460px] rounded-3xl border border-slate-200 bg-white p-6 shadow-auth sm:p-9">
        <header className="mb-7 text-center">
          <span
            aria-hidden
            className="mx-auto mb-3.5 flex size-12 items-center justify-center rounded-xl bg-primary text-white [&_svg]:size-5"
          >
            {icon}
          </span>
          <h1 className="text-xl text-slate-900">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-600">{description}</p>
        </header>
        {children}
      </section>
    </div>
  );
}
