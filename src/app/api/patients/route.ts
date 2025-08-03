import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const PatientSchema = z.object({
  fio: z.string().min(1, 'ФИО обязательно'),
  birthYear: z.coerce.number().min(1900, 'Год рождения должен быть после 1900'),
  diagnosis: z.string().min(1, 'Диагноз обязателен'),
  attendingDoctor: z.string().min(1, 'Лечащий врач обязателен'),
});

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { fio: 'asc' },
    });
    return NextResponse.json(patients);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = PatientSchema.parse(json);
    const newPatient = await prisma.patient.create({
      data: data,
    });
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
