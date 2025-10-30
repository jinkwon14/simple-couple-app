import { ReactNode } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export type ToastProps = {
  message: string;
  action?: ReactNode;
};

export const Toast = ({ message, action }: ToastProps) => (
  <Animated.View style={styles.container} accessibilityLiveRegion="polite">
    <Text style={styles.message}>{message}</Text>
    {action ? <View style={styles.action}>{action}</View> : null}
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3C2F80',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 15,
    flex: 1,
    marginRight: 12,
  },
  action: {
    marginLeft: 12,
  },
});
