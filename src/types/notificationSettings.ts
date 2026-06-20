export type NotificationSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
  offsets: number[];
};

export const NOTIFICATION_OFFSET_OPTIONS = [
  { value: 0, label: '만료 당일' },
  { value: 1, label: '1일 전' },
  { value: 2, label: '2일 전' },
  { value: 3, label: '3일 전' },
  { value: 7, label: '1주일 전' },
] as const;

export const MAX_NOTIFICATION_OFFSET = 7;

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  hour: 9,
  minute: 0,
  offsets: [0, 1, 3, 7],
};
