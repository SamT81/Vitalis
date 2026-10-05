import { cn } from '@/lib/utils';
import { Text } from './text';
import type { TextProps } from './text';

/** Etiqueta visible del campo; el TextInput repite el texto en accessibilityLabel. */
function Label({ className, ...props }: TextProps) {
  return (
    <Text
      weight="medium"
      className={cn('mb-1.5 text-xs uppercase tracking-wide text-slate-600', className)}
      {...props}
    />
  );
}

export { Label };
