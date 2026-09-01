import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productFormSchema, bulkDeleteSchema } from '@/lib/validations';
import { normalizeJalaliDate, toEnglishDigits } from '@/lib/date-utils';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const brand = searchParams.get('brand')?.trim() || '';
    const hasLink = searchParams.get('hasLink') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const fromRowParam = searchParams.get('fromRow');
    const toRowParam = searchParams.get('toRow');

    const isAll = pageSizeParam === 'all';
    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const pageSize = isAll ? 100000 : Math.max(1, parseInt(pageSizeParam || '20', 10));

    // Build Prisma Where Clause
    const where: Prisma.ProblematicProductWhereInput = {};

    if (search) {
      const searchNormalized = toEnglishDigits(search);
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { existingSiteCode: { contains: search, mode: 'insensitive' } },
        { existingSiteCode: { contains: searchNormalized, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { link: { contains: search, mode: 'insensitive' } },
        { date: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (brand && brand !== 'all') {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (hasLink === 'true') {
      where.link = { not: null, gt: '' };
    } else if (hasLink === 'false') {
      where.OR = [
        { link: null },
        { link: { equals: '' } },
      ];
    }

    // Build Order By
    const orderBy: Prisma.ProblematicProductOrderByWithRelationInput = {};
    if (sortBy === 'productName') {
      orderBy.productName = sortOrder;
    } else if (sortBy === 'brand') {
      orderBy.brand = sortOrder;
    } else if (sortBy === 'date') {
      orderBy.date = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Total Count for Pagination
    const totalItems = await prisma.problematicProduct.count({ where });

    // Handle range query if specified
    let skip = (page - 1) * pageSize;
    let take = pageSize;

    if (fromRowParam && toRowParam) {
      const fromRow = Math.max(1, parseInt(fromRowParam, 10));
      const toRow = Math.max(fromRow, parseInt(toRowParam, 10));
      skip = fromRow - 1;
      take = toRow - fromRow + 1;
    }

    const [items, distinctBrands] = await Promise.all([
      prisma.problematicProduct.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.problematicProduct.findMany({
        select: { brand: true },
        distinct: ['brand'],
        orderBy: { brand: 'asc' },
      }),
    ]);

    const availableBrands = distinctBrands
      .map((b) => b.brand.trim())
      .filter((b) => b.length > 0);

    const startRowNumber = (fromRowParam && toRowParam)
      ? Math.max(1, parseInt(fromRowParam, 10))
      : (page - 1) * pageSize + 1;

    const unifiedItems = items.map((item, index) => ({
      id: item.id,
      productName: item.productName,
      brand: item.brand,
      siteCode: item.existingSiteCode,
      link: item.link,
      date: item.date,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      rowNumber: startRowNumber + index,
    }));

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
      },
    });
  } catch (error) {
    console.error('Error fetching problematic products:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در بارگذاری فهرست کالاهای مشکل‌دار.' },
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

    const created = await prisma.problematicProduct.create({
      data: {
        productName: productName.trim(),
        brand: brand.trim(),
        existingSiteCode: siteCode.trim(),
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
    console.error('Error creating problematic product:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ثبت کالای مشکل‌دار. لطفاً دوباره تلاش کنید.' },
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
      const deleteResult = await prisma.problematicProduct.deleteMany({});
      return NextResponse.json({
        success: true,
        message: `تمامی کالاهای مشکل‌دار (${deleteResult.count} مورد) با موفقیت حذف شدند.`,
        deletedCount: deleteResult.count,
      });
    }

    if (ids && ids.length > 0) {
      const deleteResult = await prisma.problematicProduct.deleteMany({
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
      const itemsToDelete = await prisma.problematicProduct.findMany({
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
      const deleteResult = await prisma.problematicProduct.deleteMany({
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
    console.error('Error deleting problematic products:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف کالاها. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}
