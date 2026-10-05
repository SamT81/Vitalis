import { Text } from '@/components/ui/text';

/** Mensaje de validación debajo de un campo. */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text accessibilityLiveRegion="polite" className="mt-1.5 text-sm text-primary-700">
      {message}
    </Text>
  );
}
