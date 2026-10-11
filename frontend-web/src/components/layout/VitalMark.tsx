import { cn } from '@/lib/utils';

interface VitalMarkProps {
  className?: string;
  /** `light` sobre fondos claros; `dark` sobre el azul marino. */
  tone?: 'light' | 'dark';
}

const TONES = {
  light: { field: '#e2c9cb', ring: '#0f2347', drop: '#0f2347', accent: '#e11d48' },
  dark: { field: '#1b2d54', ring: '#e2c9cb', drop: '#e2c9cb', accent: '#e11d48' },
} as const;

const DROP = 'M0-150C62-62 112-2 112 58a112 112 0 0 1-224 0C-112-2-62-62 0-150Z';

/** Ilustración de marca: una gota que se abre en ondas. Es decorativa. */
export function VitalMark({ className, tone = 'light' }: VitalMarkProps) {
  const color = TONES[tone];

  return (
    <svg
      viewBox="0 0 520 600"
      fill="none"
      aria-hidden
      focusable="false"
      className={cn('h-auto w-full', className)}
    >
      <path
        d="M262 28c94-8 208 56 230 168s-22 214-96 290-190 96-270 44S6 372 22 262 128 40 262 28Z"
        fill={color.field}
      />
      <g stroke={color.ring} strokeWidth="1.5">
        <circle cx="300" cy="352" r="168" opacity="0.22" />
        <circle cx="300" cy="352" r="214" opacity="0.14" />
        <circle cx="300" cy="352" r="262" opacity="0.08" />
      </g>
      <path d={DROP} transform="translate(300 300)" fill={color.drop} />
      <path d={DROP} transform="translate(128 452) scale(0.3)" fill={color.accent} />
    </svg>
  );
}
