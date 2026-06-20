import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarScreen } from '../screens/CalendarScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TAB_BAR_HEIGHT = 52;

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarIcon: (): null => null,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarStyle: {
          borderTopColor: '#E2E8F0',
          backgroundColor: '#FFFFFF',
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="DDay"
        component={HomeScreen}
        options={{
          title: 'D-Day',
          tabBarLabel: 'D-Day',
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: '달력',
          tabBarLabel: '달력',
        }}
      />
      <Tab.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          title: '알림',
          tabBarLabel: '알림',
        }}
      />
    </Tab.Navigator>
  );
}
