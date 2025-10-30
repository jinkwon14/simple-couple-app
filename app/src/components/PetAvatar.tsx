import { StyleSheet, Text, View } from 'react-native';
import type { PetInstance } from '../api/supabase';

export type PetAvatarProps = {
  pet?: PetInstance | null;
};

export const PetAvatar = ({ pet }: PetAvatarProps) => {
  if (!pet) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyText}>Adopt your first companion!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.initials}>{pet.nickname?.slice(0, 2) ?? 'LG'}</Text>
      </View>
      <View style={styles.stats}>
        <Text style={styles.label}>Hunger {pet.hunger}%</Text>
        <Text style={styles.label}>Energy {pet.energy}%</Text>
        <Text style={styles.label}>Happy {pet.happiness}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  empty: {
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  stats: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
});
