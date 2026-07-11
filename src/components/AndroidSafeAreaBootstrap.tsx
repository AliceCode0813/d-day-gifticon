import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

type BootstrapState = {
  ready: boolean;
  position: 'relative' | 'absolute' | 'unknown';
};

/**
 * Android 네비게이션 바를 relative 모드로 맞춰 기기별 하단 inset이 측정되게 합니다.
 * SafeAreaProvider가 이후 onInsetsChange로 기종별 값을 자동 반영합니다.
 */
export function useAndroidSafeAreaBootstrap(): BootstrapState {
  const [state, setState] = useState<BootstrapState>({
    ready: Platform.OS !== 'android',
    position: Platform.OS === 'android' ? 'unknown' : 'relative',
  });

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let cancelled = false;

    async function configureNavigationBar() {
      try {
        await NavigationBar.setPositionAsync('relative');
        await NavigationBar.setBackgroundColorAsync('#FFFFFF');
        await NavigationBar.setButtonStyleAsync('dark');

        const position = await NavigationBar.unstable_getPositionAsync().catch(
          () => 'relative' as const,
        );

        if (!cancelled) {
          setState({ ready: true, position });
        }
      } catch {
        if (!cancelled) {
          setState({ ready: true, position: 'unknown' });
        }
      }
    }

    configureNavigationBar();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
