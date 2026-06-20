import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDay } from '../components/CalendarDay';
import { GifticonCard } from '../components/GifticonCard';
import { useGifticonContext } from '../context/GifticonContext';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { CalendarDateData, MarkedDates } from '../types/calendar';
import { getDDayInfo, isExpired } from '../utils/dday';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Calendar'>,
  NativeStackScreenProps<RootStackParamList>
>;

const calendarTheme = {
  todayTextColor: '#2563EB',
  arrowColor: '#2563EB',
  selectedDayBackgroundColor: '#2563EB',
  textDayFontWeight: '500' as const,
  textMonthFontWeight: '700' as const,
  'stylesheet.calendar.header': {
    dayTextAtIndex0: {
      color: '#DC2626',
    },
    dayTextAtIndex6: {
      color: '#2563EB',
    },
  },
} as const;

const urgencyRank = {
  critical: 3,
  warning: 2,
  normal: 1,
  used: 0,
  expired: 0,
} as const;

function dotColorForUrgency(urgency: ReturnType<typeof getDDayInfo>['urgency']): string {
  if (urgency === 'critical' || urgency === 'expired') return '#DC2626';
  if (urgency === 'warning') return '#D97706';
  return '#16A34A';
}

export function CalendarScreen({ navigation }: Props) {
  const { gifticons } = useGifticonContext();
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const remainingGifticons = useMemo(
    () => gifticons.filter((item) => !item.isUsed && !isExpired(item.expiresAt)),
    [gifticons],
  );

  const markedDates = useMemo((): MarkedDates => {
    const marks: MarkedDates = {};
    const urgencyByDate: Record<string, ReturnType<typeof getDDayInfo>['urgency']> = {};

    for (const gifticon of remainingGifticons) {
      const urgency = getDDayInfo(gifticon.expiresAt, gifticon.isUsed).urgency;
      const current = urgencyByDate[gifticon.expiresAt];
      if (!current || urgencyRank[urgency] > urgencyRank[current]) {
        urgencyByDate[gifticon.expiresAt] = urgency;
      }
    }

    for (const [date, urgency] of Object.entries(urgencyByDate)) {
      marks[date] = {
        marked: true,
        dotColor: dotColorForUrgency(urgency),
      };
    }

    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#2563EB',
      };
    }

    return marks;
  }, [remainingGifticons, selectedDate]);

  const onDayPress = (day: CalendarDateData) => {
    setSelectedDate((current) => (current === day.dateString ? null : day.dateString));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>디데이기프티콘</Text>
        <Text style={styles.title}>만료 달력</Text>
        <Text style={styles.subtitle}>
          만료일이 있는 날짜에 색 점이 표시돼요. 아래에는 남은 기프티콘 전체가 보여요.
        </Text>
      </View>

      <Calendar
        current={selectedDate ?? today}
        onDayPress={onDayPress}
        markedDates={markedDates}
        dayComponent={CalendarDay}
        theme={calendarTheme}
        style={styles.calendar}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
          <Text style={styles.legendText}>임박</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
          <Text style={styles.legendText}>7일 이내</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
          <Text style={styles.legendText}>여유</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>남은 기프티콘 전체</Text>
        <Text style={styles.listCount}>{remainingGifticons.length}개</Text>
      </View>

      <FlatList
        data={remainingGifticons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>등록된 기프티콘이 없어요.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <GifticonCard
            gifticon={item}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
            onImagePress={() =>
              navigation.navigate('ImageViewer', {
                imageUri: item.imageUri,
                title: item.title,
                gifticonId: item.id,
              })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  kicker: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 18,
  },
  calendar: {
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  listCount: {
    fontSize: 14,
    color: '#64748B',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  emptyBox: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
});
