import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productFormSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.problematicProduct.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = productFormSchema.parse(body);

    const updated = await prisma.problematicProduct.update({
      where: { id },
      data: {
        productName: validatedData.productName,
        brand: validatedData.brand,
        existingSiteCode: validatedData.siteCode,
        link: validatedData.link || null,
        date: validatedData.date,
        description: validatedData.description,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Validation or update failed' }, { status: 400 });
  }
}
