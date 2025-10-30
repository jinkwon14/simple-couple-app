import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { PlotTile } from '../components/PlotTile';
import { Button } from '../components/Button';
import { PetAvatar } from '../components/PetAvatar';
import { Toast } from '../components/Toast';
import {
  fetchGarden,
  fetchPet,
  harvestPlot,
  plantSeed,
  waterPlot,
  type GardenPlot,
} from '../api/supabase';
import { useAppStore } from '../state/store';
import { track } from '../lib/analytics';

const seeds = ['seed.sunflower', 'seed.lavender', 'seed.tulip'];

export const HomeScreen = () => {
  const coupleId = useAppStore((state) => state.coupleId);
  const hydrateGarden = useAppStore((state) => state.hydrateGarden);
  const garden = useAppStore((state) => state.garden.plots);
  const updatePet = useAppStore((state) => state.updatePet);
  const markPetFed = useAppStore((state) => state.markPetFed);
  const randomEvent = useAppStore((state) => state.randomEvent);
  const dismissRandomEvent = useAppStore((state) => state.dismissRandomEvent);

  const queryClient = useQueryClient();

  const gardenQuery = useQuery({
    queryKey: ['garden', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      if (!coupleId) return [];
      const data = await fetchGarden(coupleId);
      hydrateGarden(data);
      return data;
    },
  });

  useEffect(() => {
    if (!coupleId) return;
    fetchPet(coupleId).then((pet) => updatePet(pet));
  }, [coupleId, updatePet]);

  const water = useMutation({
    mutationFn: waterPlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garden', coupleId] });
      track('garden_water', {});
    },
  });

  const harvest = useMutation({
    mutationFn: harvestPlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garden', coupleId] });
      track('harvest', {});
    },
  });

  const plant = useMutation({
    mutationFn: ({ plotIndex, seedType }: { plotIndex: number; seedType: string }) => {
      if (!coupleId) throw new Error('Missing couple');
      return plantSeed(coupleId, plotIndex, seedType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garden', coupleId] });
    },
  });

  const handlePlotPress = (plot: GardenPlot) => {
    if (!coupleId) return;
    if (!plot.seed_type) {
      Alert.alert('Plant seed', 'Choose a seed to plant', [
        ...seeds.map((seedType) => ({
          text: seedType.replace('seed.', ''),
          onPress: () => plant.mutate({ plotIndex: plot.plot_index, seedType }),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (plot.stage === 'seed') {
      water.mutate(plot.id);
    } else if (plot.stage === 'sprout') {
      Alert.alert('Keep caring', 'Water once more to help it bloom', [
        { text: 'Water', onPress: () => water.mutate(plot.id) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else if (plot.stage === 'mature') {
      Alert.alert('Harvest time', 'Collect your Love Seeds?', [
        { text: 'Harvest', onPress: () => harvest.mutate(plot.id) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const pet = useAppStore((state) => state.pet.pet);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Our Garden</Text>
      <View style={styles.grid}>
        {garden.map((plot) => (
          <PlotTile key={plot.id} plot={plot} onPress={handlePlotPress} />
        ))}
      </View>
      <Card>
        <Text style={styles.subheading}>Companion</Text>
        <PetAvatar pet={pet} />
        {pet ? (
          <Button
            title="Feed snack"
            onPress={() => {
              markPetFed();
              track('pet_feed', { petId: pet.id });
            }}
          />
        ) : null}
      </Card>
      {randomEvent && !randomEvent.seen ? (
        <View style={styles.toastWrapper}>
          <Toast
            message={randomEvent.reward ? `${randomEvent.message} +${randomEvent.reward}` : randomEvent.message}
            action={<Button title="Yay!" onPress={dismissRandomEvent} variant="secondary" />}
          />
        </View>
      ) : null}
      {gardenQuery.isLoading ? <Text style={styles.caption}>Loading garden...</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#312E81',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1E293B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  caption: {
    textAlign: 'center',
    color: '#4B5563',
    marginTop: 12,
  },
  toastWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
});
