import { Outlet, useLocation } from 'react-router-dom';

import { VitalMark } from './VitalMark';

/**
 * Pantalla partida de acceso (login, registro, recuperar).
 * El panel de marca no se desmonta al cambiar de ruta: solo el formulario entra de nuevo.
 */
export function AuthLayout() {
  const { pathname } = useLocation();

  return (
    <div className="grid flex-1 lg:min-h-[46rem] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-blush-200 lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-16">
        <p className="relative z-10 max-w-[14ch] font-display text-display-lg italic leading-[1.1] text-slate-900">
          Tecnología al servicio de la vida
        </p>
        <VitalMark className="absolute -bottom-24 -right-28 w-[min(30rem,82%)]" />
        <p className="relative z-10 max-w-[16ch] text-sm leading-relaxed text-slate-700">
          Red Interinstitucional de Bancos de Sangre
        </p>
      </aside>

      <div className="flex items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div key={pathname} className="auth-swap flex w-full justify-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
