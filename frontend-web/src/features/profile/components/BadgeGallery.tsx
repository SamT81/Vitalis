import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useBadges } from '../hooks/useBadges';
import type { DonorProfile } from '../types';

/** Galería de medallas con el detalle de la seleccionada. */
export function BadgeGallery({ profile }: { profile: DonorProfile }) {
  const { badges, unlockedCount, selected, isUnlocked, select } = useBadges(profile);
  const selectedUnlocked = selected ? isUnlocked(selected) : false;

  return (
    <section className="mt-7" aria-labelledby="badges-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="badges-title" className="text-[1.05rem] text-slate-900">
          Mis medallas y logros
        </h2>
        <span className="text-sm text-slate-600">
          {unlockedCount} / {badges.length} desbloqueadas
        </span>
      </div>
      <Card className="p-5 sm:p-6">
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {badges.map((badge) => {
            const unlocked = isUnlocked(badge);
            const isSelected = badge.id === selected?.id;
            return (
              <li key={badge.id}>
                <button
                  type="button"
                  onClick={() => select(badge.id)}
                  aria-pressed={isSelected}
                  aria-label={`${badge.name}: ${unlocked ? 'desbloqueada' : 'por desbloquear'}`}
                  className={cn(
                    'flex aspect-square w-full items-center justify-center rounded-2xl border text-2xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
                    isSelected
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100',
                  )}
                >
                  <span aria-hidden className={cn(!unlocked && 'opacity-40 grayscale')}>
                    {badge.icon}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {selected && (
          <div
            className="mt-5 flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
            aria-live="polite"
          >
            <span
              aria-hidden
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl text-xl',
                selectedUnlocked ? 'bg-primary-50' : 'bg-slate-100 opacity-60 grayscale',
              )}
            >
              {selected.icon}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{selected.name}</span>
                <Badge
                  variant={selectedUnlocked ? 'success' : 'muted'}
                  className="rounded-full py-0.5"
                >
                  {selectedUnlocked ? 'Desbloqueada' : 'Por desbloquear'}
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-slate-600">
                <b className="font-medium text-slate-700">Criterio:</b> {selected.criteria}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                <b className="font-medium text-slate-700">Beneficio:</b> {selected.benefit}
              </p>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
