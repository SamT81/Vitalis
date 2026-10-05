import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

interface ScreenProps {
  children: ReactNode;
  /** Bordes con área segura. Las pantallas con cabecera de navegación no necesitan "top". */
  edges?: Edge[];
  /** Centra el contenido verticalmente (pantallas de acceso). */
  centered?: boolean;
  className?: string;
}

/** Contenedor base: área segura, scroll vertical y teclado que no tapa los campos. */
export function Screen({ children, edges = ['bottom'], centered = false, className }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName={cn('grow px-4 py-6', centered && 'justify-center')}
        >
          <View className={cn('w-full max-w-xl self-center', className)}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
