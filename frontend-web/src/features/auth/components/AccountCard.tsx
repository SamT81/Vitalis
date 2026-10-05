import { initials, NOT_REGISTERED, orNotRegistered, roleLabel, ROUTES } from '@ribas/shared';
import { Building2, Clock, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useLogout } from '../hooks/useLogout';
import { useSession } from '../hooks/useSession';
import { useSessionCountdown } from '../hooks/useSessionCountdown';

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-4 sm:grid-cols-[11rem_1fr] sm:gap-3">
      <dt className="flex items-center gap-2 text-sm font-semibold text-slate-600 [&_svg]:size-4">
        {icon} {label}
      </dt>
      <dd className="min-w-0 break-words text-[0.95rem] text-slate-900">{children}</dd>
    </div>
  );
}

/** Datos de la cuenta y de la sesión activa, con el botón "Cerrar sesión". */
export function AccountCard() {
  const { user } = useSession();
  const { expiresLabel, remainingLabel } = useSessionCountdown();
  const logout = useLogout();

  if (!user) return null;

  return (
    <Card className="mt-5 p-5 sm:p-7">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-base font-bold text-primary-700"
        >
          {initials(user.name)}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900">{orNotRegistered(user.name)}</h2>
          <p className="break-all text-sm text-slate-600">{orNotRegistered(user.email)}</p>
        </div>
      </div>

      <dl>
        <Row icon={<ShieldCheck aria-hidden />} label="Rol(es)">
          {user.roles.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Roles">
              {user.roles.map((role) => (
                <li key={role}>
                  <Badge>{roleLabel(role)}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            NOT_REGISTERED
          )}
        </Row>
        <Row icon={<Building2 aria-hidden />} label="Institución">
          <span>{orNotRegistered(user.institutionName)}</span>
          <small className="mt-0.5 block text-xs text-slate-600">
            ID: <code className="text-slate-800">{orNotRegistered(user.institutionId)}</code>
          </small>
        </Row>
        <Row icon={<Clock aria-hidden />} label="La sesión expira">
          <span>{expiresLabel}</span>
          <small className="mt-0.5 block text-xs text-slate-600">{remainingLabel}</small>
        </Row>
      </dl>

      <div className="flex flex-col justify-end gap-2.5 pt-5 sm:flex-row">
        <Button variant="outline" asChild>
          <Link to={ROUTES.PROFILE}>
            <UserRound aria-hidden /> Ver mi perfil de donante
          </Link>
        </Button>
        <Button onClick={logout}>
          <LogOut aria-hidden /> Cerrar sesión
        </Button>
      </div>
    </Card>
  );
}
