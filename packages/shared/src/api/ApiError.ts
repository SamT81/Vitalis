import { ERROR_MESSAGES } from '../constants/errorMessages';

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

/** Mensaje en español para cualquier error; los códigos desconocidos usan el genérico. */
export function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    const known: Readonly<Record<string, string>> = ERROR_MESSAGES;
    return known[error.code] ?? ERROR_MESSAGES.GENERIC;
  }
  return ERROR_MESSAGES.GENERIC;
}
