import * as jalaali from 'jalaali-js';

export const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export interface PersianMonthDetail {
  number: number;
  key: string;
  name: string;
  season: 'بهار' | 'تابستان' | 'پاییز' | 'زمستان';
  days: number;
}

export const PERSIAN_MONTH_DETAILS: PersianMonthDetail[] = [
  { number: 1, key: '01', name: 'فروردین', season: 'بهار', days: 31 },
  { number: 2, key: '02', name: 'اردیبهشت', season: 'بهار', days: 31 },
  { number: 3, key: '03', name: 'خرداد', season: 'بهار', days: 31 },
  { number: 4, key: '04', name: 'تیر', season: 'تابستان', days: 31 },
  { number: 5, key: '05', name: 'مرداد', season: 'تابستان', days: 31 },
  { number: 6, key: '06', name: 'شهریور', season: 'تابستان', days: 31 },
  { number: 7, key: '07', name: 'مهر', season: 'پاییز', days: 30 },
  { number: 8, key: '08', name: 'آبان', season: 'پاییز', days: 30 },
  { number: 9, key: '09', name: 'آذر', season: 'پاییز', days: 30 },
  { number: 10, key: '10', name: 'دی', season: 'زمستان', days: 30 },
  { number: 11, key: '11', name: 'بهمن', season: 'زمستان', days: 30 },
  { number: 12, key: '12', name: 'اسفند', season: 'زمستان', days: 29 },
];

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert any string containing English digits to Persian digits
 */
export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (w) => PERSIAN_DIGITS[+w]);
}

/**
 * Convert any string containing Persian or Arabic digits to English digits
 */
export function toEnglishDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  let str = String(input);
  // Persian digits
  str = str.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
  // Arabic digits
  str = str.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
  return str;
}

/**
 * Get current date in Jalali format YYYY/MM/DD
 */
export function getTodayJalali(): string {
  const now = new Date();
  const j = jalaali.toJalaali(now);
  const month = String(j.jm).padStart(2, '0');
  const day = String(j.jd).padStart(2, '0');
  return `${j.jy}/${month}/${day}`;
}

/**
 * Format a Jalali string (YYYY/MM/DD) into a human readable Persian format
 * e.g., "1403/06/10" -> "۱۰ شهریور ۱۴۰۳"
 */
export function formatJalaliHumanReadable(jalaliStr: string): string {
  if (!jalaliStr) return '';
  const parts = toEnglishDigits(jalaliStr).split('/');
  if (parts.length !== 3) return jalaliStr;

  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (monthIdx < 0 || monthIdx > 11 || isNaN(day)) {
    return jalaliStr;
  }

  const monthName = PERSIAN_MONTHS[monthIdx];
  return `${toPersianDigits(day)} ${monthName} ${toPersianDigits(year)}`;
}

/**
 * Validate a Jalali date string (YYYY/MM/DD)
 */
export function isValidJalaliDate(jalaliStr: string): boolean {
  if (!jalaliStr) return false;
  const cleaned = toEnglishDigits(jalaliStr).trim();
  const match = cleaned.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return false;

  const jy = parseInt(match[1], 10);
  const jm = parseInt(match[2], 10);
  const jd = parseInt(match[3], 10);

  if (jy < 1300 || jy > 1500) return false;
  if (jm < 1 || jm > 12) return false;
  if (jd < 1 || jd > 31) return false;

  return jalaali.isValidJalaaliDate(jy, jm, jd);
}

/**
 * Normalize Jalali date string to YYYY/MM/DD
 */
export function normalizeJalaliDate(jalaliStr: string): string {
  const cleaned = toEnglishDigits(jalaliStr).trim();
  const parts = cleaned.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${y}/${m}/${d}`;
  }
  return jalaliStr;
}

/**
 * Get Iranian month name by month number (1-12) or two-digit string ("01"-"12")
 */
export function getIranianMonthName(month: number | string): string {
  const m = typeof month === 'string' ? parseInt(toEnglishDigits(month), 10) : month;
  if (isNaN(m) || m < 1 || m > 12) return '';
  return PERSIAN_MONTHS[m - 1];
}

/**
 * Extract Jalali year and month from a date string (YYYY/MM/DD)
 */
export function extractJalaliYearMonth(dateStr: string): {
  year: string;
  month: string;
  monthNumber: number;
  monthName: string;
  yearMonthKey: string;
  label: string;
} | null {
  if (!dateStr) return null;
  const normalized = normalizeJalaliDate(dateStr);
  const parts = toEnglishDigits(normalized).split('/');
  if (parts.length < 2) return null;

  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return null;

  const month = String(monthNum).padStart(2, '0');
  const monthName = PERSIAN_MONTHS[monthNum - 1];
  const yearMonthKey = `${year}/${month}`;
  const label = `${monthName} ${toPersianDigits(year)}`;

  return {
    year,
    month,
    monthNumber: monthNum,
    monthName,
    yearMonthKey,
    label,
  };
}

/**
 * Get current Jalali year as string (e.g. "1403")
 */
export function getCurrentJalaliYear(): string {
  const now = new Date();
  const j = jalaali.toJalaali(now);
  return String(j.jy);
}

/**
 * Get current Jalali month as two-digit string (e.g. "07")
 */
export function getCurrentJalaliMonth(): string {
  const now = new Date();
  const j = jalaali.toJalaali(now);
  return String(j.jm).padStart(2, '0');
}

/**
 * Get start and end dates for an Iranian month
 */
export function getJalaliMonthRange(year: string | number, month: string | number): { start: string; end: string } {
  const y = String(year);
  const mNum = typeof month === 'string' ? parseInt(toEnglishDigits(month), 10) : month;
  const mStr = String(mNum).padStart(2, '0');
  const daysInMonth = mNum <= 6 ? 31 : mNum <= 11 ? 30 : 29;
  return {
    start: `${y}/${mStr}/01`,
    end: `${y}/${mStr}/${String(daysInMonth).padStart(2, '0')}`,
  };
}

export interface GroupedIranianMonthTracks<T> {
  year: string;
  month: string;
  monthNumber: number;
  monthName: string;
  yearMonthKey: string;
  label: string;
  items: T[];
  count: number;
}

/**
 * Group an array of tracks (or any items with a Jalali date property) by Iranian month
 */
export function groupTracksByIranianMonth<T extends { date: string }>(
  items: T[],
  order: 'asc' | 'desc' = 'desc'
): GroupedIranianMonthTracks<T>[] {
  const groupsMap = new Map<string, GroupedIranianMonthTracks<T>>();

  for (const item of items) {
    const ym = extractJalaliYearMonth(item.date);
    const key = ym ? ym.yearMonthKey : 'unknown';
    const label = ym ? ym.label : 'تاریخ نامشخص';
    const year = ym ? ym.year : '0';
    const month = ym ? ym.month : '00';
    const monthNumber = ym ? ym.monthNumber : 0;
    const monthName = ym ? ym.monthName : 'نامشخص';

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        year,
        month,
        monthNumber,
        monthName,
        yearMonthKey: key,
        label,
        items: [],
        count: 0,
      });
    }

    const group = groupsMap.get(key)!;
    group.items.push(item);
    group.count += 1;
  }

  const result = Array.from(groupsMap.values());

  result.sort((a, b) => {
    if (a.yearMonthKey === 'unknown') return 1;
    if (b.yearMonthKey === 'unknown') return -1;
    return order === 'desc'
      ? b.yearMonthKey.localeCompare(a.yearMonthKey)
      : a.yearMonthKey.localeCompare(b.yearMonthKey);
  });

  return result;
}
