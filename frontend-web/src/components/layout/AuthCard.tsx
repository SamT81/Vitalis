import type { ReactNode } from 'react';

interface AuthCardProps {
  /** Rótulo corto sobre el título (por ejemplo, "Próximamente"). */
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
}

/** Encabezado y contenido de una pantalla de acceso. Se pinta dentro de AuthLayout. */
export function AuthCard({ eyebrow, title, description, children }: AuthCardProps) {
  return (
    <section className="w-full max-w-[26rem]">
      <header className="mb-8">
        {eyebrow && <p className="mb-3 text-sm font-semibold text-primary-700">{eyebrow}</p>}
        <h1 className="font-display text-display-md text-slate-900">{title}</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">{description}</p>
      </header>
      {children}
    </section>
  );
}
