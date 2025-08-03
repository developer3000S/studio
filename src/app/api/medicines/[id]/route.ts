import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const MedicineSchema = z.object({
    smmnNodeCode: z.string().min(1, 'Код обязателен'),
    section: z.string().min(1, 'Раздел обязателен'),
    standardizedMnn: z.string().min(1, 'МНН обязательно'),
    tradeNameVk: z.string().min(1, 'Торговое наименование обязательно'),
    standardizedDosageForm: z.string().min(1, 'Лекарственная форма обязательна'),
    standardizedDosage: z.string().min(1, 'Дозировка обязательна'),
    characteristic: z.string(),
    packaging: z.coerce.number().positive('Фасовка должна быть положительным числом'),
    price: z.coerce.number().positive('Цена должна быть положительным числом'),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: params.id },
    });
    if (!medicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }
    return NextResponse.json(medicine);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch medicine' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const json = await request.json();
    const data = MedicineSchema.parse(json);
    const updatedMedicine = await prisma.medicine.update({
      where: { id: params.id },
      data: data,
    });
    return NextResponse.json(updatedMedicine);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.medicine.delete({
      where: { id: params.id },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete medicine' }, { status: 500 });
  }
}
