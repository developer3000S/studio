'use client';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { columns } from './components/columns';
import { PrescriptionDataTable } from './components/data-table';
import { PrescriptionForm } from './components/prescription-form';
import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useSearchParams } from 'next/navigation';

export default function PrescriptionsPage() {
  const { prescriptions, patients, medicines, dispensations, loading } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsFormOpen(true);
    }
  }, [searchParams]);

  const data = useMemo(() => {
    if (loading) return [];
    return prescriptions.map(p => {
      const patient = patients.find(pat => pat.id === p.patientId);
      const medicine = medicines.find(med => med.id === p.medicineId);
      const totalDispensed = dispensations
        .filter(d => d.patientId === p.patientId && d.medicineId === p.medicineId)
        .reduce((sum, d) => sum + d.quantity, 0);
      const remainingNeed = p.annualRequirement - totalDispensed;

      return {
        ...p,
        patientName: patient?.fio || 'н/д',
        medicineName: medicine?.standardizedMnn || 'н/д',
        remainingNeed,
      };
    });
  }, [prescriptions, patients, medicines, dispensations, loading]);

  return (
    <div className="container mx-auto py-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Назначения</h1>
          <p className="text-muted-foreground">Управление назначениями лекарств.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить назначение
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <PrescriptionDataTable columns={columns} data={data} />
      )}
      <PrescriptionForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
