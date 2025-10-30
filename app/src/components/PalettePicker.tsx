import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const colors = ['#2F2E41', '#6C63FF', '#FF6584', '#34D399', '#FBBF24'];

export type PalettePickerProps = {
  selected: string;
  onSelect: (color: string) => void;
};

export const PalettePicker = memo(({ selected, onSelect }: PalettePickerProps) => (
  <View style={styles.row}>
    {colors.map((color) => (
      <Pressable
        key={color}
        style={[styles.swatch, { backgroundColor: color }, selected === color && styles.selected]}
        onPress={() => onSelect(color)}
      />
    ))}
  </View>
));

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#1F2937',
  },
});
