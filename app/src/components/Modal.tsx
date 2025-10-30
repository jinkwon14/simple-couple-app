import { ReactNode } from 'react';
import { Modal as RNModal, StyleSheet, View } from 'react-native';

export type ModalProps = {
  visible: boolean;
  children: ReactNode;
  onRequestClose: () => void;
};

export const Modal = ({ visible, children, onRequestClose }: ModalProps) => (
  <RNModal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
    <View style={styles.backdrop}>
      <View style={styles.container}>{children}</View>
    </View>
  </RNModal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
});
