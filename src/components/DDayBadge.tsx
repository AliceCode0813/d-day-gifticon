import { StyleSheet, Text, View } from 'react-native';
import { DDayInfo } from '../utils/dday';

const COLORS = {
  expired: { bg: '#FEE2E2', text: '#B91C1C' },
  critical: { bg: '#FECACA', text: '#DC2626' },
  warning: { bg: '#FEF3C7', text: '#D97706' },
  normal: { bg: '#DCFCE7', text: '#15803D' },
};

export function DDayBadge({ info }: { info: DDayInfo }) {
  const palette = COLORS[info.urgency];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.text }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
