import * as ImageManipulator from 'expo-image-manipulator';
import { parseGifticonFromText, ParsedGifticon } from './parseGifticonText';

const OCR_API_URL = 'https://api.ocr.space/parse/image';
const OCR_API_KEY = process.env.EXPO_PUBLIC_OCR_API_KEY ?? 'helloworld';

async function prepareImageBase64(imageUri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1400 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true },
  );

  if (!manipulated.base64) {
    throw new Error('이미지를 읽지 못했어요.');
  }

  return manipulated.base64;
}

async function requestOcrText(base64: string): Promise<string> {
  const formData = new FormData();
  formData.append('base64Image', `data:image/jpeg;base64,${base64}`);
  formData.append('language', 'kor');
  formData.append('isOverlayRequired', 'false');
  formData.append('OCREngine', '2');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');

  const response = await fetch(OCR_API_URL, {
    method: 'POST',
    headers: {
      apikey: OCR_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('OCR 서버 연결에 실패했어요.');
  }

  const payload = (await response.json()) as {
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string | string[];
    ParsedResults?: { ParsedText?: string }[];
  };

  if (payload.IsErroredOnProcessing) {
    const message = Array.isArray(payload.ErrorMessage)
      ? payload.ErrorMessage.join(', ')
      : payload.ErrorMessage;
    throw new Error(message || 'OCR 처리 중 오류가 발생했어요.');
  }

  const text = payload.ParsedResults?.map((item) => item.ParsedText ?? '').join('\n').trim();
  if (!text) {
    throw new Error('사진에서 글자를 찾지 못했어요. 더 선명한 사진으로 다시 시도해 주세요.');
  }

  return text;
}

export async function recognizeGifticonFromImage(imageUri: string): Promise<ParsedGifticon> {
  const base64 = await prepareImageBase64(imageUri);
  const text = await requestOcrText(base64);
  return parseGifticonFromText(text);
}
