import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const DispensationSchema = z.object({
  patientId: z.string().min(1, 'Пациент обязателен'),
  medicineId: z.string().min(1, 'Медикамент обязателен'),
  dispensationDate: z.coerce.date(),
  quantity: z.coerce.number().positive('Количество должно быть положительным числом'),
});

export async function GET() {
  try {
    const dispensations = await prisma.dispensation.findMany({
      orderBy: { dispensationDate: 'desc' },
    });
    return NextResponse.json(dispensations);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch dispensations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = DispensationSchema.parse(json);
    const newDispensation = await prisma.dispensation.create({
      data: data,
    });
    return NextResponse.json(newDispensation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to create dispensation' }, { status: 500 });
  }
}
