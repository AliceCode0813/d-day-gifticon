export type MainTabParamList = {
  DDay: undefined;
  Calendar: undefined;
  NotificationSettings: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Add: undefined;
  Detail: { id: string };
  ImageViewer: { imageUri: string; title: string; gifticonId?: string };
};
