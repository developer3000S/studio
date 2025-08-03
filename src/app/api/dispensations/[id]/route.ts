import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const DispensationSchema = z.object({
  patientId: z.string().min(1, 'Пациент обязателен'),
  medicineId: z.string().min(1, 'Медикамент обязателен'),
  dispensationDate: z.coerce.date(),
  quantity: z.coerce.number().positive('Количество должно быть положительным числом'),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const json = await request.json();
    const data = DispensationSchema.parse(json);
    const updatedDispensation = await prisma.dispensation.update({
      where: { id: params.id },
      data: data,
    });
    return NextResponse.json(updatedDispensation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to update dispensation' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.dispensation.delete({
      where: { id: params.id },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete dispensation' }, { status: 500 });
  }
}
