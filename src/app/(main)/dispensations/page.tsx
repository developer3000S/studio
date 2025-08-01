'use client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { columns } from './components/columns';
import { DispensationDataTable } from './components/data-table';
import { DispensationForm } from './components/dispensation-form';
import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function DispensationsPage() {
  const { dispensations, patients, medicines } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const data = useMemo(() => {
    return dispensations.map(d => {
      const patient = patients.find(pat => pat.id === d.patientId);
      const medicine = medicines.find(med => med.id === d.medicineId);

      return {
        ...d,
        patientName: patient?.fio || 'н/д',
        medicineName: medicine?.standardizedMnn || 'н/д',
      };
    });
  }, [dispensations, patients, medicines]);

  return (
    <div className="container mx-auto py-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Выдачи</h1>
          <p className="text-muted-foreground">Учет фактической выдачи препаратов.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить выдачу
        </Button>
      </div>

      <DispensationDataTable columns={columns} data={data} />
      <DispensationForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
