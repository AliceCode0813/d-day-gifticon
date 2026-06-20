export type DDayInfo = {
  daysLeft: number;
  label: string;
  urgency: 'expired' | 'used' | 'critical' | 'warning' | 'normal';
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

export function isExpired(expiresAt: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = parseDateOnly(expiresAt);
  expiry.setHours(0, 0, 0, 0);
  return expiry.getTime() < today.getTime();
}

export function getDDayInfo(expiresAt: string, isUsed: boolean): DDayInfo {
  if (isUsed) {
    return { daysLeft: Infinity, label: '사용완료', urgency: 'used' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = parseDateOnly(expiresAt);
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { daysLeft, label: '기간지남', urgency: 'expired' };
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
    const aInactive = a.isUsed || isExpired(a.expiresAt);
    const bInactive = b.isUsed || isExpired(b.expiresAt);

    if (aInactive !== bInactive) {
      return aInactive ? 1 : -1;
    }

    if (aInactive) {
      const aInfo = getDDayInfo(a.expiresAt, a.isUsed);
      const bInfo = getDDayInfo(b.expiresAt, b.isUsed);
      if (aInfo.urgency !== bInfo.urgency) {
        if (aInfo.urgency === 'used') return -1;
        if (bInfo.urgency === 'used') return 1;
      }
      return b.expiresAt.localeCompare(a.expiresAt);
    }

    return getDDayInfo(a.expiresAt, a.isUsed).daysLeft - getDDayInfo(b.expiresAt, b.isUsed).daysLeft;
  });
}

export function formatExpiryDate(expiresAt: string): string {
  const [year, month, day] = expiresAt.split('-');
  return `${year}.${month}.${day}까지`;
}
