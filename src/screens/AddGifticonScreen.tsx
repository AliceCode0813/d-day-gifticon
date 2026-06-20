import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGifticonContext } from '../context/GifticonContext';
import { RootStackParamList } from '../navigation/types';
import { toDateOnlyString } from '../utils/dday';
import { recognizeGifticonFromImage } from '../utils/ocr';

type Props = NativeStackScreenProps<RootStackParamList, 'Add'>;

export function AddGifticonScreen({ navigation }: Props) {
  const { createGifticon } = useGifticonContext();
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState(toDateOnlyString(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [saving, setSaving] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [recognizeHint, setRecognizeHint] = useState('');

  const runAutoRecognize = async (uri: string) => {
    setRecognizing(true);
    setRecognizeHint('사진에서 상품명과 만료일을 읽는 중...');
    try {
      const parsed = await recognizeGifticonFromImage(uri);

      if (parsed.title) setTitle(parsed.title);
      if (parsed.expiresAt) setExpiresAt(parsed.expiresAt);

      if (parsed.title || parsed.expiresAt) {
        const ddayText =
          parsed.daysLeft === undefined
            ? ''
            : parsed.daysLeft < 0
              ? ' (만료됨)'
              : parsed.daysLeft === 0
                ? ' (D-Day)'
                : ` (D-${parsed.daysLeft})`;
        setRecognizeHint(
          `자동 인식 완료${parsed.expiresAt ? ddayText : ''}. 틀리면 직접 수정해 주세요.`,
        );
      } else {
        setRecognizeHint('글자는 읽었지만 상품명/만료일을 찾지 못했어요. 직접 입력해 주세요.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '자동 인식에 실패했어요.';
      setRecognizeHint(message);
      Alert.alert('자동 인식 실패', `${message}\n직접 입력해 주세요.`);
    } finally {
      setRecognizing(false);
    }
  };

  const pickImage = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('권한 필요', '사진을 등록하려면 카메라/갤러리 권한이 필요해요.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.85,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.85,
          });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
      setRecognizeHint('사진을 선택했어요. 자동 인식을 누르거나 직접 입력해 주세요.');
    }
  };

  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setExpiresAt(toDateOnlyString(date));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('입력 확인', '상품명을 입력해 주세요.');
      return;
    }
    if (!imageUri) {
      Alert.alert('입력 확인', '기프티콘 사진을 등록해 주세요.');
      return;
    }

    setSaving(true);
    try {
      await createGifticon({
        title: title.trim(),
        memo: memo.trim() || undefined,
        imageUri,
        expiresAt,
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>기프티콘 사진</Text>
        <View style={styles.imageActions}>
          <Pressable style={styles.secondaryButton} onPress={() => pickImage('camera')}>
            <Text style={styles.secondaryButtonText}>카메라</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => pickImage('library')}>
            <Text style={styles.secondaryButtonText}>갤러리</Text>
          </Pressable>
        </View>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}

        {imageUri ? (
          <View style={styles.recognizeBox}>
            <Pressable
              style={[styles.recognizeButton, recognizing && styles.disabledButton]}
              onPress={() => runAutoRecognize(imageUri)}
              disabled={recognizing}
            >
              {recognizing ? (
                <ActivityIndicator color="#2563EB" />
              ) : (
                <Text style={styles.recognizeButtonText}>자동 인식</Text>
              )}
            </Pressable>
            {recognizeHint ? <Text style={styles.recognizeHint}>{recognizeHint}</Text> : null}
            <Text style={styles.recognizeNote}>
              사진의 글자를 읽어 상품명과 만료일을 채워요. 인식률은 사진 선명도에 따라 달라요.
            </Text>
          </View>
        ) : null}

        <Text style={styles.label}>상품명</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="예: 스타벅스 아메리카노"
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />

        <Text style={styles.label}>만료일</Text>
        {Platform.OS === 'android' && (
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{expiresAt.replace(/-/g, '.')}</Text>
          </Pressable>
        )}
        {showDatePicker ? (
          <DateTimePicker
            value={new Date(`${expiresAt}T12:00:00`)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={onDateChange}
          />
        ) : null}

        <Text style={styles.label}>메모 (선택)</Text>
        <TextInput
          value={memo}
          onChangeText={setMemo}
          placeholder="누가 줬는지, 사용처 등"
          placeholderTextColor="#94A3B8"
          style={[styles.input, styles.memoInput]}
          multiline
        />

        <Pressable
          style={[styles.primaryButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving || recognizing}
        >
          <Text style={styles.primaryButtonText}>{saving ? '저장 중...' : '등록하기'}</Text>
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
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginTop: 8,
  },
  recognizeBox: {
    marginTop: 8,
    gap: 8,
  },
  recognizeButton: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  recognizeButtonText: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  recognizeHint: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
  recognizeNote: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
  },
  memoInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateButtonText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
