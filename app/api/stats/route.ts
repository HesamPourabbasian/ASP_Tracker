import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [problematicCount, correctedCount] = await Promise.all([
      prisma.problematicProduct.count(),
      prisma.correctedProduct.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        problematicCount,
        correctedCount,
        totalCount: problematicCount + correctedCount,
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
