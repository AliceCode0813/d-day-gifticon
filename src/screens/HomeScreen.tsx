import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { GifticonCard } from '../components/GifticonCard';
import { useGifticonContext } from '../context/GifticonContext';
import { requestNotificationPermissions } from '../notifications/schedule';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { activeGifticons, loading, query, setQuery, syncNotifications } = useGifticonContext();

  useEffect(() => {
    requestNotificationPermissions().then(() => syncNotifications());
  }, [syncNotifications]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>디데이기프티콘</Text>
          <Text style={styles.title}>만료 임박 순</Text>
        </View>
        <Pressable style={styles.addButton} onPress={() => navigation.navigate('Add')}>
          <Text style={styles.addButtonText}>+ 추가</Text>
        </Pressable>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="브랜드명, 메모 검색"
        placeholderTextColor="#94A3B8"
        style={styles.search}
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#2563EB" />
      ) : (
        <FlatList
          data={activeGifticons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            activeGifticons.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={<EmptyState />}
          renderItem={({ item }) => (
            <GifticonCard
              gifticon={item}
              onPress={() => navigation.navigate('Detail', { id: item.id })}
              onImagePress={() =>
                navigation.navigate('ImageViewer', { imageUri: item.imageUri, title: item.title })
              }
            />
          )}
        />
      )}
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
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  search: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
  },
  loader: {
    marginTop: 40,
  },
});
