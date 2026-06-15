import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ImageViewer'>;

export function ImageViewerScreen({ navigation, route }: Props) {
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
});
