import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarScreen } from '../screens/CalendarScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { useAppInsets } from '../hooks/useAppInsets';
import { TAB_BAR_HEIGHT } from '../utils/safeArea';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const { bottomInset, ...insets } = useAppInsets();

  return (
    <Tab.Navigator
      safeAreaInsets={{ ...insets, bottom: bottomInset }}
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
          height: TAB_BAR_HEIGHT + bottomInset,
          paddingBottom: bottomInset,
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
