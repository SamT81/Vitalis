import { Activity, CircleAlert, Droplets, Heart, MapPin, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { messageFor } from '@/api/errors';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/features/auth/AuthContext';
import { BADGES, badgeUnlocked, heroLevel } from '@/features/profile/badges';
import { profileService } from '@/features/profile/profileService';
import { EMPTY_PROFILE } from '@/features/profile/types';
import type { DonorProfile } from '@/features/profile/types';
import { firstName, formatNumber, initials, orNotRegistered } from '@/lib/format';
import { cn } from '@/lib/utils';

interface TileProps {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
  accent: string;
}

function StatTile({ icon, label, value, tone, accent }: TileProps) {
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

export function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.userId;
  const [profile, setProfile] = useState<DonorProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    profileService
      .getProfile(userId)
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(messageFor(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  if (!user) return null;

  const donations = profile.donations ?? 0;
  const unlocked = BADGES.filter((badge) => badgeUnlocked(badge, donations, profile.bloodType));
  const selected =
    BADGES.find((badge) => badge.id === selectedId) ?? unlocked[unlocked.length - 1] ?? BADGES[0];
  const selectedUnlocked = selected ? unlocked.includes(selected) : false;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6" aria-busy={loading}>
      <header className="pb-2 pt-10">
        <h1 className="text-[clamp(1.6rem,3.5vw,2.1rem)] text-slate-900">
          Hola, {firstName(user.name)} 👋
        </h1>
        <p className="mt-1.5 text-[0.95rem] text-slate-600">
          Este es tu perfil de donante. Aquí sigues tus puntos, tus donaciones y tus medallas.
        </p>
      </header>

      {error && (
        <Alert variant="destructive" className="mt-5">
          <CircleAlert aria-hidden />
          <AlertDescription>No pudimos cargar tu perfil de donante. {error}</AlertDescription>
        </Alert>
      )}

      <Card className="mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden
            className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-primary-100 bg-primary-50 text-xl font-bold text-primary-700"
          >
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-600">
              {profile.donations === null ? 'Donante' : heroLevel(donations)} · Vitalis RIBAS
            </p>
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-600">
              <MapPin className="size-3" aria-hidden />
              <span className="sr-only">Ciudad:</span> {orNotRegistered(profile.city)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700">
            <Droplets className="size-3.5" aria-hidden />
            <span className="sr-only">Tipo de sangre:</span> {orNotRegistered(profile.bloodType)}
          </span>
        </div>
      </Card>

      <section className="mt-7" aria-labelledby="resumen-titulo">
        <h2 id="resumen-titulo" className="mb-4 text-[1.05rem] text-slate-900">
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
            value={orNotRegistered(profile.donations, (value) => String(Number(value) * 3))}
            tone="bg-emerald-50"
            accent="text-emerald-700"
          />
        </dl>
      </section>

      <section className="mt-7" aria-labelledby="medallas-titulo">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="medallas-titulo" className="text-[1.05rem] text-slate-900">
            Mis medallas y logros
          </h2>
          <span className="text-sm text-slate-600">
            {unlocked.length} / {BADGES.length} desbloqueadas
          </span>
        </div>
        <Card className="p-5 sm:p-6">
          <ul className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {BADGES.map((badge) => {
              const isUnlocked = unlocked.includes(badge);
              const isSelected = badge.id === selected?.id;
              return (
                <li key={badge.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(badge.id)}
                    aria-pressed={isSelected}
                    aria-label={`${badge.name}: ${isUnlocked ? 'desbloqueada' : 'por desbloquear'}`}
                    className={cn(
                      'flex aspect-square w-full items-center justify-center rounded-2xl border text-2xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
                      isSelected
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100',
                    )}
                  >
                    <span aria-hidden className={cn(!isUnlocked && 'opacity-40 grayscale')}>
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
    </div>
  );
}
