export type DDayInfo = {
  daysLeft: number;
  label: string;
  urgency: 'expired' | 'critical' | 'warning' | 'normal';
};

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDDayInfo(expiresAt: string, isUsed: boolean): DDayInfo {
  if (isUsed) {
    return { daysLeft: Infinity, label: '사용 완료', urgency: 'normal' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = parseDateOnly(expiresAt);
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { daysLeft, label: '만료됨', urgency: 'expired' };
  }
  if (daysLeft === 0) {
    return { daysLeft, label: 'D-Day', urgency: 'critical' };
  }
  if (daysLeft <= 3) {
    return { daysLeft, label: `D-${daysLeft}`, urgency: 'critical' };
  }
  if (daysLeft <= 7) {
    return { daysLeft, label: `D-${daysLeft}`, urgency: 'warning' };
  }
  return { daysLeft, label: `D-${daysLeft}`, urgency: 'normal' };
}

export function sortGifticons<T extends { expiresAt: string; isUsed: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.isUsed !== b.isUsed) {
      return a.isUsed ? 1 : -1;
    }

    const aInfo = getDDayInfo(a.expiresAt, a.isUsed);
    const bInfo = getDDayInfo(b.expiresAt, b.isUsed);

    if (aInfo.urgency === 'expired' && bInfo.urgency !== 'expired') return 1;
    if (bInfo.urgency === 'expired' && aInfo.urgency !== 'expired') return -1;

    return aInfo.daysLeft - bInfo.daysLeft;
  });
}

export function formatExpiryDate(expiresAt: string): string {
  const [year, month, day] = expiresAt.split('-');
  return `${year}.${month}.${day}까지`;
}
