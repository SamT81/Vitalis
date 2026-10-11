import { HOME_CONTENT, ROUTES } from '@ribas/shared';
import { Link } from 'react-router-dom';

import { Brand } from './Brand';

const footerLink =
  'block py-2 text-sm text-slate-700 underline-offset-4 transition-colors hover:text-slate-900 hover:underline';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white pb-8 pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
          <div>
            <Brand />
            <p className="mt-6 max-w-[16ch] font-display text-display-md italic leading-[1.15] text-slate-900">
              {HOME_CONTENT.kicker}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Red Interinstitucional de Bancos de Sangre (RIBAS).
            </p>
          </div>
          <nav aria-label="Pie de página" className="flex flex-wrap gap-x-16 gap-y-8">
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Plataforma</h2>
              <Link to={ROUTES.HOME} className={footerLink}>
                Inicio
              </Link>
              <Link to={ROUTES.REGISTER} className={footerLink}>
                Registrarme
              </Link>
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Cuenta</h2>
              <Link to={ROUTES.LOGIN} className={footerLink}>
                Iniciar sesión
              </Link>
              <Link to={ROUTES.ACCOUNT} className={footerLink}>
                Mi cuenta
              </Link>
              <Link to={ROUTES.PROFILE} className={footerLink}>
                Mi perfil
              </Link>
            </div>
          </nav>
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-slate-200 pt-6 text-xs text-slate-600">
          <span>© 2026 Vitalis · RIBAS</span>
          <span>Datos y tamizaje confidenciales · Decreto 1571 de 1993</span>
        </div>
      </div>
    </footer>
  );
}
