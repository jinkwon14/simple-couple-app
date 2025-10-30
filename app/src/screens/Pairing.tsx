import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { useAppStore } from '../state/store';
import { track } from '../lib/analytics';

export const PairingScreen = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const setProfile = useAppStore((state) => state.setProfile);
  const setCouple = useAppStore((state) => state.setCouple);
  const profileId = useAppStore((state) => state.profileId);
  const coupleId = useAppStore((state) => state.coupleId);

  if (profileId && coupleId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You are paired!</Text>
        <Text style={styles.body}>Open the tabs below to start your day together.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to LoveGarden</Text>
      <Text style={styles.body}>Choose a display name and invite your partner with a couple code.</Text>
      <TextInput placeholder="Display name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Couple code" value={code} onChangeText={setCode} style={styles.input} />
      <Button
        title="Pair up"
        onPress={() => {
          if (!name || !code) {
            Alert.alert('Missing details', 'Add your name and couple code.');
            return;
          }
          setProfile(name.toLowerCase(), 'Asia/Seoul');
          setCouple(code.toLowerCase());
          track('pair_complete', { code });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFEFF',
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  body: {
    fontSize: 16,
    color: '#1E293B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
});
