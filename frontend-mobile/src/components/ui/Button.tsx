import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { PressableProps } from 'react-native';
import { ActivityIndicator, Pressable } from 'react-native';

import { colors } from '@/lib/theme';
import { cn } from '@/lib/utils';

import { Text } from './Text';

type Variant = 'default' | 'outline' | 'ghost' | 'light';
type Size = 'default' | 'lg';
export type IconName = ComponentProps<typeof Feather>['name'];

const CONTAINER: Record<Variant, string> = {
  default: 'bg-primary active:bg-primary-700',
  outline: 'border border-slate-300 bg-white active:bg-slate-100',
  ghost: 'active:bg-slate-100',
  light: 'bg-white active:bg-slate-100',
};

const LABEL: Record<Variant, string> = {
  default: 'text-primary-foreground',
  outline: 'text-slate-700',
  ghost: 'text-slate-700',
  light: 'text-slate-900',
};

const ICON: Record<Variant, string> = {
  default: colors.white,
  outline: colors.slate700,
  ghost: colors.slate700,
  light: colors.slate900,
};

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  /** Texto mientras `loading` es true. */
  loadingTitle?: string;
  className?: string;
}

function Button({
  title,
  variant = 'default',
  size = 'default',
  icon,
  iconPosition = 'left',
  loading = false,
  loadingTitle,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled) || loading;
  const iconNode = icon ? <Feather name={icon} size={18} color={ICON[variant]} /> : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={loading && loadingTitle ? loadingTitle : title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-xl px-5',
        size === 'lg' ? 'min-h-[52px]' : 'min-h-[46px]',
        CONTAINER[variant],
        isDisabled && 'opacity-60',
        className,
      )}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" color={ICON[variant]} /> : null}
      {!loading && iconPosition === 'left' ? iconNode : null}
      <Text weight="semibold" className={cn('text-center text-[15px]', LABEL[variant])}>
        {loading && loadingTitle ? loadingTitle : title}
      </Text>
      {!loading && iconPosition === 'right' ? iconNode : null}
    </Pressable>
  );
}

export { Button };
