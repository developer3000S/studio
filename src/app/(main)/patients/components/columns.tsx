'use client';

import type { Patient } from '@/types';
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
import { PatientForm } from './patient-form';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const ActionsCell = ({ patient }: { patient: Patient }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { deletePatient } = useAppContext();
  const { toast } = useToast();

  const handleDelete = () => {
    deletePatient(patient.id);
    toast({
      title: 'Пациент удален',
      description: `Запись для ${patient.fio} была успешно удалена.`,
    });
    setIsAlertOpen(false);
  };

  return (
    <>
      <PatientForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        patient={patient}
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(patient.id))}>
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
              Это действие невозможно отменить. Это приведет к удалению пациента и всех связанных с ним назначений и выдач.
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

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: 'fio',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ФИО
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'birthYear',
    header: 'Год рождения',
  },
  {
    accessorKey: 'diagnosis',
    header: 'Диагноз',
  },
  {
    accessorKey: 'attendingDoctor',
    header: 'Лечащий врач',
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell patient={row.original} />,
  },
];
