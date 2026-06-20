export type Gifticon = {
  id: string;
  title: string;
  imageUri: string;
  expiresAt: string;
  memo?: string;
  isUsed: boolean;
  createdAt: string;
  closedAt?: string;
};

export type GifticonInput = {
  title: string;
  imageUri: string;
  expiresAt: string;
  memo?: string;
};
