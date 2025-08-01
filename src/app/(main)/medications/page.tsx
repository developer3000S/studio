'use client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { columns } from './components/columns';
import { MedicationDataTable } from './components/data-table';
import { MedicationForm } from './components/medication-form';
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function MedicationsPage() {
  const { medicines } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="container mx-auto py-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Медикаменты</h1>
          <p className="text-muted-foreground">Управление каталогом медикаментов.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить медикамент
        </Button>
      </div>

      <MedicationDataTable columns={columns} data={medicines} />
      <MedicationForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
