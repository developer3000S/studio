'use client';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { columns } from './components/columns';
import { PatientDataTable } from './components/data-table';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const PatientForm = dynamic(() => import('./components/patient-form').then(mod => mod.PatientForm), {
  ssr: false,
});

export default function PatientsPage() {
  const { patients, loading } = useAppContext();
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

      {loading ? (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <PatientDataTable columns={columns} data={patients} />
      )}
      {isFormOpen && <PatientForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}
