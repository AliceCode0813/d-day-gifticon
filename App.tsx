import { StatusBar } from 'expo-status-bar';
import { GifticonProvider } from './src/context/GifticonProvider';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GifticonProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </GifticonProvider>
  );
}
