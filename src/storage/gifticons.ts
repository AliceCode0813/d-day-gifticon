import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gifticon, GifticonInput } from '../types/gifticon';

const STORAGE_KEY = '@dday-gifticon/items';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function loadGifticons(): Promise<Gifticon[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Gifticon[];
}

async function saveGifticons(items: Gifticon[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function addGifticon(input: GifticonInput): Promise<Gifticon> {
  const items = await loadGifticons();
  const gifticon: Gifticon = {
    id: createId(),
    ...input,
    isUsed: false,
    createdAt: new Date().toISOString(),
  };
  items.push(gifticon);
  await saveGifticons(items);
  return gifticon;
}

export async function updateGifticon(
  id: string,
  updates: Partial<Omit<Gifticon, 'id' | 'createdAt'>>,
): Promise<Gifticon | null> {
  const items = await loadGifticons();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  items[index] = { ...items[index], ...updates };
  await saveGifticons(items);
  return items[index];
}

export async function deleteGifticon(id: string): Promise<void> {
  const items = await loadGifticons();
  await saveGifticons(items.filter((item) => item.id !== id));
}
