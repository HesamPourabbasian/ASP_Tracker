import jalaali from 'jalaali-js';

export function toJalaliDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const month = String(j.jm).padStart(2, '0');
  const day = String(j.jd).padStart(2, '0');
  return `${j.jy}/${month}/${day}`;
}

export function toGregorianDate(jalaliDateStr: string): Date | null {
  const parts = jalaliDateStr.split('/').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [jy, jm, jd] = parts;
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
}
