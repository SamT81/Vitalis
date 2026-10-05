/** Catálogo de medallas y niveles (portado de js/main.js del sitio HTML). */
export interface Badge {
  id: string;
  name: string;
  icon: string;
  /** Donaciones necesarias; Infinity = no se desbloquea por donaciones. */
  threshold: number;
  bloodTypeReq?: string;
  criteria: string;
  benefit: string;
}

// prettier-ignore
export const BADGES: readonly Badge[] = [
  { id: 'B-01', name: 'Primer Donante', icon: '🩸', threshold: 1,
    criteria: 'Completa tu primera donación exitosa.',
    benefit: 'Desbloquea tu perfil de héroe y 100 puntos de bienvenida.' },
  { id: 'B-02', name: 'Héroe Bronce', icon: '🥉', threshold: 5,
    criteria: 'Alcanza 5 donaciones registradas.',
    benefit: 'Insignia visible en tu perfil y 150 puntos extra.' },
  { id: 'B-03', name: 'Donante Frecuente', icon: '🔥', threshold: 6,
    criteria: 'Dona en 6 convocatorias sin fallar tu fecha disponible.',
    benefit: 'Multiplicador de puntos x1.5 en tu próxima donación.' },
  { id: 'B-04', name: 'Héroe de Plata', icon: '🥈', threshold: 10,
    criteria: 'Alcanza 10 donaciones registradas.',
    benefit: 'Acceso prioritario a jornadas con cupos limitados.' },
  { id: 'B-05', name: 'Héroe Platino', icon: '🏆', threshold: 18,
    criteria: 'Alcanza 18 donaciones registradas.',
    benefit: 'Prioridad en notificaciones de escasez cercanas.' },
  { id: 'B-06', name: 'Donante Universal', icon: '🌐', threshold: 3, bloodTypeReq: 'O−',
    criteria: 'Exclusiva para tipo de sangre O−: dona 3 veces en jornadas de emergencia.',
    benefit: 'Reconocimiento especial y alerta prioritaria en escasez crítica.' },
  { id: 'B-07', name: 'Héroe de Sangre', icon: '💎', threshold: 25,
    criteria: 'Alcanza 25 donaciones registradas.',
    benefit: 'Máximo nivel de la red: invitación a los eventos anuales de Vitalis.' },
  { id: 'B-08', name: 'Embajador', icon: '🎗️', threshold: Infinity,
    criteria: 'Invita a 3 personas que completen su primera donación.',
    benefit: 'Insignia de embajador y mención en el boletín de campañas.' },
];

export function heroLevel(donations: number): string {
  if (donations >= 25) return 'Héroe de Sangre';
  if (donations >= 18) return 'Héroe Platino';
  if (donations >= 10) return 'Héroe de Plata';
  if (donations >= 5) return 'Héroe Bronce';
  if (donations >= 1) return 'Donante activo';
  return 'Donante nuevo';
}

export function badgeUnlocked(badge: Badge, donations: number, bloodType: string | null): boolean {
  if (badge.bloodTypeReq && bloodType !== badge.bloodTypeReq) return false;
  if (!Number.isFinite(badge.threshold)) return false;
  return donations >= badge.threshold;
}
