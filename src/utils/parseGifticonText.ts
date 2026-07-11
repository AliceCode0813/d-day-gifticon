export type ParsedGifticon = {
  title?: string;
  brand?: string;
  amount?: number;
  expiresAt?: string;
  daysLeft?: number;
  rawHints: string[];
};

const BRAND_PATTERNS: { pattern: RegExp; name: string }[] = [
  { pattern: /스타벅스|STARBUCKS/i, name: '스타벅스' },
  { pattern: /투썸|TWO\s*SOME/i, name: '투썸플레이스' },
  { pattern: /이디야|EDIYA/i, name: '이디야' },
  { pattern: /메가\s*MGC|MEGA/i, name: '메가MGC커피' },
  { pattern: /컴포즈|COMPOSE/i, name: '컴포즈커피' },
  { pattern: /GS25|GS\s*25/i, name: 'GS25' },
  { pattern: /\bCU\b/i, name: 'CU' },
  { pattern: /세븐일레븐|7[\-_]?ELEVEN/i, name: '세븐일레븐' },
  { pattern: /이마트|EMART/i, name: '이마트' },
  { pattern: /배스킨|BASKIN/i, name: '배스킨라빈스' },
  { pattern: /던킨|DUNKIN/i, name: '던킨' },
  { pattern: /파리바게뜨|PARIS/i, name: '파리바게뜨' },
  { pattern: /교촌/i, name: '교촌치킨' },
  { pattern: /BHC/i, name: 'BHC' },
  { pattern: /네네/i, name: '네네치킨' },
  { pattern: /BBQ/i, name: 'BBQ' },
  { pattern: /맥도날드|MCDONALD/i, name: '맥도날드' },
  { pattern: /버거킹|BURGER KING/i, name: '버거킹' },
  { pattern: /KFC/i, name: 'KFC' },
  { pattern: /CGV/i, name: 'CGV' },
  { pattern: /롯데\s*시네마/i, name: '롯데시네마' },
  { pattern: /메가박스/i, name: '메가박스' },
  { pattern: /올리브\s*영/i, name: '올리브영' },
  { pattern: /다이소/i, name: '다이소' },
  { pattern: /쿠팡/i, name: '쿠팡' },
  { pattern: /네이버/i, name: '네이버' },
  { pattern: /카카오/i, name: '카카오' },
  { pattern: /설빙/i, name: '설빙' },
  { pattern: /공차|GONG\s*CHA/i, name: '공차' },
  { pattern: /할리스|HOLLYS/i, name: '할리스' },
  { pattern: /폴\s*바셋|PAUL\s*BASSETT/i, name: '폴바셋' },
  { pattern: /뚜레쥬르|TOUS\s*LES\s*JOURS/i, name: '뚜레쥬르' },
  { pattern: /신세계/i, name: '신세계' },
  { pattern: /현대백화점/i, name: '현대백화점' },
  { pattern: /롯데백화점/i, name: '롯데백화점' },
];

const PRODUCT_KEYWORDS =
  /아메리카노|라떼|교환권|상품권|기프티콘|쿠폰|세트|아이스크림|치킨|버거|영화|관람권|모바일|금액권|1\+1|할인/i;

const EXPIRY_KEYWORDS = /유효기간|사용기한|사용기간|교환기간|만료일|까지|사용\s*가능|유효\s*기간/i;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function toDateOnly(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function normalizeYear(raw: number): number {
  if (raw < 100) return 2000 + raw;
  return raw;
}

type DateCandidate = { expiresAt: string; score: number; hint: string };

function scoreDateLine(line: string, index: number): number {
  let score = index;
  if (EXPIRY_KEYWORDS.test(line)) score += 20;
  if (/~|까지/.test(line)) score += 5;
  return score;
}

function extractDateRangeCandidates(text: string): DateCandidate[] {
  const candidates: DateCandidate[] = [];

  const fullRangePattern =
    /(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})\s*[~～\-–—]\s*(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/g;

  for (const match of text.matchAll(fullRangePattern)) {
    const expiresAt = toDateOnly(Number(match[4]), Number(match[5]), Number(match[6]));
    if (!expiresAt) continue;

    candidates.push({
      expiresAt,
      score: 100,
      hint: match[0],
    });
  }

  const sameYearRangePattern =
    /(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})\s*[~～\-–—]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/g;

  for (const match of text.matchAll(sameYearRangePattern)) {
    const year = Number(match[1]);
    const expiresAt = toDateOnly(year, Number(match[4]), Number(match[5]));
    if (!expiresAt) continue;

    candidates.push({
      expiresAt,
      score: 100,
      hint: match[0],
    });
  }

  return candidates;
}

