import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gifticon } from '../types/gifticon';
import { formatExpiryDate, getDDayInfo, isExpired } from '../utils/dday';
import { formatAmount } from '../utils/parseGifticonText';
import { DDayBadge } from './DDayBadge';

type Props = {
  gifticon: Gifticon;
  onPress: () => void;
  onImagePress: () => void;
};

export function GifticonCard({ gifticon, onPress, onImagePress }: Props) {
  const dday = getDDayInfo(gifticon.expiresAt, gifticon.isUsed);
  const inactive = gifticon.isUsed || isExpired(gifticon.expiresAt);
  const amountText = formatAmount(gifticon.amount);

  return (
    <Pressable style={[styles.card, inactive && styles.cardInactive]} onPress={onPress}>
      <Pressable onPress={onImagePress}>
        <Image source={{ uri: gifticon.imageUri }} style={styles.thumbnail} />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {gifticon.title}
          </Text>
          <DDayBadge info={dday} />
        </View>
        {gifticon.brand ? (
          <Text style={styles.brand} numberOfLines={1}>
            {gifticon.brand}
            {amountText ? ` · ${amountText}` : ''}
          </Text>
        ) : amountText ? (
          <Text style={styles.brand} numberOfLines={1}>
            {amountText}
          </Text>
        ) : null}
        <Text style={styles.expiry}>{formatExpiryDate(gifticon.expiresAt)}</Text>
        {gifticon.memo ? (
          <Text style={styles.memo} numberOfLines={1}>
            {gifticon.memo}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardInactive: {
    opacity: 0.72,
    backgroundColor: '#F8FAFC',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  brand: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  expiry: {
    fontSize: 13,
    color: '#64748B',
  },
  memo: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
