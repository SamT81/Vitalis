import { ROUTES } from '@ribas/shared';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AuthCard } from '@/components/layout/AuthCard';
import { Button } from '@/components/ui/Button';

export function ComingSoonPage() {
  return (
    <AuthCard
      eyebrow="Próximamente"
      title="Registro de donantes"
      description="Estamos preparando el registro. Todavía no es posible crear una cuenta de donante desde aquí."
    >
      <p className="border-l-2 border-blush-300 pl-4 text-sm leading-relaxed text-slate-700">
        Cuando esté listo te pediremos tus datos básicos y tu tipo de sangre. Si ya tienes una
        cuenta en la red RIBAS, puedes entrar ahora.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button size="lg" asChild>
          <Link to={ROUTES.LOGIN}>Iniciar sesión</Link>
        </Button>
        <Button variant="ghost" size="lg" asChild>
          <Link to={ROUTES.HOME}>
            <ArrowLeft aria-hidden /> Volver al inicio
          </Link>
        </Button>
      </div>
    </AuthCard>
  );
}
