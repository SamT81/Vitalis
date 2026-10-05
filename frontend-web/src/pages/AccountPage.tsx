import { Building2, Clock, Lock, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/features/auth/AuthContext';
import { roleLabel } from '@/features/auth/roles';
import {
  formatDateTime,
  formatRemaining,
  initials,
  NOT_REGISTERED,
  orNotRegistered,
} from '@/lib/format';

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

export function AccountPage() {
  const { user, expiresAt, logout } = useAuth();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => Date.now());

  // Refresca el tiempo restante de la sesión.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <header className="pb-2 pt-10">
        <h1 className="text-[clamp(1.6rem,3.5vw,2.1rem)] text-slate-900">Mi cuenta</h1>
        <p className="mt-1.5 text-[0.95rem] text-slate-600">
          Datos de tu cuenta y de la sesión activa en la red RIBAS.
        </p>
      </header>

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
            <span>{formatDateTime(expiresAt)}</span>
            <small className="mt-0.5 block text-xs text-slate-600">
              {formatRemaining(expiresAt, now)}
            </small>
          </Row>
        </dl>

        <div className="flex flex-col justify-end gap-2.5 pt-5 sm:flex-row">
          <Button variant="outline" asChild>
            <Link to="/perfil">
              <UserRound aria-hidden /> Ver mi perfil de donante
            </Link>
          </Button>
          <Button onClick={handleLogout}>
            <LogOut aria-hidden /> Cerrar sesión
          </Button>
        </div>
      </Card>

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
