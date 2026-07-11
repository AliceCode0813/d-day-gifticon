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
import { GifticonInput } from '../types/gifticon';
import { toDateOnlyString } from '../utils/dday';
import { recognizeGifticonFromImage } from '../utils/ocr';
import { parseAmountInput } from '../utils/parseGifticonText';

type Props = NativeStackScreenProps<RootStackParamList, 'Add'>;

type Draft = {
  key: string;
  imageUri: string;
  title: string;
  brand: string;
  amountText: string;
  memo: string;
  expiresAt: string;
  recognizing: boolean;
  hint: string;
};

function createDraft(imageUri: string): Draft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    imageUri,
    title: '',
    brand: '',
    amountText: '',
    memo: '',
    expiresAt: toDateOnlyString(new Date()),
    recognizing: false,
    hint: '',
  };
}

export function AddGifticonScreen({ navigation }: Props) {
  const { createGifticons } = useGifticonContext();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);
  const [datePickerKey, setDatePickerKey] = useState<string | null>(null);

  const updateDraft = (key: string, updates: Partial<Draft>) => {
    setDrafts((prev) => prev.map((draft) => (draft.key === key ? { ...draft, ...updates } : draft)));
  };

  const removeDraft = (key: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.key !== key));
    if (datePickerKey === key) {
      setDatePickerKey(null);
    }
  };

  const runAutoRecognize = async (key: string, uri: string) => {
    updateDraft(key, {
      recognizing: true,
      hint: '사진에서 상품명·브랜드·금액·만료일을 읽는 중...',
    });

    try {
      const parsed = await recognizeGifticonFromImage(uri);
      const updates: Partial<Draft> = { recognizing: false };

      if (parsed.title) updates.title = parsed.title;
      if (parsed.brand) updates.brand = parsed.brand;
      if (parsed.amount) updates.amountText = String(parsed.amount);
      if (parsed.expiresAt) updates.expiresAt = parsed.expiresAt;

      if (parsed.title || parsed.brand || parsed.amount || parsed.expiresAt) {
        const ddayText =
          parsed.daysLeft === undefined
            ? ''
            : parsed.daysLeft < 0
              ? ' (만료됨)'
              : parsed.daysLeft === 0
                ? ' (D-Day)'
                : ` (D-${parsed.daysLeft})`;
        updates.hint = `자동 인식 완료${parsed.expiresAt ? ddayText : ''}. 틀리면 직접 수정해 주세요.`;
      } else {
        updates.hint = '글자는 읽었지만 정보를 찾지 못했어요. 직접 입력해 주세요.';
      }

      updateDraft(key, updates);
    } catch (error) {
      const message = error instanceof Error ? error.message : '자동 인식에 실패했어요.';
      updateDraft(key, { recognizing: false, hint: message });
    }
  };

  const appendImages = async (uris: string[]) => {
    if (uris.length === 0) return;

    const created = uris.map((uri) => createDraft(uri));
    setDrafts((prev) => [...prev, ...created]);

    for (const draft of created) {
      await runAutoRecognize(draft.key, draft.imageUri);
    }
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진을 등록하려면 카메라 권한이 필요해요.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await appendImages([result.assets[0].uri]);
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진을 등록하려면 갤러리 권한이 필요해요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: 20,
    });

    if (!result.canceled && result.assets.length > 0) {
      await appendImages(result.assets.map((asset) => asset.uri).filter(Boolean));
    }
  };

  const onDateChange = (key: string, _event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerKey(null);
    }
    if (date) {
      updateDraft(key, { expiresAt: toDateOnlyString(date) });
    }
  };

  const handleSave = async () => {
    if (drafts.length === 0) {
      Alert.alert('입력 확인', '기프티콘 사진을 한 장 이상 등록해 주세요.');
      return;
    }

    for (const draft of drafts) {
      if (!draft.title.trim()) {
        Alert.alert('입력 확인', '모든 기프티콘의 상품명을 입력해 주세요.');
        return;
      }
    }

    if (drafts.some((draft) => draft.recognizing)) {
      Alert.alert('잠시만요', '자동 인식이 끝난 뒤 등록해 주세요.');
      return;
    }

    const inputs: GifticonInput[] = drafts.map((draft) => ({
      title: draft.title.trim(),
      brand: draft.brand.trim() || undefined,
      amount: parseAmountInput(draft.amountText),
      memo: draft.memo.trim() || undefined,
      imageUri: draft.imageUri,
      expiresAt: draft.expiresAt,
    }));

    setSaving(true);
    try {
      await createGifticons(inputs);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const recognizingAny = drafts.some((draft) => draft.recognizing);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>기프티콘 사진</Text>
        <View style={styles.imageActions}>
          <Pressable style={styles.secondaryButton} onPress={pickFromCamera}>
            <Text style={styles.secondaryButtonText}>카메라</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={pickFromLibrary}>
            <Text style={styles.secondaryButtonText}>갤러리 (여러 장)</Text>
          </Pressable>
        </View>
        <Text style={styles.helperText}>
          갤러리에서 여러 장을 한 번에 고르면 각각 자동 인식 후 한꺼번에 등록할 수 있어요.
        </Text>

        {drafts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>아직 선택한 사진이 없어요.</Text>
          </View>
        ) : null}

        {drafts.map((draft, index) => (
          <View key={draft.key} style={styles.draftCard}>
            <View style={styles.draftHeader}>
              <Text style={styles.draftTitle}>
                {drafts.length > 1 ? `${index + 1}번째 기프티콘` : '기프티콘 정보'}
              </Text>
              <Pressable onPress={() => removeDraft(draft.key)}>
                <Text style={styles.removeText}>제거</Text>
              </Pressable>
            </View>

            <Image source={{ uri: draft.imageUri }} style={styles.preview} />

            <View style={styles.recognizeBox}>
              <Pressable
                style={[styles.recognizeButton, draft.recognizing && styles.disabledButton]}
                onPress={() => runAutoRecognize(draft.key, draft.imageUri)}
                disabled={draft.recognizing}
              >
                {draft.recognizing ? (
                  <ActivityIndicator color="#2563EB" />
                ) : (
                  <Text style={styles.recognizeButtonText}>자동 인식</Text>
                )}
              </Pressable>
              {draft.hint ? <Text style={styles.recognizeHint}>{draft.hint}</Text> : null}
            </View>

            <Text style={styles.fieldLabel}>상품명</Text>
            <TextInput
              value={draft.title}
              onChangeText={(title) => updateDraft(draft.key, { title })}
              placeholder="예: 아메리카노 Tall"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>브랜드</Text>
            <TextInput
              value={draft.brand}
              onChangeText={(brand) => updateDraft(draft.key, { brand })}
              placeholder="예: 스타벅스"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>금액 (선택)</Text>
            <TextInput
              value={draft.amountText}
              onChangeText={(amountText) => updateDraft(draft.key, { amountText })}
              placeholder="예: 15000"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>만료일</Text>
            <Pressable style={styles.dateButton} onPress={() => setDatePickerKey(draft.key)}>
              <Text style={styles.dateButtonText}>{draft.expiresAt.replace(/-/g, '.')}</Text>
            </Pressable>
            {datePickerKey === draft.key ? (
              <DateTimePicker
                value={new Date(`${draft.expiresAt}T12:00:00`)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(event, date) => onDateChange(draft.key, event, date)}
              />
            ) : null}

            <Text style={styles.fieldLabel}>메모 (선택)</Text>
            <TextInput
              value={draft.memo}
              onChangeText={(memo) => updateDraft(draft.key, { memo })}
              placeholder="누가 줬는지, 사용처 등"
              placeholderTextColor="#94A3B8"
              style={[styles.input, styles.memoInput]}
              multiline
            />
          </View>
        ))}

        <Pressable
          style={[styles.primaryButton, (saving || recognizingAny) && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving || recognizingAny}
        >
          <Text style={styles.primaryButtonText}>
            {saving
              ? '저장 중...'
              : drafts.length > 1
                ? `${drafts.length}장 등록하기`
                : '등록하기'}
          </Text>
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
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 4,
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
  emptyBox: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
  },
  draftCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  draftTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  removeText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  recognizeBox: {
    marginTop: 10,
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
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
  },
  memoInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#F8FAFC',
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
