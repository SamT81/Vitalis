import type { TextProps as RNTextProps } from 'react-native';
import { Text as RNText } from 'react-native';

import { cn } from '@/lib/utils';

const FAMILY = {
  regular: 'font-inter',
  medium: 'font-inter-medium',
  semibold: 'font-inter-semibold',
  bold: 'font-inter-bold',
} as const;

export interface TextProps extends RNTextProps {
  /** En React Native cada peso de Inter es una familia aparte. */
  weight?: keyof typeof FAMILY;
}

function Text({ weight = 'regular', className, ...props }: TextProps) {
  return (
    <RNText className={cn(FAMILY[weight], 'text-base text-slate-900', className)} {...props} />
  );
}

export { Text };
