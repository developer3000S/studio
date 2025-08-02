'use client';

import type { Medicine } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useMemo } from 'react';
import { MedicationForm } from './medication-form';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const ActionsCell = ({ medicine }: { medicine: Medicine }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { deleteMedicine, prescriptions, dispensations } = useAppContext();
  const { toast } = useToast();

   const relatedDataCounts = useMemo(() => {
    const relatedPrescriptions = prescriptions.filter(p => p.medicineId === medicine.id).length;
    const relatedDispensations = dispensations.filter(d => d.medicineId === medicine.id).length;
    return { relatedPrescriptions, relatedDispensations };
  }, [medicine.id, prescriptions, dispensations]);

  const handleDelete = () => {
    deleteMedicine(medicine.id);
    toast({
      title: 'Медикамент удален',
      description: `Запись для ${medicine.standardizedMnn} была успешно удалена.`,
    });
    setIsAlertOpen(false);
  };

  return (
    <>
      <MedicationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        medicine={medicine}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(medicine.id))}>
              Копировать ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsFormOpen(true)}>
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAlertOpen(true)} className="text-destructive focus:text-destructive">
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
               Это действие невозможно отменить. Это приведет к удалению медикамента и всех связанных с ним данных.
                {(relatedDataCounts.relatedPrescriptions > 0 || relatedDataCounts.relatedDispensations > 0) && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                    <p className="font-bold">Будут также удалены:</p>
                    <ul className="list-disc pl-5">
                       {relatedDataCounts.relatedPrescriptions > 0 && <li>Назначения: {relatedDataCounts.relatedPrescriptions}</li>}
                       {relatedDataCounts.relatedDispensations > 0 && <li>Выдачи: {relatedDataCounts.relatedDispensations}</li>}
                    </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const columns: ColumnDef<Medicine>[] = [
  {
    accessorKey: 'standardizedMnn',
    header: 'Стандартизированное МНН',
  },
  {
    accessorKey: 'tradeNameVk',
    header: 'Торговое наименование',
  },
    {
    accessorKey: 'standardizedDosageForm',
    header: 'Лекарственная форма',
  },
  {
    accessorKey: 'price',
    header: 'Цена',
     cell: ({ row }) => {
      const amount = parseFloat(String(row.getValue("price")))
      const formatted = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
      }).format(amount)
 
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell medicine={row.original} />,
  },
];
