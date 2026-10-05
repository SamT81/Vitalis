/** Roles del backend (Servicio de Identidad y Acceso) → etiqueta en español. */
const ROLE_LABELS: Readonly<Record<string, string>> = {
  superusuario: 'Superusuario',
  administrador_nacional: 'Administrador nacional',
  administrador_institucional: 'Administrador institucional',
  banco_sangre_admin: 'Administrador de banco de sangre',
  personal_banco_sangre: 'Personal de banco de sangre',
  personal_logistica: 'Personal de logística',
  auditor_invima: 'Auditor INVIMA',
  donante: 'Donante',
};

export const roleLabel = (role: string): string => ROLE_LABELS[role] ?? role;
