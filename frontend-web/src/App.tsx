import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/features/auth/AuthContext';
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
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar" element={<ForgotPasswordPage />} />
          <Route path="/registro" element={<ComingSoonPage />} />

          {/* Rutas protegidas: sin sesión válida siempre redirigen a Login. */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cuenta" element={<AccountPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
