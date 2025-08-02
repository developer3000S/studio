'use client';

import type { Prescription } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { PrescriptionForm } from './prescription-form';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
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

type PrescriptionView = Prescription & {
  patientName: string;
  medicineName: string;
  remainingNeed: number;
};

const ActionsCell = ({ prescription }: { prescription: PrescriptionView }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { deletePrescription } = useAppContext();
  const { toast } = useToast();

  const handleDelete = () => {
    deletePrescription(prescription.id);
    toast({
      title: 'Назначение удалено',
      description: `Назначение для ${prescription.patientName} было успешно удалено.`,
    });
    setIsAlertOpen(false);
  };

  return (
    <>
      <PrescriptionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        prescription={prescription}
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
              Это действие невозможно отменить. Это приведет к удалению назначения.
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

export const columns: ColumnDef<PrescriptionView>[] = [
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
    accessorKey: 'dailyDose',
    header: 'Назначение',
  },
  {
    accessorKey: 'annualRequirement',
    header: 'Годовая потребность (уп.)',
    cell: ({ row }) => row.original.annualRequirement.toFixed(2),
  },
  {
    accessorKey: 'remainingNeed',
    header: 'Остаточная потребность (уп.)',
    cell: ({ row }) => {
        const remaining = row.original.remainingNeed;
        const isMet = remaining <= 0;
        return (
            <Badge variant={isMet ? 'destructive' : 'secondary'}>
                {remaining.toFixed(2)}
            </Badge>
        )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell prescription={row.original} />,
