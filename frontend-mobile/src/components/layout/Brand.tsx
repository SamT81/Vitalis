import { Image, View } from 'react-native';

import { Text } from '@/components/ui/Text';

const logo = require('../../../assets/logo-vitalis.png');

export function Brand() {
  return (
    <View
      className="flex-row items-center gap-2"
      accessible
      accessibilityLabel="Vitalis · Red RIBAS"
    >
      <Image source={logo} style={{ width: 44, height: 44 }} resizeMode="contain" />
      <View>
        <Text weight="bold" className="text-xl leading-6">
          Vitalis
        </Text>
        <Text weight="medium" className="text-[11px] uppercase tracking-wider text-slate-600">
          Red RIBAS
        </Text>
      </View>
    </View>
  );
}
