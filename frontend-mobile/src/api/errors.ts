/** Error normalizado con el esquema del DD: { status, code, message, timestamp }. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly timestamp: string;

  constructor(status: number, code: string, message = '', timestamp = new Date().toISOString()) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.timestamp = timestamp;
  }
}

/** Único lugar donde se traduce el `code` del backend a un mensaje para el usuario. */
export const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  INVALID_CREDENTIALS: 'El correo o la contraseña son incorrectos.',
  ACCOUNT_LOCKED: 'Demasiados intentos. Intenta de nuevo en unos minutos.',
  USER_DISABLED: 'Tu cuenta está deshabilitada. Contacta al administrador de tu institución.',
  NETWORK_ERROR: 'No hay conexión con el servidor. Revisa tu conexión e intenta de nuevo.',
};

export const GENERIC_ERROR_MESSAGE = 'Ocurrió un error inesperado. Intenta de nuevo.';

export function messageFor(error: unknown): string {
  if (error instanceof ApiError) return ERROR_MESSAGES[error.code] ?? GENERIC_ERROR_MESSAGE;
  return GENERIC_ERROR_MESSAGE;
}
