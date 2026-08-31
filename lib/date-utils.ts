import * as jalaali from 'jalaali-js';

const PERSIAN_MONTHS = [
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
