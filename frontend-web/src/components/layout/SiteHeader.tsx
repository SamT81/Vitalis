import { firstName, initials, ROUTES } from '@ribas/shared';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { useLogout, useSession } from '@/features/auth';
import { cn } from '@/lib/utils';

import { Brand } from './Brand';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:text-slate-900',
    isActive ? 'font-semibold text-primary-700' : 'text-slate-600',
  );

export function SiteHeader() {
  const { user, isAuthenticated } = useSession();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const handleLogout = () => {
    close();
    void logout();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 px-4 py-2.5 sm:px-6">
        <Brand />

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 md:hidden"
          aria-label={open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
        </button>

        <nav
          id="main-menu"
          aria-label="Principal"
          className={cn(
            'w-full flex-col gap-3 pb-3 pt-2 md:flex md:w-auto md:flex-1 md:flex-row md:items-center md:justify-between md:p-0',
            open ? 'flex' : 'hidden',
          )}
        >
          <ul className="flex flex-col gap-1 md:mx-auto md:flex-row md:gap-5">
            <li>
              <NavLink to={ROUTES.HOME} end className={navLinkClass} onClick={close}>
                Inicio
              </NavLink>
            </li>
            {isAuthenticated && (
              <>
                <li>
                  <NavLink to={ROUTES.ACCOUNT} className={navLinkClass} onClick={close}>
                    Mi cuenta
                  </NavLink>
                </li>
                <li>
                  <NavLink to={ROUTES.PROFILE} className={navLinkClass} onClick={close}>
                    Mi perfil
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {isAuthenticated && user ? (
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Link
                to={ROUTES.ACCOUNT}
                onClick={close}
                className="inline-flex items-center gap-2 rounded-full py-1 pr-2 hover:bg-slate-100"
              >
                <span
                  aria-hidden
                  className="flex size-8 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-xs font-bold text-primary-700"
                >
                  {initials(user.name)}
                </span>
                <span className="text-sm font-semibold text-slate-700">{firstName(user.name)}</span>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut aria-hidden /> Salir
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Button variant="ghost" asChild>
                <Link to={ROUTES.LOGIN} onClick={close}>
                  Iniciar sesión
                </Link>
              </Button>
              <Button asChild>
                <Link to={ROUTES.REGISTER} onClick={close}>
                  Registrarme
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
