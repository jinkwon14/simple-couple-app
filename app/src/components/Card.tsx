import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export type CardProps = {
  children: ReactNode;
  elevated?: boolean;
};

export const Card = ({ children, elevated = true }: CardProps) => (
  <View style={[styles.base, elevated && styles.shadow]}>{children}</View>
);

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  shadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});
