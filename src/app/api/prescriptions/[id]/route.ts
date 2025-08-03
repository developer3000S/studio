import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const PrescriptionSchema = z.object({
  patientId: z.string().min(1, 'Пациент обязателен'),
  medicineId: z.string().min(1, 'Медикамент обязателен'),
  dailyDose: z.string().min(1, 'Назначение обязательно'),
  dailyConsumption: z.coerce.number().positive('Расход в сутки должен быть положительным числом'),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const json = await request.json();
    const data = PrescriptionSchema.parse(json);

    const medicine = await prisma.medicine.findUnique({ where: { id: data.medicineId } });
     if (!medicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }
     if (medicine.packaging <= 0) {
        return NextResponse.json({ error: 'Medicine packaging size must be positive' }, { status: 400 });
    }

    const annualRequirement = (data.dailyConsumption * 365) / medicine.packaging;

    const updatedPrescription = await prisma.prescription.update({
      where: { id: params.id },
      data: { ...data, annualRequirement },
    });
    return NextResponse.json(updatedPrescription);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to update prescription' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.prescription.delete({
      where: { id: params.id },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete prescription' }, { status: 500 });
  }
}
