import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
  disabled?: boolean;
};

export const Button = ({ title, onPress, variant = 'primary', icon, disabled }: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={[styles.base, variant === 'secondary' && styles.secondary, disabled && styles.disabled]}
    disabled={disabled}
  >
    {icon}
    <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    gap: 8,
  },
  secondary: {
    backgroundColor: '#F3F1FF',
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryLabel: {
    color: '#6C63FF',
  },
});
