import { donorLevel, initials, orNotRegistered } from '@ribas/shared';
import { Droplets, MapPin } from 'lucide-react';

import { Card } from '@/components/ui/Card';

import type { DonorProfile } from '../types';

interface DonorIdentityCardProps {
  name: string;
  profile: DonorProfile;
}

export function DonorIdentityCard({ name, profile }: DonorIdentityCardProps) {
  return (
    <Card className="mt-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <span
          aria-hidden
          className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-primary-100 bg-primary-50 text-xl font-bold text-primary-700"
        >
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-slate-600">{donorLevel(profile)} · Vitalis RIBAS</p>
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
  );
}
