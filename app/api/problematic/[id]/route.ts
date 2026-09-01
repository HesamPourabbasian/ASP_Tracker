import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productFormSchema } from '@/lib/validations';
import { normalizeJalaliDate } from '@/lib/date-utils';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const item = await prisma.problematicProduct.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'کالای مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: item.id,
        productName: item.productName,
        brand: item.brand,
        siteCode: item.existingSiteCode,
        link: item.link,
        date: item.date,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching problematic product by id:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اطلاعات کالا.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
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

    const updated = await prisma.problematicProduct.update({
      where: { id },
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
      message: 'اطلاعات کالا با موفقیت بروزرسانی شد.',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating problematic product:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در بروزرسانی کالا. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await prisma.problematicProduct.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'کالا با موفقیت حذف شد.',
    });
  } catch (error) {
    console.error('Error deleting problematic product by id:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف کالا. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}
