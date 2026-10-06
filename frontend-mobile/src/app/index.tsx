import { Feather } from '@expo/vector-icons';
import type { HomeBenefitId } from '@ribas/shared';
import { HOME_BENEFITS, HOME_CONTENT, HOME_STATS, HOME_STEPS, ROUTES } from '@ribas/shared';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Brand } from '@/components/layout/Brand';
import { Screen } from '@/components/layout/Screen';
import type { IconName } from '@/components/ui/Button';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useSession } from '@/features/auth';
import { colors } from '@/lib/theme';

const BENEFIT_ICONS: Record<HomeBenefitId, IconName> = {
  gamification: 'award',
  impact: 'heart',
  campaigns: 'map-pin',
};

export default function HomeScreen() {
  const { isAuthenticated } = useSession();

  return (
    <Screen edges={['top', 'bottom']}>
      <Brand />

      {/* Hero */}
      <View className="mt-8 items-center">
        <View className="flex-row items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5">
          <Feather name="heart" size={13} color={colors.primaryDark} />
          <Text weight="medium" className="shrink text-xs text-primary-700">
            {HOME_CONTENT.pill}
          </Text>
        </View>
        <Text
          accessibilityRole="header"
          weight="semibold"
          className="mt-5 text-center text-[34px] leading-[40px]"
        >
          {HOME_CONTENT.title}
        </Text>
        <Text className="mt-4 text-center text-base leading-6 text-slate-600">
          {HOME_CONTENT.lead}
        </Text>
        <Text
          weight="semibold"
          className="mt-4 text-center text-[11px] uppercase tracking-[3px] text-primary-700"
        >
          {HOME_CONTENT.kicker}
        </Text>
      </View>

      <View className="mt-7 gap-3">
        {isAuthenticated ? (
          <Button
            size="lg"
            title="Ir a mi cuenta"
            icon="arrow-right"
            iconPosition="right"
            onPress={() => router.push(ROUTES.ACCOUNT)}
          />
        ) : (
          <Button
            size="lg"
            title="Iniciar sesión"
            icon="log-in"
            onPress={() => router.push(ROUTES.LOGIN)}
          />
        )}
        <Button
          size="lg"
          variant="outline"
          title="Registrarme como donante"
          icon="user-plus"
          onPress={() => router.push(ROUTES.REGISTER)}
        />
      </View>

      <View className="mt-10 flex-row border-t border-slate-200 pt-7">
        {HOME_STATS.map((stat) => (
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
            {HOME_CONTENT.missionLabel}
          </Text>
        </View>
        <Text weight="medium" className="text-center text-[17px] leading-7 text-white">
          “{HOME_CONTENT.mission}”
        </Text>
        <Text className="mt-5 text-center text-sm text-slate-300">{HOME_CONTENT.missionSign}</Text>
      </View>

      {/* Pilares de la red */}
      <View className="mt-10">
        <Text accessibilityRole="header" weight="semibold" className="text-center text-2xl">
          {HOME_CONTENT.benefitsTitle}
        </Text>
        <Text className="mt-2 text-center text-[15px] leading-6 text-slate-600">
          {HOME_CONTENT.benefitsLead}
        </Text>
        <View className="mt-6 gap-4">
          {HOME_BENEFITS.map((benefit) => (
            <View key={benefit.id} className="rounded-2xl border border-slate-200 bg-white p-6">
              <View className="mb-4 h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
                <Feather name={BENEFIT_ICONS[benefit.id]} size={20} color={colors.primaryDark} />
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
          {HOME_CONTENT.stepsTitle}
        </Text>
        <Text className="mt-2 text-center text-[15px] text-slate-600">
          {HOME_CONTENT.stepsLead}
        </Text>
        <View className="mt-6 gap-6">
          {HOME_STEPS.map((step) => (
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
          {HOME_CONTENT.ctaTitle}
        </Text>
        <Button
          size="lg"
          variant="light"
          title="Registrarme como donante"
          icon="arrow-right"
          iconPosition="right"
          className="mt-6 self-stretch"
          onPress={() => router.push(ROUTES.REGISTER)}
        />
      </View>

      {/* Confianza */}
      <View className="mt-8 flex-row items-start gap-2 px-1">
        <Feather name="shield" size={14} color={colors.slate500} style={{ marginTop: 2 }} />
        <Text className="flex-1 text-xs leading-5 text-slate-600">{HOME_CONTENT.trust}</Text>
      </View>
      <Text className="mt-6 text-center text-xs text-slate-600">{HOME_CONTENT.copyright}</Text>
    </Screen>
  );
}
