export const NOT_REGISTERED = 'Sin registrar';

/** Texto para mostrar un dato opcional: nunca devuelve "null" ni "undefined". */
export function orNotRegistered(
  value: string | number | null | undefined,
  format: (value: string | number) => string = String,
): string {
  if (value === null || value === undefined) return NOT_REGISTERED;
  if (typeof value === 'number' && !Number.isFinite(value)) return NOT_REGISTERED;
  if (typeof value === 'string' && !value.trim()) return NOT_REGISTERED;
  return format(value);
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((word) => word.charAt(0).toUpperCase());
  return letters.join('') || '··';
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

const dateTimeFormat = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' });
const numberFormat = new Intl.NumberFormat('es-CO');

export function formatDateTime(iso: string | null): string {
  const time = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(time) ? NOT_REGISTERED : dateTimeFormat.format(time);
}

export const formatNumber = (value: number): string => numberFormat.format(value);

/** "Quedan 7 h 59 min" a partir de la fecha de vencimiento. */
export function formatRemaining(iso: string | null, now: number = Date.now()): string {
  const time = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(time)) return '';
  const minutes = Math.floor((time - now) / 60000);
  if (minutes <= 0) return 'La sesión está por vencer.';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `Quedan ${rest} min`;
  return `Quedan ${hours} h ${rest} min`;
}
