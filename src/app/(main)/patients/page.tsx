'use client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { columns } from './components/columns';
import { PatientDataTable } from './components/data-table';
import { PatientForm } from './components/patient-form';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useSearchParams } from 'next/navigation';

export default function PatientsPage() {
  const { patients } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsFormOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto py-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Пациенты</h1>
          <p className="text-muted-foreground">Управление записями пациентов.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить пациента
        </Button>
      </div>

      <PatientDataTable columns={columns} data={patients} />
      <PatientForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
