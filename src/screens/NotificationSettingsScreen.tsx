import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationSettings } from '../context/NotificationSettingsContext';
import { MainTabParamList } from '../navigation/types';
import { NOTIFICATION_OFFSET_OPTIONS } from '../types/notificationSettings';

type Props = BottomTabScreenProps<MainTabParamList, 'NotificationSettings'>;

export function NotificationSettingsScreen(_props: Props) {
  const { settings, loading, updateSettings } = useNotificationSettings();
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');

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
});
