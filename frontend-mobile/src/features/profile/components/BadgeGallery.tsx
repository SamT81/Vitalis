import { Pressable, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/utils';
import { useBadges } from '../hooks/useBadges';
import type { DonorProfile } from '../types';

/** Galería de medallas con el detalle de la seleccionada. */
export function BadgeGallery({ profile }: { profile: DonorProfile }) {
  const { badges, unlockedCount, selected, isUnlocked, select } = useBadges(profile);
  const selectedUnlocked = selected ? isUnlocked(selected) : false;

  return (
    <>
      <View className="mb-3 mt-7 flex-row flex-wrap items-center justify-between gap-2">
        <Text accessibilityRole="header" weight="semibold" className="text-[17px]">
          Mis medallas y logros
        </Text>
        <Text className="text-sm text-slate-600">
          {unlockedCount} / {badges.length} desbloqueadas
        </Text>
      </View>
      <Card>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {badges.map((badge) => {
            const unlocked = isUnlocked(badge);
            const isSelected = badge.id === selected?.id;
            return (
              <Pressable
                key={badge.id}
                onPress={() => select(badge.id)}
                accessibilityRole="button"
                accessibilityLabel={`${badge.name}: ${unlocked ? 'desbloqueada' : 'por desbloquear'}`}
                accessibilityState={{ selected: isSelected }}
                className={cn(
                  'aspect-square w-[22%] items-center justify-center rounded-2xl border',
                  isSelected ? 'border-primary-300 bg-primary-50' : 'border-slate-200 bg-slate-50',
                )}
              >
                <Text className={cn('text-2xl', !unlocked && 'opacity-30')}>{badge.icon}</Text>
              </Pressable>
            );
          })}
        </View>

        {selected ? (
          <View className="mt-5 flex-row items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <View
              className={cn(
                'h-11 w-11 items-center justify-center rounded-xl',
                selectedUnlocked ? 'bg-primary-50' : 'bg-slate-100',
              )}
            >
              <Text className={cn('text-xl', !selectedUnlocked && 'opacity-40')}>
                {selected.icon}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row flex-wrap items-center gap-2">
                <Text weight="semibold" className="text-sm">
                  {selected.name}
                </Text>
                <Badge
                  pill
                  variant={selectedUnlocked ? 'success' : 'muted'}
                  label={selectedUnlocked ? 'Desbloqueada' : 'Por desbloquear'}
                  className="px-2.5 py-0.5"
                />
              </View>
              <Text className="mt-1.5 text-xs leading-5 text-slate-600">
                <Text weight="medium" className="text-xs text-slate-700">
                  Criterio:
                </Text>{' '}
                {selected.criteria}
              </Text>
              <Text className="mt-1 text-xs leading-5 text-slate-600">
                <Text weight="medium" className="text-xs text-slate-700">
                  Beneficio:
                </Text>{' '}
                {selected.benefit}
              </Text>
            </View>
          </View>
        ) : null}
      </Card>
    </>
  );
}
