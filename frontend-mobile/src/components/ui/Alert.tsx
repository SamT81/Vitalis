import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';

import { colors } from '@/lib/theme';
import { cn } from '@/lib/utils';

import type { IconName } from './Button';
import { Text } from './Text';

type Variant = 'default' | 'destructive' | 'success' | 'warning';

const CONTAINER: Record<Variant, string> = {
  default: 'border-slate-200 bg-slate-50',
  destructive: 'border-primary-100 bg-primary-50',
  success: 'border-emerald-100 bg-emerald-50',
  warning: 'border-amber-100 bg-amber-50',
};

const TEXT: Record<Variant, string> = {
  default: 'text-slate-700',
  destructive: 'text-primary-700',
  success: 'text-emerald-700',
  warning: 'text-amber-800',
};

const ICON_COLOR: Record<Variant, string> = {
  default: colors.slate700,
  destructive: colors.primaryDark,
  success: colors.emerald700,
  warning: colors.amber800,
};

interface AlertProps {
  variant?: Variant;
  icon?: IconName;
  title?: string;
  message: string;
  className?: string;
}

/** Aviso accesible: los lectores de pantalla lo anuncian al aparecer. */
function Alert({ variant = 'default', icon, title, message, className }: AlertProps) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={cn(
        'flex-row items-start gap-3 rounded-xl border p-3.5',
        CONTAINER[variant],
        className,
      )}
    >
      {icon ? (
        <Feather name={icon} size={18} color={ICON_COLOR[variant]} style={{ marginTop: 1 }} />
      ) : null}
      <View className="flex-1">
        {title ? (
          <Text weight="semibold" className={cn('mb-0.5 text-sm', TEXT[variant])}>
            {title}
          </Text>
        ) : null}
        <Text className={cn('text-sm leading-5', TEXT[variant])}>{message}</Text>
      </View>
    </View>
  );
}

export { Alert };
