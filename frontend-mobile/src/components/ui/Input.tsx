import { useState } from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput } from 'react-native';

import { colors, fonts } from '@/lib/theme';
import { cn } from '@/lib/utils';

export interface InputProps extends TextInputProps {
  invalid?: boolean;
}

function Input({ invalid = false, className, style, onFocus, onBlur, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={colors.slate500}
      className={cn(
        'min-h-[48px] rounded-xl border bg-slate-50 px-3.5 text-[15px] text-slate-900',
        invalid || focused ? 'border-primary-600' : 'border-slate-300',
        focused && 'border-2 bg-white',
        className,
      )}
      style={[{ fontFamily: fonts.regular }, style]}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      {...props}
    />
  );
}

export { Input };
