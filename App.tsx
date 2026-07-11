import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { useAndroidSafeAreaBootstrap } from './src/components/AndroidSafeAreaBootstrap';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { GifticonProvider } from './src/context/GifticonProvider';
import { NotificationSettingsProvider } from './src/context/NotificationSettingsContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function AppRoot() {
  useAndroidSafeAreaBootstrap();

  return (
    <GifticonProvider>
      <NotificationSettingsProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </NotificationSettingsProvider>
    </GifticonProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <AppRoot />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
