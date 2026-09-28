import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productFormSchema, bulkDeleteSchema } from '@/lib/validations';
import { normalizeJalaliDate, toEnglishDigits, extractJalaliYearMonth } from '@/lib/date-utils';
import { IranianMonthOption } from '@/lib/types';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const brand = searchParams.get('brand')?.trim() || '';
    const month = searchParams.get('month')?.trim() || '';
    const year = searchParams.get('year')?.trim() || '';
    const hasLink = searchParams.get('hasLink') || 'all';
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const fromRowParam = searchParams.get('fromRow');
    const toRowParam = searchParams.get('toRow');

    const isAll = pageSizeParam === 'all';
    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const pageSize = isAll ? 100000 : Math.max(1, parseInt(pageSizeParam || '20', 10));

    // Build Prisma Where Clause
    const where: Prisma.CorrectedProductWhereInput = {};

    if (search) {
      const searchNormalized = toEnglishDigits(search);
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { correctedSiteCode: { contains: search, mode: 'insensitive' } },
        { correctedSiteCode: { contains: searchNormalized, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { link: { contains: search, mode: 'insensitive' } },
        { date: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (brand && brand !== 'all') {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (month && month !== 'all') {
      const normalizedMonth = toEnglishDigits(month);
      if (normalizedMonth.includes('/')) {
        where.date = { startsWith: normalizedMonth };
      } else {
        const monthNum = parseInt(normalizedMonth, 10);
        if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
          const mStr = String(monthNum).padStart(2, '0');
          if (year && year !== 'all') {
            const yStr = toEnglishDigits(year);
            where.date = { startsWith: `${yStr}/${mStr}` };
          } else {
            where.date = { contains: `/${mStr}/` };
          }
        }
      }
    } else if (year && year !== 'all') {
      where.date = { startsWith: `${toEnglishDigits(year)}/` };
    }

    if (hasLink === 'true') {
      where.link = { not: null, gt: '' };
    } else if (hasLink === 'false') {
      where.OR = [
        { link: null },
        { link: { equals: '' } },
      ];
    }

    // Build Order By (always show newer to latest by default)
    const orderBy: Prisma.CorrectedProductOrderByWithRelationInput[] = [];
    if (sortBy === 'productName') {
      orderBy.push({ productName: sortOrder });
      orderBy.push({ date: 'desc' });
    } else if (sortBy === 'brand') {
      orderBy.push({ brand: sortOrder });
      orderBy.push({ date: 'desc' });
    } else if (sortBy === 'createdAt') {
      orderBy.push({ createdAt: sortOrder });
    } else {
      orderBy.push({ date: sortOrder });
      orderBy.push({ createdAt: sortOrder });
    }

    // Total Count for Pagination
    const totalItems = await prisma.correctedProduct.count({ where });

    // Handle range query if specified
    let skip = (page - 1) * pageSize;
    let take = pageSize;

    if (fromRowParam && toRowParam) {
      const fromRow = Math.max(1, parseInt(fromRowParam, 10));
      const toRow = Math.max(fromRow, parseInt(toRowParam, 10));
      skip = fromRow - 1;
      take = toRow - fromRow + 1;
    }

    const [items, distinctBrands, allDates] = await Promise.all([
      prisma.correctedProduct.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.correctedProduct.findMany({
        select: { brand: true },
        distinct: ['brand'],
        orderBy: { brand: 'asc' },
      }),
      prisma.correctedProduct.findMany({
        select: { date: true },
      }),
    ]);

    const availableBrands = distinctBrands
      .map((b) => b.brand.trim())
      .filter((b) => b.length > 0);

    const monthCounts = new Map<string, { year: string; month: string; monthNumber: number; monthName: string; label: string; count: number }>();
    for (const row of allDates) {
      const ym = extractJalaliYearMonth(row.date);
      if (ym) {
        const existing = monthCounts.get(ym.yearMonthKey) || {
          year: ym.year,
          month: ym.month,
          monthNumber: ym.monthNumber,
          monthName: ym.monthName,
          label: ym.label,
          count: 0,
        };
        existing.count += 1;
        monthCounts.set(ym.yearMonthKey, existing);
      }
    }

    const availableMonths: IranianMonthOption[] = Array.from(monthCounts.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([_, val]) => ({
        key: val.month,
        monthNumber: val.monthNumber,
        monthName: val.monthName,
        year: val.year,
        label: val.label,
        count: val.count,
      }));

    const startRowNumber = (fromRowParam && toRowParam)
      ? Math.max(1, parseInt(fromRowParam, 10))
      : (page - 1) * pageSize + 1;

    // Track month-by-month counting so each month counts in order starting from 1
    const monthCounters: Record<string, number> = {};

    const unifiedItems = items.map((item, index) => {
      const ym = extractJalaliYearMonth(item.date);
      const ymKey = ym ? ym.yearMonthKey : 'unknown';
      monthCounters[ymKey] = (monthCounters[ymKey] || 0) + 1;

      return {
        id: item.id,
        productName: item.productName,
        brand: item.brand,
        siteCode: item.correctedSiteCode,
        link: item.link,
        date: item.date,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        rowNumber: month ? (startRowNumber + index) : monthCounters[ymKey],
        monthRowNumber: monthCounters[ymKey],
      };
    });

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return NextResponse.json({
      success: true,
      data: {
        items: unifiedItems,
        pagination: {
          page,
          pageSize: isAll ? totalItems : pageSize,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        availableBrands,
        availableMonths,
      },
    });
  } catch (error) {
    console.error('Error fetching corrected products:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در بارگذاری فهرست کالاهای تصحیح‌شده.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = productFormSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => e.message).join(' | ');
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const { productName, brand, siteCode, link, date, description } = validation.data;
    const normalizedDate = normalizeJalaliDate(date);

    const created = await prisma.correctedProduct.create({
      data: {
        productName: productName.trim(),
        brand: brand.trim(),
        correctedSiteCode: siteCode.trim(),
        link: link ? link.trim() : null,
        date: normalizedDate,
        description: description.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'کالا با موفقیت اضافه شد.',
      data: created,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating corrected product:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ثبت کالای تصحیح‌شده. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const validation = bulkDeleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'اطلاعات درخواست حذف نامعتبر است.' },
        { status: 400 }
      );
    }

    const { all, ids, fromRow, toRow } = validation.data;

    if (all) {
      const deleteResult = await prisma.correctedProduct.deleteMany({});
      return NextResponse.json({
        success: true,
        message: `تمامی کالاهای تصحیح‌شده (${deleteResult.count} مورد) با موفقیت حذف شدند.`,
        deletedCount: deleteResult.count,
      });
    }

    if (ids && ids.length > 0) {
      const deleteResult = await prisma.correctedProduct.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({
        success: true,
        message: `${deleteResult.count} کالا با موفقیت حذف شدند.`,
        deletedCount: deleteResult.count,
      });
    }

    if (fromRow !== undefined && toRow !== undefined) {
      const start = Math.max(1, fromRow);
      const end = Math.max(start, toRow);
      const skip = start - 1;
      const take = end - start + 1;

      // Get items in exact default table order
      const itemsToDelete = await prisma.correctedProduct.findMany({
        orderBy: { createdAt: 'asc' },
        skip,
        take,
        select: { id: true },
      });

      if (itemsToDelete.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'هیچ کالایی در این بازه شماره یافت نشد.',
          deletedCount: 0,
        });
      }

      const targetIds = itemsToDelete.map((item) => item.id);
      const deleteResult = await prisma.correctedProduct.deleteMany({
        where: { id: { in: targetIds } },
      });

      return NextResponse.json({
        success: true,
        message: `کالاهای شماره ${start} تا ${start + deleteResult.count - 1} (${deleteResult.count} کالا) با موفقیت حذف شدند.`,
        deletedCount: deleteResult.count,
      });
    }

    return NextResponse.json(
      { success: false, error: 'پارامترهای حذف مشخص نشده است.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting corrected products:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف کالاها. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}
