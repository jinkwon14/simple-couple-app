import { useQuery } from '@tanstack/react-query';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { useAppStore } from '../state/store';
import { fetchEggs, fetchInventory, fetchPet } from '../api/supabase';
import { PetAvatar } from '../components/PetAvatar';

export const CollectionScreen = () => {
  const coupleId = useAppStore((state) => state.coupleId);
  const updatePet = useAppStore((state) => state.updatePet);
  const pet = useAppStore((state) => state.pet.pet);

  const { data } = useQuery({
    queryKey: ['collection', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      if (!coupleId) return { eggs: [], inventory: [] };
      const [petData, eggs, inventory] = await Promise.all([
        fetchPet(coupleId),
        fetchEggs(coupleId),
        fetchInventory(coupleId),
      ]);
      updatePet(petData);
      return { eggs, inventory };
    },
  });

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Our Companion</Text>
        <PetAvatar pet={pet} />
      </Card>
      <Card>
        <Text style={styles.title}>Eggs</Text>
        {data?.eggs?.length ? (
          data.eggs.map((egg) => (
            <Text key={egg.id} style={styles.body}>
              {egg.rarity} egg • {Math.round(egg.hatch_progress)}%
            </Text>
          ))
        ) : (
          <Text style={styles.body}>Feed your companion to discover rare eggs.</Text>
        )}
      </Card>
      <Card>
        <Text style={styles.title}>Inventory</Text>
        {data?.inventory?.length ? (
          data.inventory.map((item) => (
            <Text key={item.id} style={styles.body}>
              {item.kind} ×{item.qty}
            </Text>
          ))
        ) : (
          <Text style={styles.body}>Seeds and decor will appear here after random visits and missions.</Text>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#92400E',
  },
  body: {
    fontSize: 14,
    color: '#78350F',
  },
});
