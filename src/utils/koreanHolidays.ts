const HOLIDAY_SET = new Set<string>([
  // 2025
  '2025-01-01',
  '2025-01-28',
  '2025-01-29',
  '2025-01-30',
  '2025-03-01',
  '2025-05-05',
  '2025-05-06',
  '2025-06-06',
  '2025-08-15',
  '2025-10-03',
  '2025-10-05',
  '2025-10-06',
  '2025-10-07',
  '2025-10-08',
  '2025-10-09',
  '2025-12-25',
  // 2026
  '2026-01-01',
  '2026-02-16',
  '2026-02-17',
  '2026-02-18',
  '2026-03-01',
  '2026-05-05',
  '2026-05-24',
  '2026-06-06',
  '2026-08-15',
  '2026-09-24',
  '2026-09-25',
  '2026-09-26',
  '2026-10-03',
  '2026-10-09',
  '2026-12-25',
  // 2027
  '2027-01-01',
  '2027-02-06',
  '2027-02-07',
  '2027-02-08',
  '2027-03-01',
  '2027-05-05',
  '2027-05-13',
  '2027-06-06',
  '2027-08-15',
  '2027-09-14',
  '2027-09-15',
  '2027-09-16',
  '2027-10-03',
  '2027-10-09',
  '2027-12-25',
]);

export function isKoreanHoliday(dateString: string): boolean {
  return HOLIDAY_SET.has(dateString);
}

export function getDayTextColor(dateString: string, disabled = false, selected = false): string {
  if (selected) return '#FFFFFF';
  if (disabled) return '#CBD5E1';

  const dayOfWeek = new Date(`${dateString}T12:00:00`).getDay();
  if (dayOfWeek === 0 || isKoreanHoliday(dateString)) return '#DC2626';
  if (dayOfWeek === 6) return '#2563EB';
  return '#0F172A';
}
