import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Brand } from '@/components/Brand';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/button';
import type { IconName } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth/AuthContext';
import { colors } from '@/lib/theme';

const STATS = [
  { value: '12,400+', label: 'Donantes activos' },
  { value: '38,200', label: 'Unidades donadas' },
  { value: '9,700', label: 'Vidas asistidas' },
];

const BENEFITS: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: 'award',
    title: 'Gamificación real',
    desc: 'Gana puntos, sube de nivel y desbloquea insignias de "Héroe" cada vez que donas sangre.',
  },
  {
    icon: 'heart',
    title: 'Impacto personalizado',
    desc: 'Entérate exactamente a qué hospital y a cuántas personas ayudó tu última donación.',
  },
  {
    icon: 'map-pin',
    title: 'Campañas cercanas',
    desc: 'Encuentra jornadas de la red RIBAS cerca de ti e inscríbete en un toque, sin llamadas ni filas.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Crea tu cuenta',
    desc: 'Regístrate como donante con tus datos básicos y tu tipo de sangre en menos de dos minutos.',
  },
  {
    n: '02',
    title: 'Elige una campaña',
    desc: 'Explora las jornadas activas y próximas de la red y reserva tu cupo cuando te convenga.',
  },
  {
    n: '03',
    title: 'Dona y sigue tu impacto',
    desc: 'Acumula puntos, sube de nivel y mira en tiempo real la vida que ayudaste a salvar.',
  },
];

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();

  return (
    <Screen edges={['top', 'bottom']}>
      <Brand />

      {/* Hero */}
      <View className="mt-8 items-center">
        <View className="flex-row items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5">
          <Feather name="heart" size={13} color={colors.primaryDark} />
          <Text weight="medium" className="shrink text-xs text-primary-700">
            Red Interinstitucional de Bancos de Sangre
          </Text>
        </View>
        <Text
          accessibilityRole="header"
          weight="semibold"
          className="mt-5 text-center text-[34px] leading-[40px]"
        >
          Cada donación es una vida que continúa
        </Text>
        <Text className="mt-4 text-center text-base leading-6 text-slate-600">
          Vitalis conecta los bancos de sangre de la red RIBAS en una sola plataforma: encuentra
          campañas, agenda tu donación y sigue en tiempo real el impacto de cada componente
          sanguíneo que das.
        </Text>
        <Text
          weight="semibold"
          className="mt-4 text-center text-[11px] uppercase tracking-[3px] text-primary-700"
        >
          Tecnología al servicio de la vida
        </Text>
      </View>

      <View className="mt-7 gap-3">
        {isAuthenticated ? (
          <Button
            size="lg"
            title="Ir a mi cuenta"
            icon="arrow-right"
            iconPosition="right"
            onPress={() => router.push('/cuenta')}
          />
        ) : (
          <Button
            size="lg"
            title="Iniciar sesión"
            icon="log-in"
            onPress={() => router.push('/login')}
          />
        )}
        <Button
          size="lg"
          variant="outline"
          title="Registrarme como donante"
          icon="user-plus"
          onPress={() => router.push('/registro')}
        />
      </View>

      <View className="mt-10 flex-row border-t border-slate-200 pt-7">
        {STATS.map((stat) => (
          <View key={stat.label} className="flex-1 items-center px-1">
            <Text weight="semibold" className="text-xl">
              {stat.value}
            </Text>
            <Text className="mt-1 text-center text-xs text-slate-600">{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Misión institucional */}
      <View className="mt-10 rounded-3xl bg-slate-900 px-6 py-9">
        <View className="mb-4 flex-row items-center justify-center gap-1.5">
          <Feather name="target" size={14} color={colors.primaryLight} />
          <Text weight="semibold" className="text-[11px] uppercase tracking-[2px] text-primary-400">
            Nuestra misión
          </Text>
        </View>
        <Text weight="medium" className="text-center text-[17px] leading-7 text-white">
          “Conectar y optimizar la Red Interinstitucional de Bancos de Sangre (RIBAS) mediante una
          plataforma tecnológica eficiente, ágil y transparente que facilite la gestión, donación y
          distribución oportuna de componentes sanguíneos para salvar vidas.”
        </Text>
        <Text className="mt-5 text-center text-sm text-slate-300">— Vitalis · RIBAS</Text>
      </View>

      {/* Pilares de la red */}
      <View className="mt-10">
        <Text accessibilityRole="header" weight="semibold" className="text-center text-2xl">
          Una red, muchos bancos de sangre
        </Text>
        <Text className="mt-2 text-center text-[15px] leading-6 text-slate-600">
          Todo lo que necesitas para convertir la donación en un hábito, sin fricción.
        </Text>
        <View className="mt-6 gap-4">
          {BENEFITS.map((benefit) => (
            <View key={benefit.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <View className="mb-4 h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
                <Feather name={benefit.icon} size={20} color={colors.primaryDark} />
              </View>
              <Text weight="semibold" className="mb-1.5">
                {benefit.title}
              </Text>
              <Text className="text-sm leading-6 text-slate-600">{benefit.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Cómo funciona */}
      <View className="mt-10">
        <Text accessibilityRole="header" weight="semibold" className="text-center text-2xl">
          Cómo funciona
        </Text>
        <Text className="mt-2 text-center text-[15px] text-slate-600">
          Tres pasos entre tú y tu próxima donación.
        </Text>
        <View className="mt-6 gap-6">
          {STEPS.map((step) => (
            <View key={step.n} className="flex-row gap-4">
              <Text weight="semibold" className="w-14 text-4xl leading-10 text-slate-300">
                {step.n}
              </Text>
              <View className="flex-1">
                <Text weight="semibold" className="mb-1">
                  {step.title}
                </Text>
                <Text className="text-sm leading-6 text-slate-600">{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View className="mt-10 items-center rounded-3xl bg-slate-900 px-6 py-10">
        <Feather name="shield" size={30} color={colors.primaryLight} />
        <Text weight="semibold" className="mt-4 text-center text-[22px] leading-7 text-white">
          Únete a la red de donantes y empieza a sumar estrellas
        </Text>
        <Button
          size="lg"
          variant="light"
          title="Registrarme como donante"
          icon="arrow-right"
          iconPosition="right"
          className="mt-6 self-stretch"
          onPress={() => router.push('/registro')}
        />
      </View>

      {/* Confianza */}
      <View className="mt-8 flex-row items-start gap-2 px-1">
        <Feather name="shield" size={14} color={colors.slate500} style={{ marginTop: 2 }} />
        <Text className="flex-1 text-xs leading-5 text-slate-600">
          Tus datos y resultados de tamizaje se manejan de forma confidencial, conforme al Decreto
          1571 de 1993 y la normativa de protección de datos vigente en Colombia.
        </Text>
      </View>
      <Text className="mt-6 text-center text-xs text-slate-600">
        © 2026 Vitalis · RIBAS · Tecnología al servicio de la vida
      </Text>
    </Screen>
  );
}
