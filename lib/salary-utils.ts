import { toPersianDigits, toEnglishDigits } from './date-utils';
import { MonthlyBreakdownItem } from './types';

export const DEFAULT_TRACK_RATE = 45000; // 45,000 Tomans per track

/**
 * Format a number with thousands separators (commas)
 */
export function formatWithCommas(num: number | string): string {
  const parts = String(num).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Format currency in Tomans with Persian digits
 * e.g. 45000 -> "۴۵,۰۰۰ تومان"
 */
export function formatTomanCurrency(amount: number): string {
  return `${toPersianDigits(formatWithCommas(amount))} تومان`;
}

/**
 * Format currency in Rials with Persian digits
 * e.g. 45000 -> 450,000 Rials -> "۴۵۰,۰۰۰ ریال"
 */
export function formatRialCurrency(tomanAmount: number): string {
  const rials = tomanAmount * 10;
  return `${toPersianDigits(formatWithCommas(rials))} ریال`;
}

/**
 * Convert integer number (Tomans) to Persian words
 * e.g. 31770000 -> "سی و یک میلیون و هفتصد و هفتاد هزار تومان"
 */
export function numberToPersianWords(num: number): string {
  if (!num || isNaN(num) || num === 0) {
    return 'صفر تومان';
  }

  const yekan = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const dahganKhass = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const dahgan = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const sadgan = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const scales = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];

  let n = Math.abs(Math.floor(num));
  const parts: string[] = [];
  let scaleIdx = 0;

  while (n > 0) {
    const chunk = n % 1000;
    if (chunk > 0) {
      const cSad = Math.floor(chunk / 100);
      const rem = chunk % 100;
      const chunkWords: string[] = [];

      if (cSad > 0) {
        chunkWords.push(sadgan[cSad]);
      }

      if (rem > 0) {
        if (rem >= 10 && rem <= 19) {
          chunkWords.push(dahganKhass[rem - 10]);
        } else {
          const d = Math.floor(rem / 10);
          const y = rem % 10;
          if (d > 0) chunkWords.push(dahgan[d]);
          if (y > 0) chunkWords.push(yekan[y]);
        }
      }

      const scaleStr = scales[scaleIdx];
      let joined = chunkWords.join(' و ');
      if (scaleStr) {
        joined = joined ? `${joined} ${scaleStr}` : scaleStr;
      }
      if (joined) {
        parts.unshift(joined);
      }
    }

    n = Math.floor(n / 1000);
    scaleIdx++;
  }

  return `${parts.join(' و ')} تومان`;
}

export interface MonthlySalaryItem {
  yearMonthKey: string;
  year: string;
  month: string;
  monthNumber: number;
  monthName: string;
  label: string;
  count: number;
  ratePerTrack: number;
  totalTomans: number;
  totalRials: number;
  totalWords: string;
  percentage: number;
}

export interface SalaryCalculationResult {
  ratePerTrack: number;
  totalTracks: number;
  totalTomans: number;
  totalRials: number;
  totalWords: string;
  monthlyBreakdown: MonthlySalaryItem[];
}

/**
 * Calculate salary breakdown by month from MonthlyBreakdownItem array
 */
export function calculateSalaryReport(
  monthlyBreakdown: MonthlyBreakdownItem[] = [],
  ratePerTrack: number = DEFAULT_TRACK_RATE,
  type: 'corrected' | 'problematic' | 'all' = 'corrected'
): SalaryCalculationResult {
  const safeRate = Number(ratePerTrack) > 0 ? Number(ratePerTrack) : DEFAULT_TRACK_RATE;

  let totalTracks = 0;
  const rawItems = monthlyBreakdown.map((item) => {
    let count = 0;
    if (type === 'corrected') count = item.correctedCount || 0;
    else if (type === 'problematic') count = item.problematicCount || 0;
    else count = item.totalCount || 0;

    totalTracks += count;
    const totalTomans = count * safeRate;

    return {
      yearMonthKey: item.yearMonthKey,
      year: item.year,
      month: item.month,
      monthNumber: item.monthNumber,
      monthName: item.monthName,
      label: item.label,
      count,
      ratePerTrack: safeRate,
      totalTomans,
      totalRials: totalTomans * 10,
      totalWords: numberToPersianWords(totalTomans),
      percentage: 0,
    };
  });

  const totalTomans = totalTracks * safeRate;
  const totalRials = totalTomans * 10;
  const totalWords = numberToPersianWords(totalTomans);

  // Compute percentages
  const items: MonthlySalaryItem[] = rawItems.map((item) => ({
    ...item,
    percentage: totalTomans > 0 ? Math.round((item.totalTomans / totalTomans) * 100) : 0,
  }));

  // Sort descending by yearMonthKey
  items.sort((a, b) => b.yearMonthKey.localeCompare(a.yearMonthKey));

  return {
    ratePerTrack: safeRate,
    totalTracks,
    totalTomans,
    totalRials,
    totalWords,
    monthlyBreakdown: items,
  };
}

/**
 * Get stored rate from localStorage or fallback to default
 */
export function getStoredSalaryRate(): number {
  if (typeof window === 'undefined') return DEFAULT_TRACK_RATE;
  try {
    const stored = localStorage.getItem('asp_salary_rate_per_track');
    if (stored) {
      const parsed = parseInt(toEnglishDigits(stored), 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to read stored salary rate', e);
  }
  return DEFAULT_TRACK_RATE;
}

/**
 * Save rate to localStorage
 */
export function setStoredSalaryRate(rate: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('asp_salary_rate_per_track', String(rate));
    window.dispatchEvent(new Event('asp_salary_rate_updated'));
  } catch (e) {
    console.error('Failed to store salary rate', e);
  }
}