function extractDateCandidates(text: string): DateCandidate[] {
  const candidates: DateCandidate[] = [...extractDateRangeCandidates(text)];
  const lines = text.split(/\r?\n/);

  const patterns: RegExp[] = [
    /(\d{4})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]?\s*(\d{1,2})\s*일?/g,
    /(\d{2})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/g,
  ];

  lines.forEach((line, lineIndex) => {
    patterns.forEach((pattern) => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        const year = normalizeYear(Number(match[1]));
        const month = Number(match[2]);
        const day = Number(match[3]);
        const expiresAt = toDateOnly(year, month, day);
        if (!expiresAt) continue;

        candidates.push({
          expiresAt,
          score: scoreDateLine(line, lineIndex),
          hint: line.trim(),
        });
      }
    });
  });

  return candidates;
}

function pickBestExpiry(candidates: DateCandidate[]): DateCandidate | undefined {
  if (candidates.length === 0) return undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const future = candidates.filter((item) => {
    const date = new Date(`${item.expiresAt}T00:00:00`);
    return date.getTime() >= today.getTime() - 1000 * 60 * 60 * 24 * 365;
  });

  const pool = future.length > 0 ? future : candidates;
  return [...pool].sort((a, b) => b.score - a.score || a.expiresAt.localeCompare(b.expiresAt))[0];
}

function detectBrand(text: string): string | undefined {
  for (const brand of BRAND_PATTERNS) {
    if (brand.pattern.test(text)) return brand.name;
  }
  return undefined;
}

function detectAmount(text: string): number | undefined {
  const patterns: RegExp[] = [
    /금액\s*[:：]?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)\s*원?/i,
    /([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)\s*원/,
    /₩\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)/,
    /KRW\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)/i,
  ];

  const candidates: number[] = [];
  for (const pattern of patterns) {
    for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`))) {
      const raw = match[1]?.replace(/,/g, '');
      const value = Number(raw);
      if (!Number.isFinite(value) || value <= 0 || value > 10_000_000) continue;
      // 바코드/전화 같은 긴 숫자는 제외
      if (raw.length >= 8) continue;
      candidates.push(value);
    }
  }

  if (candidates.length === 0) return undefined;
  // 금액권은 보통 1,000원 단위가 많음. 가장 그럴듯한 값 선택
  const preferred = candidates.filter((value) => value >= 1000 && value % 100 === 0);
  const pool = preferred.length > 0 ? preferred : candidates;
  return Math.max(...pool);
}

function detectProductLine(text: string, brand?: string): string | undefined {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  for (const line of lines) {
    if (EXPIRY_KEYWORDS.test(line)) continue;
    if (/^\d+$/.test(line)) continue;
    if (/원$/.test(line) && !PRODUCT_KEYWORDS.test(line)) continue;
    if (brand && line.includes(brand) && PRODUCT_KEYWORDS.test(line)) return line.slice(0, 40);
    if (PRODUCT_KEYWORDS.test(line)) return line.slice(0, 40);
  }

  if (brand) {
    for (const line of lines) {
      if (line.includes(brand) && line.length <= 30) return line;
    }
    return `${brand} 기프티콘`;
  }

  return lines.find((line) => line.length >= 2 && line.length <= 24 && !EXPIRY_KEYWORDS.test(line));
}

function calcDaysLeft(expiresAt: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${expiresAt}T00:00:00`);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function parseGifticonFromText(text: string): ParsedGifticon {
  const normalized = text.replace(/\u00A0/g, ' ');
  const brand = detectBrand(normalized);
  const amount = detectAmount(normalized);
  const expiry = pickBestExpiry(extractDateCandidates(normalized));
  const productLine = detectProductLine(normalized, brand);

  const title = productLine || (brand ? `${brand} 기프티콘` : undefined);
  const rawHints = [
    expiry?.hint,
    productLine,
    brand ? `브랜드: ${brand}` : undefined,
    amount ? `금액: ${amount.toLocaleString('ko-KR')}원` : undefined,
  ].filter((item): item is string => Boolean(item));

  return {
    title,
    brand,
    amount,
    expiresAt: expiry?.expiresAt,
    daysLeft: expiry ? calcDaysLeft(expiry.expiresAt) : undefined,
    rawHints,
  };
}

export function formatAmount(amount?: number): string | undefined {
  if (amount === undefined || amount === null || !Number.isFinite(amount)) return undefined;
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function parseAmountInput(value: string): number | undefined {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return undefined;
  const amount = Number(digits);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  return amount;
}
