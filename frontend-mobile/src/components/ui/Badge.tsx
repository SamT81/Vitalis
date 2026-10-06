import { View } from 'react-native';

import { cn } from '@/lib/utils';

import { Text } from './Text';

type Variant = 'default' | 'success' | 'muted';

const CONTAINER: Record<Variant, string> = {
  default: 'border-primary-100 bg-primary-50',
  success: 'border-emerald-100 bg-emerald-50',
  muted: 'border-slate-200 bg-slate-100',
};

const LABEL: Record<Variant, string> = {
  default: 'text-primary-700',
  success: 'text-emerald-700',
  muted: 'text-slate-600',
};

interface BadgeProps {
  label: string;
  variant?: Variant;
  /** Forma de píldora (bordes totalmente redondos). */
  pill?: boolean;
  className?: string;
}

function Badge({ label, variant = 'default', pill = false, className }: BadgeProps) {
  return (
    <View
      className={cn(
        'self-start border px-2.5 py-1',
        pill ? 'rounded-full px-3.5 py-1.5' : 'rounded-lg',
        CONTAINER[variant],
        className,
      )}
    >
      <Text weight="medium" className={cn('text-xs', LABEL[variant])}>
        {label}
      </Text>
    </View>
  );
}

export { Badge };
