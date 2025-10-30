import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from './src/screens/Home';
import { QuestionScreen } from './src/screens/Question';
import { WhiteboardScreen } from './src/screens/Whiteboard';
import { MissionsScreen } from './src/screens/Missions';
import { CollectionScreen } from './src/screens/Collection';
import { SettingsScreen } from './src/screens/Settings';
import { PairingScreen } from './src/screens/Pairing';
import { useAppStore } from './src/state/store';
import { useEffect } from 'react';
import { flushAnalytics } from './src/lib/analytics';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#6C63FF',
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          Home: 'ios-planet',
          Question: 'ios-chatbubbles',
          Whiteboard: 'ios-brush',
          Missions: 'ios-ribbon',
          Collection: 'ios-leaf',
          Settings: 'ios-settings',
        };
        const iconName = icons[route.name] ?? 'ios-heart';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Question" component={QuestionScreen} />
    <Tab.Screen name="Whiteboard" component={WhiteboardScreen} />
    <Tab.Screen name="Missions" component={MissionsScreen} />
    <Tab.Screen name="Collection" component={CollectionScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const Root = () => {
  const profileId = useAppStore((state) => state.profileId);
  const coupleId = useAppStore((state) => state.coupleId);

  useEffect(() => {
    const interval = setInterval(() => {
      flushAnalytics();
    }, 1000 * 60 * 5);
    return () => clearInterval(interval);
  }, []);

  if (!profileId || !coupleId) {
    return <PairingScreen />;
  }

  return <AppTabs />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Root />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
