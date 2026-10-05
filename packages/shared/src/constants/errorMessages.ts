/** Códigos de error del contrato del DD más los que genera el propio cliente. */
export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  USER_DISABLED: 'USER_DISABLED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/** Único lugar donde se traduce el `code` del backend a un mensaje para el usuario. */
export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'El correo o la contraseña son incorrectos.',
  [ERROR_CODES.ACCOUNT_LOCKED]: 'Demasiados intentos. Intenta de nuevo en unos minutos.',
  [ERROR_CODES.USER_DISABLED]:
    'Tu cuenta está deshabilitada. Contacta al administrador de tu institución.',
  [ERROR_CODES.NETWORK_ERROR]:
    'No hay conexión con el servidor. Revisa tu conexión e intenta de nuevo.',
  GENERIC: 'Ocurrió un error inesperado. Intenta de nuevo.',
} as const;
