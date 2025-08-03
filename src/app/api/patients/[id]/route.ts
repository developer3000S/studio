import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const PatientSchema = z.object({
  fio: z.string().min(1, 'ФИО обязательно'),
  birthYear: z.coerce.number().min(1900, 'Год рождения должен быть после 1900'),
  diagnosis: z.string().min(1, 'Диагноз обязателен'),
  attendingDoctor: z.string().min(1, 'Лечащий врач обязателен'),
});


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    return NextResponse.json(patient);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const json = await request.json();
    const data = PatientSchema.parse(json);
    const updatedPatient = await prisma.patient.update({
      where: { id: params.id },
      data: data,
    });
    return NextResponse.json(updatedPatient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.patient.delete({
      where: { id: params.id },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
