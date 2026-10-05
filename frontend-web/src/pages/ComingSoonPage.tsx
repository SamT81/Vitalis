import { ROUTES } from '@ribas/shared';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthCard } from '@/components/layout/AuthCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function ComingSoonPage() {
  return (
    <AuthCard
      icon={<UserPlus />}
      title="Registro de donantes"
      description="Estamos preparando el registro para que puedas unirte a la red RIBAS en menos de dos minutos."
    >
      <div className="text-center">
        <Badge variant="pill">Próximamente</Badge>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Muy pronto podrás crear tu cuenta de donante desde aquí. Si ya tienes una cuenta, inicia
          sesión para ver tus datos.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <Button size="lg" asChild>
          <Link to={ROUTES.LOGIN}>
            <LogIn aria-hidden /> Iniciar sesión
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to={ROUTES.HOME}>
            <ArrowLeft aria-hidden /> Volver al inicio
          </Link>
        </Button>
      </div>
    </AuthCard>
  );
}
