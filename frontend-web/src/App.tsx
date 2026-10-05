import { ROUTES } from '@ribas/shared';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthProvider, ProtectedRoute } from '@/features/auth';
import { AccountPage } from '@/pages/AccountPage';
import { ComingSoonPage } from '@/pages/ComingSoonPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfilePage } from '@/pages/ProfilePage';

/** Debe renderizarse dentro de un Router (BrowserRouter en main.tsx, MemoryRouter en pruebas). */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.REGISTER} element={<ComingSoonPage />} />

          {/* Rutas protegidas: sin sesión válida siempre redirigen a Login. */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.ACCOUNT} element={<AccountPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
