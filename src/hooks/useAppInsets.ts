import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBottomInset } from '../utils/safeArea';

export type AppInsets = EdgeInsets & {
  bottomInset: number;
};

/** 기기에서 실시간으로 측정된 safe area (회전·내비 변경 시 자동 갱신). */
export function useAppInsets(): AppInsets {
  const insets = useSafeAreaInsets();

  return {
    ...insets,
    bottomInset: getBottomInset(insets),
  };
}
