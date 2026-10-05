/** Roles del backend (Servicio de Identidad y Acceso). */
export const ROLES = {
  SUPERUSER: 'superusuario',
  NATIONAL_ADMIN: 'administrador_nacional',
  INSTITUTION_ADMIN: 'administrador_institucional',
  BLOOD_BANK_ADMIN: 'banco_sangre_admin',
  BLOOD_BANK_STAFF: 'personal_banco_sangre',
  LOGISTICS_STAFF: 'personal_logistica',
  INVIMA_AUDITOR: 'auditor_invima',
  DONOR: 'donante',
} as const;

const ROLE_LABELS: Readonly<Record<string, string>> = {
  [ROLES.SUPERUSER]: 'Superusuario',
  [ROLES.NATIONAL_ADMIN]: 'Administrador nacional',
  [ROLES.INSTITUTION_ADMIN]: 'Administrador institucional',
  [ROLES.BLOOD_BANK_ADMIN]: 'Administrador de banco de sangre',
  [ROLES.BLOOD_BANK_STAFF]: 'Personal de banco de sangre',
  [ROLES.LOGISTICS_STAFF]: 'Personal de logística',
  [ROLES.INVIMA_AUDITOR]: 'Auditor INVIMA',
  [ROLES.DONOR]: 'Donante',
};

/** Etiqueta en español; un rol desconocido se muestra tal cual llega. */
export const roleLabel = (role: string): string => ROLE_LABELS[role] ?? role;
