import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 52;

/** 기기가 보고한 하단 safe area. 기종·Android 버전·내비 방식마다 값이 달라집니다. */
export function getBottomInset(insets: EdgeInsets): number {
  return insets.bottom;
}
