import { formatNumber, LIVES_PER_DONATION, orNotRegistered } from '@ribas/shared';
import { Activity, Droplets, Heart, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import type { DonorProfile } from '../types';

interface StatTileProps {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
  accent: string;
}

function StatTile({ icon, label, value, tone, accent }: StatTileProps) {
  return (
    <div className={cn('flex h-full gap-3 rounded-2xl border border-slate-100 p-4', tone)}>
      <span className={cn('mt-0.5 shrink-0 [&_svg]:size-5', accent)}>{icon}</span>
      <div className="min-w-0">
        <dt className="mb-1 text-xs text-slate-600">{label}</dt>
        <dd className={cn('text-[1.05rem] font-bold leading-tight', accent)}>{value}</dd>
      </div>
    </div>
  );
}

/** Resumen: puntos, tipo de sangre, donaciones y vidas salvadas estimadas. */
export function ProfileSummary({ profile }: { profile: DonorProfile }) {
  return (
    <section className="mt-7" aria-labelledby="summary-title">
      <h2 id="summary-title" className="mb-4 text-[1.05rem] text-slate-900">
        Mi resumen
      </h2>
      <dl className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<Zap aria-hidden />}
          label="Puntos acumulados"
          value={orNotRegistered(profile.points, (value) => `${formatNumber(Number(value))} pts`)}
          tone="bg-sky-50"
          accent="text-sky-700"
        />
        <StatTile
          icon={<Droplets aria-hidden />}
          label="Tipo de sangre"
          value={orNotRegistered(profile.bloodType)}
          tone="bg-primary-50"
          accent="text-primary-700"
        />
        <StatTile
          icon={<Heart aria-hidden />}
          label="Donaciones realizadas"
          value={orNotRegistered(profile.donations)}
          tone="bg-primary-50"
          accent="text-primary-700"
        />
        <StatTile
          icon={<Activity aria-hidden />}
          label="Vidas salvadas (est.)"
          value={orNotRegistered(profile.donations, (value) =>
            String(Number(value) * LIVES_PER_DONATION),
          )}
          tone="bg-emerald-50"
          accent="text-emerald-700"
        />
      </dl>
    </section>
  );
}
