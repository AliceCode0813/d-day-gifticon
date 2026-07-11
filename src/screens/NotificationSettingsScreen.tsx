import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGifticonContext } from '../context/GifticonContext';
import { useNotificationSettings } from '../context/NotificationSettingsContext';
import { MainTabParamList } from '../navigation/types';
import {
  exportGifticonBackup,
  pickAndParseBackupFile,
  restoreGifticonsFromBackupItems,
} from '../storage/backup';
import { NOTIFICATION_OFFSET_OPTIONS } from '../types/notificationSettings';

type Props = BottomTabScreenProps<MainTabParamList, 'NotificationSettings'>;

export function NotificationSettingsScreen(_props: Props) {
  const { settings, loading, updateSettings } = useNotificationSettings();
  const { gifticons, replaceGifticons, mergeGifticons } = useGifticonContext();
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');
  const [backupBusy, setBackupBusy] = useState(false);

  if (loading || !settings) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ActivityIndicator style={styles.loader} color="#2563EB" />
      </SafeAreaView>
    );
  }

  const timeValue = new Date();
  timeValue.setHours(settings.hour, settings.minute, 0, 0);

  const onTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (!date) return;

    updateSettings({
      ...settings,
      hour: date.getHours(),
      minute: date.getMinutes(),
    });
  };

  const toggleOffset = (offset: number) => {
    const exists = settings.offsets.includes(offset);
    const offsets = exists
      ? settings.offsets.filter((value) => value !== offset)
      : [...settings.offsets, offset];

    updateSettings({ ...settings, offsets });
  };

  const handleExport = async () => {
    if (gifticons.length === 0) {
      Alert.alert('백업', '내보낼 기프티콘이 없어요.');
      return;
    }

    setBackupBusy(true);
    try {
      await exportGifticonBackup(gifticons);
    } catch (error) {
      const message = error instanceof Error ? error.message : '백업에 실패했어요.';
      Alert.alert('백업 실패', message);
    } finally {
      setBackupBusy(false);
    }
  };

  const applyImport = async (mode: 'merge' | 'replace') => {
    setBackupBusy(true);
    try {
      const backup = await pickAndParseBackupFile();
      const restored = await restoreGifticonsFromBackupItems(backup.gifticons);

      if (restored.length === 0) {
        Alert.alert('복원', '복원할 수 있는 기프티콘이 없어요.');
        return;
      }

      if (mode === 'replace') {
        await replaceGifticons(restored);
      } else {
        await mergeGifticons(restored);
      }

      Alert.alert('복원 완료', `${restored.length}개를 ${mode === 'replace' ? '덮어썼' : '추가했'}어요.`);
    } catch (error) {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return;
      }
      const message = error instanceof Error ? error.message : '복원에 실패했어요.';
      Alert.alert('복원 실패', message);
    } finally {
      setBackupBusy(false);
    }
  };

  const handleImport = () => {
    Alert.alert('백업 가져오기', '기존 데이터는 어떻게 할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '추가', onPress: () => applyImport('merge') },
      {
        text: '덮어쓰기',
        style: 'destructive',
        onPress: () =>
          Alert.alert('덮어쓰기', '지금 저장된 기프티콘이 모두 백업 내용으로 바뀌어요.', [
            { text: '취소', style: 'cancel' },
            { text: '덮어쓰기', style: 'destructive', onPress: () => applyImport('replace') },
          ]),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>알림 설정</Text>
        <Text style={styles.subtitle}>달력 앱처럼 알림 시점과 시간을 고를 수 있어요.</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>알림 사용</Text>
              <Text style={styles.rowDesc}>끄면 모든 만료 알림이 해제돼요.</Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(enabled) => updateSettings({ ...settings, enabled })}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>알림 시간</Text>
        <View style={styles.card}>
          {Platform.OS === 'android' && (
            <Pressable style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.timeButtonText}>
                {String(settings.hour).padStart(2, '0')}:
                {String(settings.minute).padStart(2, '0')}
              </Text>
            </Pressable>
          )}
          {showTimePicker ? (
            <DateTimePicker value={timeValue} mode="time" display="spinner" onChange={onTimeChange} />
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>알림 시점</Text>
        <View style={styles.card}>
          {NOTIFICATION_OFFSET_OPTIONS.map((option) => {
            const selected = settings.offsets.includes(option.value);
            return (
              <Pressable
                key={option.value}
                style={styles.optionRow}
                onPress={() => toggleOffset(option.value)}
                disabled={!settings.enabled}
              >
                <Text style={[styles.optionLabel, !settings.enabled && styles.disabledText]}>
                  {option.label}
                </Text>
                <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
                  {selected ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.footerNote}>
          1주일 전까지 선택할 수 있어요. 선택한 시점마다 위에서 정한 시간에 알림이 울려요.
        </Text>

        <Text style={styles.sectionLabel}>데이터 백업</Text>
        <View style={styles.card}>
          <View style={styles.backupBlock}>
            <Text style={styles.rowTitle}>사진 포함 JSON 백업</Text>
            <Text style={styles.rowDesc}>
              기종 변경·앱 재설치 전에 내보내 두세요. 현재 {gifticons.length}개 저장됨.
            </Text>
            <View style={styles.backupActions}>
              <Pressable
                style={[styles.backupButton, backupBusy && styles.disabledButton]}
                onPress={handleExport}
                disabled={backupBusy}
              >
                {backupBusy ? (
                  <ActivityIndicator color="#1D4ED8" />
                ) : (
                  <Text style={styles.backupButtonText}>내보내기</Text>
                )}
              </Pressable>
              <Pressable
                style={[styles.backupButtonSecondary, backupBusy && styles.disabledButton]}
                onPress={handleImport}
                disabled={backupBusy}
              >
                <Text style={styles.backupButtonSecondaryText}>가져오기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  rowText: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  timeButton: {
    padding: 16,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563EB',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  optionLabel: {
    fontSize: 16,
    color: '#0F172A',
  },
  disabledText: {
    color: '#94A3B8',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  backupBlock: {
    padding: 14,
    gap: 8,
  },
  backupActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  backupButton: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  backupButtonText: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  backupButtonSecondary: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  backupButtonSecondaryText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
