import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { useAppStore } from '../state/store';
import { track } from '../lib/analytics';

export type PremiumGateProps = {
  feature: string;
  children: ReactNode;
};

export const PremiumGate = ({ feature, children }: PremiumGateProps) => {
  const premium = useAppStore((state) => state.premium);
  const setPremium = useAppStore((state) => state.setPremium);

  if (premium === 'premium') {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unlock {feature}</Text>
      <Text style={styles.copy}>
        Support LoveGarden and access special rituals, exclusive question packs, and cozy decor.
      </Text>
      <Button
        title="Try Premium"
        onPress={() => {
          setPremium('trial');
          track('premium_subscribe', { feature });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FBBF24',
    padding: 24,
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
  },
  copy: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
});
