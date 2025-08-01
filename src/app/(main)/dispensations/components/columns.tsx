'use client';

import type { Dispensation } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { DispensationForm } from './dispensation-form';
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

type DispensationView = Dispensation & {
  patientName: string;
  medicineName: string;
};

const ActionsCell = ({ dispensation }: { dispensation: DispensationView }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { deleteDispensation } = useAppContext();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteDispensation(dispensation.id);
    toast({
      title: 'Выдача удалена',
      description: `Запись о выдаче для ${dispensation.patientName} была успешно удалена.`,
    });
    setIsAlertOpen(false);
  };

  return (
    <>
      <DispensationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        dispensation={dispensation}
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
               Это действие невозможно отменить. Это приведет к удалению записи о выдаче.
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

export const columns: ColumnDef<DispensationView>[] = [
  {
    accessorKey: 'patientName',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Пациент <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'medicineName',
    header: 'Медикамент',
  },
  {
    accessorKey: 'dispensationDate',
    header: 'Дата выдачи',
     cell: ({ row }) => {
      const date = new Date(row.original.dispensationDate);
      return date.toLocaleDateString('ru-RU');
    }
  },
  {
    accessorKey: 'quantity',
    header: 'Количество (уп.)',
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell dispensation={row.original} />,
  },
];
