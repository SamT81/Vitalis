import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Input } from '@/components/ui/input';
import type { InputProps } from '@/components/ui/input';
import { colors } from '@/lib/theme';

/** Campo de contraseña con botón para mostrarla u ocultarla. */
export function PasswordInput(props: Omit<InputProps, 'secureTextEntry'>) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="justify-center">
      <Input
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        className="pr-12"
        {...props}
      />
      <Pressable
        onPress={() => setVisible((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        accessibilityState={{ selected: visible }}
        hitSlop={8}
        className="absolute right-0 h-12 w-12 items-center justify-center"
      >
        <Feather name={visible ? 'eye-off' : 'eye'} size={18} color={colors.slate600} />
      </Pressable>
    </View>
  );
}
