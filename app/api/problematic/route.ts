import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductListResponse, UnifiedProduct } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { existingSiteCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (brand && brand !== 'all') {
      where.brand = brand;
    }

    const totalItems = await prisma.problematicProduct.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const skip = (page - 1) * pageSize;

    const products = await prisma.problematicProduct.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const items: UnifiedProduct[] = products.map((p, index) => ({
      id: p.id,
      productName: p.productName,
      brand: p.brand,
      siteCode: p.existingSiteCode,
      link: p.link,
      date: p.date,
      description: p.description,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      rowNumber: skip + index + 1,
    }));

    const distinctBrands = await prisma.problematicProduct.findMany({
      select: { brand: true },
      distinct: ['brand'],
    });

    const response: ProductListResponse = {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      availableBrands: distinctBrands.map((b) => b.brand).filter(Boolean),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching problematic products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
