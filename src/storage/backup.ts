import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Gifticon } from '../types/gifticon';

export const BACKUP_VERSION = 1;

export type GifticonBackupItem = Omit<Gifticon, 'imageUri'> & {
  imageBase64?: string;
  imageUri?: string;
};

export type GifticonBackup = {
  version: number;
  exportedAt: string;
  app: 'dday-gifticon';
  gifticons: GifticonBackupItem[];
};

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getImageDirectory(): string {
  const base = FileSystem.documentDirectory;
  if (!base) {
    throw new Error('?åÏùº ?Ä??Í≤ΩÎ°úÎ•??¨Ïö©?????ÜÏñ¥??');
  }
  return `${base}gifticon-images/`;
}

async function ensureImageDirectory(): Promise<string> {
  const dir = getImageDirectory();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

async function readImageBase64(imageUri: string): Promise<string | undefined> {
  try {
    return await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch {
    return undefined;
  }
}

async function writeImageFromBase64(id: string, base64: string): Promise<string> {
  const dir = await ensureImageDirectory();
  const path = `${dir}${id}.jpg`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return path;
}

export async function buildBackupPayload(gifticons: Gifticon[]): Promise<GifticonBackup> {
  const items: GifticonBackupItem[] = [];

  for (const gifticon of gifticons) {
    const imageBase64 = await readImageBase64(gifticon.imageUri);
    const { imageUri: _imageUri, ...rest } = gifticon;
    items.push({
      ...rest,
      imageBase64,
    });
  }

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'dday-gifticon',
    gifticons: items,
  };
}

export async function exportGifticonBackup(gifticons: Gifticon[]): Promise<void> {
  const payload = await buildBackupPayload(gifticons);
  const base = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!base) {
    throw new Error('Î∞±ÏóÖ ?åÏùº??ÎßåÎì§ ???ÜÏñ¥??');
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const path = `${base}dday-gifticon-backup-${stamp}.json`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(payload), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('??Í∏∞Í∏∞?êÏÑú???åÏùº Í≥µÏú†Î•?ÏßÄ?êÌïòÏßÄ ?äÏïÑ??');
  }

  await Sharing.shareAsync(path, {
    mimeType: 'application/json',
    dialogTitle: 'Í∏∞ÌîÑ?∞ÏΩò Î∞±ÏóÖ ?¥Î≥¥?¥Í∏∞',
    UTI: 'public.json',
  });
}

function isBackupPayload(value: unknown): value is GifticonBackup {
  if (!value || typeof value !== 'object') return false;
  const payload = value as GifticonBackup;
  return payload.app === 'dday-gifticon' && Array.isArray(payload.gifticons);
}

export async function restoreGifticonsFromBackupItems(
  items: GifticonBackupItem[],
): Promise<Gifticon[]> {
  const restored: Gifticon[] = [];

  for (const item of items) {
    const id = item.id || createId();
    let imageUri = item.imageUri;

    if (item.imageBase64) {
      imageUri = await writeImageFromBase64(id, item.imageBase64);
    }

    if (!imageUri) {
      continue;
    }

    restored.push({
      id,
      title: item.title || 'Í∏∞ÌîÑ?∞ÏΩò',
      brand: item.brand,
      amount: item.amount,
      imageUri,
      expiresAt: item.expiresAt,
      memo: item.memo,
      isUsed: Boolean(item.isUsed),
      createdAt: item.createdAt || new Date().toISOString(),
      closedAt: item.closedAt,
    });
  }

  return restored;
}

export async function pickAndParseBackupFile(): Promise<GifticonBackup> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    throw new Error('CANCELLED');
  }

  const raw = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Î∞±ÏóÖ ?åÏùº ?ïÏãù???¨Î∞îÎ•¥Ï? ?äÏïÑ??');
  }

  if (!isBackupPayload(parsed)) {
    throw new Error('?îÎç∞?¥Í∏∞?ÑÌã∞ÏΩ?Î∞±ÏóÖ ?åÏùº???ÑÎãà?êÏöî.');
  }

  return parsed;
}
