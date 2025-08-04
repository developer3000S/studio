'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Patient } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
}

const formSchema = z.object({
  fio: z.string().min(1, 'ФИО обязательно'),
  birthYear: z.coerce.number().min(1900, 'Год рождения должен быть после 1900').max(2030, 'Год рождения не может быть в будущем'),
  diagnosis: z.string().min(1, 'Диагноз обязателен'),
  attendingDoctor: z.string().min(1, 'Лечащий врач обязателен'),
});

function FormField({ label, id, error, children }: { label: string, id: string, error?: { message?: string }, children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
      <Label htmlFor={id} className="md:text-right">{label}</Label>
      <div className="md:col-span-3">
        {children}
        {error && <p className="text-destructive text-xs mt-1">{error.message}</p>}
      </div>
    </div>
  )
}

export function PatientForm({ isOpen, onClose, patient }: PatientFormProps) {
  const { addPatient, updatePatient } = useAppContext();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: patient || {
      fio: '',
      birthYear: undefined,
      diagnosis: '',
      attendingDoctor: '',
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (patient) {
      updatePatient({ ...patient, ...data });
      toast({
        title: 'Пациент обновлен',
        description: `Данные для ${data.fio} были успешно обновлены.`,
      });
    } else {
      addPatient(data);
      toast({
        title: 'Пациент добавлен',
        description: `${data.fio} был успешно добавлен в систему.`,
      });
    }
    onClose();
  };

  const handleClose = () => {
    reset(patient || { fio: '', birthYear: undefined, diagnosis: '', attendingDoctor: '' });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{patient ? 'Редактировать пациента' : 'Добавить пациента'}</DialogTitle>
          <DialogDescription>
            {patient ? 'Отредактируйте информацию ниже.' : 'Заполните информацию ниже, чтобы добавить нового пациента.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[70vh]">
          <div className="grid gap-4 py-4 px-2">
            <FormField label="ФИО" id="fio" error={errors.fio}>
              <Input id="fio" {...register('fio')} />
            </FormField>
             <FormField label="Год рождения" id="birthYear" error={errors.birthYear}>
               <Input id="birthYear" type="number" {...register('birthYear')} />
            </FormField>
             <FormField label="Диагноз" id="diagnosis" error={errors.diagnosis}>
              <Input id="diagnosis" {...register('diagnosis')} />
            </FormField>
             <FormField label="Лечащий врач" id="attendingDoctor" error={errors.attendingDoctor}>
                <Input id="attendingDoctor" {...register('attendingDoctor')} />
            </FormField>
          </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
