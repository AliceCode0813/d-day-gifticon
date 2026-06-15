import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DDayBadge } from '../components/DDayBadge';
import { useGifticonContext } from '../context/GifticonContext';
import { RootStackParamList } from '../navigation/types';
import { formatExpiryDate, getDDayInfo } from '../utils/dday';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export function DetailScreen({ navigation, route }: Props) {
  const { gifticons, markAsUsed, removeGifticon } = useGifticonContext();
  const gifticon = gifticons.find((item) => item.id === route.params.id);

  if (!gifticon) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.missing}>기프티콘을 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  const dday = getDDayInfo(gifticon.expiresAt, gifticon.isUsed);

  const confirmDelete = () => {
    Alert.alert('삭제', '이 기프티콘을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await removeGifticon(gifticon.id);
          navigation.popToTop();
        },
      },
    ]);
  };

  const confirmUsed = () => {
    Alert.alert('사용 완료', '사용 완료로 표시할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '완료',
        onPress: async () => {
          await markAsUsed(gifticon.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={() =>
            navigation.navigate('ImageViewer', {
              imageUri: gifticon.imageUri,
              title: gifticon.title,
            })
          }
        >
          <Image source={{ uri: gifticon.imageUri }} style={styles.image} />
          <Text style={styles.imageHint}>탭하면 크게 볼 수 있어요</Text>
        </Pressable>

        <View style={styles.meta}>
          <Text style={styles.title}>{gifticon.title}</Text>
          <DDayBadge info={dday} />
        </View>
        <Text style={styles.expiry}>{formatExpiryDate(gifticon.expiresAt)}</Text>
        {gifticon.memo ? <Text style={styles.memo}>{gifticon.memo}</Text> : null}

        {!gifticon.isUsed ? (
          <Pressable style={styles.primaryButton} onPress={confirmUsed}>
            <Text style={styles.primaryButtonText}>사용 완료</Text>
          </Pressable>
        ) : (
          <View style={styles.usedBox}>
            <Text style={styles.usedText}>이미 사용 완료된 기프티콘이에요.</Text>
          </View>
        )}

        <Pressable style={styles.dangerButton} onPress={confirmDelete}>
          <Text style={styles.dangerButtonText}>삭제</Text>
        </Pressable>
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
  missing: {
    padding: 20,
    color: '#64748B',
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  imageHint: {
    marginTop: 8,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 13,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  expiry: {
    fontSize: 15,
    color: '#64748B',
  },
  memo: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  usedBox: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
  },
  usedText: {
    color: '#475569',
    textAlign: 'center',
  },
  dangerButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerButtonText: {
    color: '#DC2626',
    fontWeight: '700',
  },
});
