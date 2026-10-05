import { Link } from 'react-router-dom';
import { Brand } from './Brand';

const footerLink = 'block py-1 text-sm text-slate-600 hover:text-primary-700';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-x-12 gap-y-8">
          <div className="max-w-xs">
            <Brand />
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Red Interinstitucional de Bancos de Sangre (RIBAS). Tecnología al servicio de la vida.
            </p>
          </div>
          <nav aria-label="Pie de página" className="flex flex-wrap gap-12">
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Plataforma
              </h2>
              <Link to="/" className={footerLink}>
                Inicio
              </Link>
              <Link to="/registro" className={footerLink}>
                Registrarme
              </Link>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cuenta
              </h2>
              <Link to="/login" className={footerLink}>
                Iniciar sesión
              </Link>
              <Link to="/cuenta" className={footerLink}>
                Mi cuenta
              </Link>
              <Link to="/perfil" className={footerLink}>
                Mi perfil
              </Link>
            </div>
          </nav>
        </div>
        <div className="mt-8 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-slate-100 pt-6 text-xs text-slate-500">
          <span>© 2026 Vitalis · RIBAS · Tecnología al servicio de la vida</span>
          <span>Datos y tamizaje confidenciales · Decreto 1571 de 1993</span>
        </div>
      </div>
    </footer>
  );
}
