export type Gifticon = {
  id: string;
  title: string;
  brand?: string;
  amount?: number;
  imageUri: string;
  expiresAt: string;
  memo?: string;
  isUsed: boolean;
  createdAt: string;
  closedAt?: string;
};

export type GifticonInput = {
  title: string;
  brand?: string;
  amount?: number;
  imageUri: string;
  expiresAt: string;
  memo?: string;
};

export type GifticonFilter = 'active' | 'used' | 'expired';

export const GIFTICON_FILTER_OPTIONS: { value: GifticonFilter; label: string }[] = [
  { value: 'active', label: '사용 가능' },
  { value: 'used', label: '사용 완료' },
  { value: 'expired', label: '만료' },
];
