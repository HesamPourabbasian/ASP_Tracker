import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractJalaliYearMonth } from '@/lib/date-utils';
import { MonthlyBreakdownItem } from '@/lib/types';

export async function GET() {
  try {
    const [
      problematicCount,
      correctedCount,
      problematicDates,
      correctedDates,
    ] = await Promise.all([
      prisma.problematicProduct.count(),
      prisma.correctedProduct.count(),
      prisma.problematicProduct.findMany({ select: { date: true } }),
      prisma.correctedProduct.findMany({ select: { date: true } }),
    ]);

    const breakdownMap = new Map<string, MonthlyBreakdownItem>();

    for (const item of problematicDates) {
      const ym = extractJalaliYearMonth(item.date);
      if (ym) {
        if (!breakdownMap.has(ym.yearMonthKey)) {
          breakdownMap.set(ym.yearMonthKey, {
            yearMonthKey: ym.yearMonthKey,
            year: ym.year,
            month: ym.month,
            monthNumber: ym.monthNumber,
            monthName: ym.monthName,
            label: ym.label,
            problematicCount: 0,
            correctedCount: 0,
            totalCount: 0,
          });
        }
        const record = breakdownMap.get(ym.yearMonthKey)!;
        record.problematicCount += 1;
        record.totalCount += 1;
      }
    }

    for (const item of correctedDates) {
      const ym = extractJalaliYearMonth(item.date);
      if (ym) {
        if (!breakdownMap.has(ym.yearMonthKey)) {
          breakdownMap.set(ym.yearMonthKey, {
            yearMonthKey: ym.yearMonthKey,
            year: ym.year,
            month: ym.month,
            monthNumber: ym.monthNumber,
            monthName: ym.monthName,
            label: ym.label,
            problematicCount: 0,
            correctedCount: 0,
            totalCount: 0,
          });
        }
        const record = breakdownMap.get(ym.yearMonthKey)!;
        record.correctedCount += 1;
        record.totalCount += 1;
      }
    }

    const monthlyBreakdown: MonthlyBreakdownItem[] = Array.from(breakdownMap.values()).sort(
      (a, b) => b.yearMonthKey.localeCompare(a.yearMonthKey)
    );

    return NextResponse.json({
      success: true,
      data: {
        problematicCount,
        correctedCount,
        totalCount: problematicCount + correctedCount,
        monthlyBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت آمار سیستم.' },
      { status: 500 }
    );
  }
}
