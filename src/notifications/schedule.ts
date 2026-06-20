import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { loadNotificationSettings } from '../storage/notificationSettings';
import { Gifticon } from '../types/gifticon';
import { parseDateOnly } from '../utils/dday';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('expiry-reminders', {
      name: '만료 알림',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function reminderDate(
  expiresAt: string,
  daysBefore: number,
  hour: number,
  minute: number,
): Date {
  const date = parseDateOnly(expiresAt);
  date.setDate(date.getDate() - daysBefore);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function reminderBody(daysBefore: number): string {
  if (daysBefore === 0) return '오늘이 만료일이에요. 잊지 말고 사용하세요!';
  if (daysBefore === 1) return '내일 만료돼요. 미리 확인해 보세요.';
  return `${daysBefore}일 후 만료돼요. 미리 확인해 보세요.`;
}

function offsetLabel(daysBefore: number): string {
  if (daysBefore === 0) return 'D-Day';
  return `D-${daysBefore}`;
}

export async function scheduleGifticonNotifications(gifticon: Gifticon): Promise<void> {
  if (gifticon.isUsed) return;

  const settings = await loadNotificationSettings();
  if (!settings.enabled || settings.offsets.length === 0) return;

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await cancelGifticonNotifications(gifticon.id);

  const now = Date.now();

  for (const offset of settings.offsets) {
    const triggerDate = reminderDate(
      gifticon.expiresAt,
      offset,
      settings.hour,
      settings.minute,
    );
    if (triggerDate.getTime() <= now) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${gifticon.title} ${offsetLabel(offset)}`,
        body: reminderBody(offset),
        data: { gifticonId: gifticon.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
      identifier: `${gifticon.id}-${offset}`,
    });
  }
}

export async function cancelGifticonNotifications(gifticonId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ids = scheduled
    .filter((item) => item.identifier.startsWith(`${gifticonId}-`))
    .map((item) => item.identifier);

  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

export async function rescheduleAllNotifications(gifticons: Gifticon[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Promise.all(gifticons.map((gifticon) => scheduleGifticonNotifications(gifticon)));
}
