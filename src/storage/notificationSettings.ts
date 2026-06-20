import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  MAX_NOTIFICATION_OFFSET,
  NotificationSettings,
} from '../types/notificationSettings';

const STORAGE_KEY = '@dday-gifticon/notification-settings';

function normalizeOffsets(offsets: number[]): number[] {
  return [...new Set(offsets.filter((value) => value >= 0 && value <= MAX_NOTIFICATION_OFFSET))].sort(
    (a, b) => b - a,
  );
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;

  const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
  return {
    enabled: parsed.enabled ?? DEFAULT_NOTIFICATION_SETTINGS.enabled,
    hour: parsed.hour ?? DEFAULT_NOTIFICATION_SETTINGS.hour,
    minute: parsed.minute ?? DEFAULT_NOTIFICATION_SETTINGS.minute,
    offsets: normalizeOffsets(parsed.offsets ?? DEFAULT_NOTIFICATION_SETTINGS.offsets),
  };
}

export async function saveNotificationSettings(
  settings: NotificationSettings,
): Promise<NotificationSettings> {
  const normalized: NotificationSettings = {
    ...settings,
    offsets: normalizeOffsets(settings.offsets),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}
