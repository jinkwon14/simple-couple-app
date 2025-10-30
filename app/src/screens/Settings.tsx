import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PremiumGate } from '../components/PremiumGate';
import { configureNotifications } from '../services/notifications';
import { useAppStore } from '../state/store';

export const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const coupleId = useAppStore((state) => state.coupleId);
  const tz = useAppStore((state) => state.tz);

  const toggleNotifications = async () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    if (next) {
      const token = await configureNotifications();
      Alert.alert('Push ready', token ? 'Token saved for push delivery.' : 'Unable to fetch token.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.row}>
          <View>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.caption}>Daily prompts & mission reminders</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
        </View>
      </Card>
      <Card>
        <Text style={styles.title}>Pairing info</Text>
        <Text style={styles.caption}>Couple ID: {coupleId ?? 'Not paired yet'}</Text>
        <Text style={styles.caption}>Default time zone: {tz}</Text>
        <Button title="Copy invite code" onPress={() => Alert.alert('Invite', 'Share your code securely.')} />
      </Card>
      <Card>
        <Text style={styles.title}>Privacy</Text>
        <Button title="View policy" variant="secondary" onPress={() => Linking.openURL('https://example.com/privacy')} />
      </Card>
      <Card>
        <Text style={styles.title}>Danger zone</Text>
        <Button
          title="Delete my data"
          variant="secondary"
          onPress={() => Alert.alert('Delete data', 'Contact support@lovegarden.app to remove all data.')}
        />
      </Card>
      <PremiumGate feature="Premium rituals">
        <Text style={styles.caption}>Enjoy advanced missions and exclusive question packs.</Text>
      </PremiumGate>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  caption: {
    fontSize: 14,
    color: '#475569',
    marginTop: 6,
  },
});
