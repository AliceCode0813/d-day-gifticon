import { Gifticon } from '../types/gifticon';
import { isExpired } from './dday';

export const ARCHIVE_RETENTION_MS = 3 * 24 * 60 * 60 * 1000;

export function isInactiveGifticon(gifticon: Pick<Gifticon, 'expiresAt' | 'isUsed'>): boolean {
  return gifticon.isUsed || isExpired(gifticon.expiresAt);
}

export function resolveClosedAt(gifticon: Gifticon): string | undefined {
  if (gifticon.closedAt) {
    return gifticon.closedAt;
  }

  if (gifticon.isUsed) {
    return gifticon.createdAt;
  }

  if (isExpired(gifticon.expiresAt)) {
    const closedAt = new Date(`${gifticon.expiresAt}T23:59:59`);
    closedAt.setDate(closedAt.getDate() + 1);
    closedAt.setHours(0, 0, 0, 0);
    return closedAt.toISOString();
  }

  return undefined;
}

export function shouldPurgeGifticon(gifticon: Gifticon, now = Date.now()): boolean {
  if (!isInactiveGifticon(gifticon)) {
    return false;
  }

  const closedAt = resolveClosedAt(gifticon);
  if (!closedAt) {
    return false;
  }

  return now - new Date(closedAt).getTime() >= ARCHIVE_RETENTION_MS;
}

export function normalizeGifticon(gifticon: Gifticon): Gifticon {
  const closedAt = resolveClosedAt(gifticon);
  if (closedAt && closedAt !== gifticon.closedAt) {
    return { ...gifticon, closedAt };
  }
  return gifticon;
}

export function applyGifticonLifecycle(items: Gifticon[]): Gifticon[] {
  const normalized = items.map(normalizeGifticon);
  return normalized.filter((item) => !shouldPurgeGifticon(item));
}
