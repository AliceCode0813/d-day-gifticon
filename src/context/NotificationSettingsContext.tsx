import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  loadNotificationSettings,
  saveNotificationSettings,
} from '../storage/notificationSettings';
import { rescheduleAllNotifications } from '../notifications/schedule';
import { NotificationSettings } from '../types/notificationSettings';
import { useGifticonContext } from './GifticonContext';

type NotificationSettingsContextValue = {
  settings: NotificationSettings | null;
  loading: boolean;
  updateSettings: (next: NotificationSettings) => Promise<void>;
  toggleOffset: (offset: number) => Promise<void>;
};

const NotificationSettingsContext = createContext<NotificationSettingsContextValue | null>(null);

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
  const { activeGifticons } = useGifticonContext();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotificationSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(
    async (next: NotificationSettings) => {
      const saved = await saveNotificationSettings(next);
      setSettings(saved);
      await rescheduleAllNotifications(activeGifticons);
    },
    [activeGifticons],
  );

  const toggleOffset = useCallback(
    async (offset: number) => {
      if (!settings) return;

      const exists = settings.offsets.includes(offset);
      const offsets = exists
        ? settings.offsets.filter((value) => value !== offset)
        : [...settings.offsets, offset];

      await updateSettings({ ...settings, offsets });
    },
    [settings, updateSettings],
  );

  return (
    <NotificationSettingsContext.Provider
      value={{ settings, loading, updateSettings, toggleOffset }}
    >
      {children}
    </NotificationSettingsContext.Provider>
  );
}

export function useNotificationSettings() {
  const context = useContext(NotificationSettingsContext);
  if (!context) {
    throw new Error('useNotificationSettings must be used within NotificationSettingsProvider');
  }
  return context;
}
