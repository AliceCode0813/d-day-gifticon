import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { GifticonProvider } from './src/context/GifticonProvider';
import { NotificationSettingsProvider } from './src/context/NotificationSettingsContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GifticonProvider>
          <NotificationSettingsProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </NotificationSettingsProvider>
        </GifticonProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
