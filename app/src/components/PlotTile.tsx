import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GardenPlot } from '../api/supabase';

export type PlotTileProps = {
  plot: GardenPlot;
  onPress: (plot: GardenPlot) => void;
};

const stageColor: Record<string, string> = {
  seed: '#FACC15',
  sprout: '#34D399',
  mature: '#2563EB',
};

export const PlotTile = ({ plot, onPress }: PlotTileProps) => {
  const color = plot.stage ? stageColor[plot.stage] ?? '#CBD5F5' : '#E5E7EB';
  return (
    <Pressable style={[styles.tile, { borderColor: color }]} onPress={() => onPress(plot)}>
      <View style={[styles.inner, { backgroundColor: color }]}
        accessibilityLabel={`Plot ${plot.plot_index + 1} ${plot.seed_type ?? 'empty'}`}
      >
        <Text style={styles.label}>{plot.seed_type ?? 'Empty'}</Text>
        <Text style={styles.stage}>{plot.stage ?? 'open'}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderWidth: 2,
    borderRadius: 12,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  stage: {
    fontSize: 12,
    color: '#374151',
  },
});
