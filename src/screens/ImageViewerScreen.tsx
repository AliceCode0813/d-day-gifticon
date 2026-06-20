import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGifticonContext } from '../context/GifticonContext';
import { RootStackParamList } from '../navigation/types';
import { isExpired } from '../utils/dday';

type Props = NativeStackScreenProps<RootStackParamList, 'ImageViewer'>;

export function ImageViewerScreen({ navigation, route }: Props) {
  const { gifticons, markAsUsed } = useGifticonContext();
  const gifticon = route.params.gifticonId
    ? gifticons.find((item) => item.id === route.params.gifticonId)
    : undefined;

  const canMarkUsed = Boolean(gifticon && !gifticon.isUsed && !isExpired(gifticon.expiresAt));

  const confirmUsed = () => {
    if (!gifticon) return;

    Alert.alert('사용 완료', '이 기프티콘을 사용 완료로 표시할까요?', [
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Text style={styles.title} numberOfLines={1}>
            {route.params.title}
          </Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.close}>닫기</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <Image source={{ uri: route.params.imageUri }} style={styles.image} resizeMode="contain" />

      {canMarkUsed ? (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Pressable style={styles.useButton} onPress={confirmUsed}>
            <Text style={styles.useButtonText}>사용 완료</Text>
          </Pressable>
        </SafeAreaView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  safeArea: {
    backgroundColor: '#020617',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 12,
  },
  close: {
    color: '#93C5FD',
    fontWeight: '700',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#020617',
  },
  useButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
