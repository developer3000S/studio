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

export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { standardizedMnn: 'asc' },
    });
    return NextResponse.json(medicines);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = MedicineSchema.parse(json);
    const newMedicine = await prisma.medicine.create({
      data: data,
    });
    return NextResponse.json(newMedicine, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 });
  }
}
