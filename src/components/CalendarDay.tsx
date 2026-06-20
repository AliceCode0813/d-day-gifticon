import { Pressable, Text, View } from 'react-native';
import { CalendarDayProps, CalendarDateData } from '../types/calendar';
import { getDayTextColor } from '../utils/koreanHolidays';

function resolveDateString(date: CalendarDayProps['date']): string | undefined {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  return date.dateString;
}

export function CalendarDay({ date, state, marking, onPress }: CalendarDayProps) {
  const dateString = resolveDateString(date);
  if (!dateString) {
    return <View style={{ flex: 1 }} />;
  }

  const dayNumber = dateString.split('-')[2];
  const disabled = state === 'disabled' || state === 'inactive';
  const selected = Boolean(marking?.selected);
  const today = state === 'today';
  const textColor = getDayTextColor(dateString, disabled, selected);

  const dateData: CalendarDateData =
    typeof date === 'object' && date
      ? date
      : {
          dateString,
          day: Number(dayNumber),
          month: Number(dateString.split('-')[1]),
          year: Number(dateString.split('-')[0]),
          timestamp: new Date(`${dateString}T12:00:00`).getTime(),
        };

  return (
    <Pressable
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }}
      onPress={() => onPress?.(dateData)}
      disabled={disabled}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected ? '#2563EB' : marking?.marked ? '#EFF6FF' : 'transparent',
          borderWidth: marking?.marked && !selected ? 1.5 : 0,
          borderColor: marking?.dotColor ?? '#2563EB',
        }}
      >
        <Text
          style={{
            color: textColor,
            fontWeight: today ? '800' : '500',
            fontSize: 15,
          }}
        >
          {Number(dayNumber)}
        </Text>
      </View>
      {marking?.marked ? (
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 3.5,
            marginTop: 2,
            backgroundColor: marking.dotColor ?? '#2563EB',
          }}
        />
      ) : null}
    </Pressable>
  );
}
