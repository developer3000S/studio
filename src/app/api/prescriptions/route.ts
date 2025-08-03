import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const PrescriptionSchema = z.object({
  patientId: z.string().min(1, 'Пациент обязателен'),
  medicineId: z.string().min(1, 'Медикамент обязателен'),
  dailyDose: z.string().min(1, 'Назначение обязательно'),
  dailyConsumption: z.coerce.number().positive('Расход в сутки должен быть положительным числом'),
});

export async function GET() {
  try {
    const prescriptions = await prisma.prescription.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const existing = await prisma.prescription.findUnique({
      where: { patientId_medicineId: { patientId: data.patientId, medicineId: data.medicineId } },
    });

    if (existing) {
      const updatedPrescription = await prisma.prescription.update({
        where: { id: existing.id },
        data: { ...data, annualRequirement },
      });
      return NextResponse.json(updatedPrescription, { status: 200 });
    }

    const newPrescription = await prisma.prescription.create({
      data: { ...data, annualRequirement },
    });
    return NextResponse.json(newPrescription, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 });
  }
}
