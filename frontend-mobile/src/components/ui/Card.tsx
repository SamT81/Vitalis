import type { ViewProps } from 'react-native';
import { View } from 'react-native';

import { cn } from '@/lib/utils';

function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}
      {...props}
    />
  );
}

export { Card };
