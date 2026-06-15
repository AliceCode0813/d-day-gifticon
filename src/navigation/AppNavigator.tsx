import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AddGifticonScreen } from '../screens/AddGifticonScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ImageViewerScreen } from '../screens/ImageViewerScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Add"
          component={AddGifticonScreen}
          options={{ title: '기프티콘 추가' }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: '상세 보기' }}
        />
        <Stack.Screen
          name="ImageViewer"
          component={ImageViewerScreen}
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
