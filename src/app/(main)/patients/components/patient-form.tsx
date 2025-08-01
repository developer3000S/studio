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

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
}

const formSchema = z.object({
  fio: z.string().min(1, 'ФИО обязательно'),
  birthYear: z.coerce.number().min(1900, 'Год рождения должен быть после 1900').max(new Date().getFullYear(), 'Год рождения не может быть в будущем'),
  diagnosis: z.string().min(1, 'Диагноз обязателен'),
  attendingDoctor: z.string().min(1, 'Лечащий врач обязателен'),
});

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{patient ? 'Редактировать пациента' : 'Добавить пациента'}</DialogTitle>
          <DialogDescription>
            {patient ? 'Отредактируйте информацию ниже.' : 'Заполните информацию ниже, чтобы добавить нового пациента.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fio" className="text-right">ФИО</Label>
              <div className="col-span-3">
                <Input id="fio" {...register('fio')} />
                {errors.fio && <p className="text-destructive text-xs mt-1">{errors.fio.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birthYear" className="text-right">Год рождения</Label>
              <div className="col-span-3">
                <Input id="birthYear" type="number" {...register('birthYear')} />
                 {errors.birthYear && <p className="text-destructive text-xs mt-1">{errors.birthYear.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="diagnosis" className="text-right">Диагноз</Label>
              <div className="col-span-3">
                <Input id="diagnosis" {...register('diagnosis')} />
                {errors.diagnosis && <p className="text-destructive text-xs mt-1">{errors.diagnosis.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attendingDoctor" className="text-right">Лечащий врач</Label>
              <div className="col-span-3">
                <Input id="attendingDoctor" {...register('attendingDoctor')} />
                {errors.attendingDoctor && <p className="text-destructive text-xs mt-1">{errors.attendingDoctor.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
