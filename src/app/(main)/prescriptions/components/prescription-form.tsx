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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Prescription } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';

interface PrescriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  prescription?: Prescription;
}

const formSchema = z.object({
  patientId: z.coerce.number().min(1, 'Пациент обязателен'),
  medicineId: z.coerce.number().min(1, 'Медикамент обязателен'),
  dailyDose: z.coerce.number().positive('Суточная доза должна быть положительным числом'),
});

export function PrescriptionForm({ isOpen, onClose, prescription }: PrescriptionFormProps) {
  const { patients, medicines, addPrescription, updatePrescription } = useAppContext();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: prescription ? {
        patientId: prescription.patientId,
        medicineId: prescription.medicineId,
        dailyDose: prescription.dailyDose,
    } : {
      dailyDose: undefined,
    },
  });

  const selectedMedicineId = watch('medicineId');
  const dailyDose = watch('dailyDose');

  const calculateAnnualRequirement = () => {
    const medicine = medicines.find(m => m.id === selectedMedicineId);
    if (medicine && dailyDose > 0) {
      const unitsPerDay = dailyDose;
      const daysInYear = 365;
      const packagingSize = medicine.packaging;
      return (unitsPerDay * daysInYear) / packagingSize;
    }
    return 0;
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const annualRequirement = calculateAnnualRequirement();
    const prescriptionData = { ...data, annualRequirement };

    if (prescription) {
      updatePrescription({ ...prescription, ...prescriptionData });
      toast({
        title: 'Назначение обновлено',
        description: 'Назначение было успешно обновлено.',
      });
    } else {
      addPrescription(prescriptionData);
      toast({
        title: 'Назначение добавлено',
        description: 'Новое назначение было успешно добавлено.',
      });
    }
    onClose();
  };
  
  const handleClose = () => {
    reset(prescription ? { patientId: prescription.patientId, medicineId: prescription.medicineId, dailyDose: prescription.dailyDose } : { patientId: undefined, medicineId: undefined, dailyDose: undefined });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{prescription ? 'Редактировать назначение' : 'Добавить назначение'}</DialogTitle>
          <DialogDescription>
             Выберите пациента, медикамент и укажите суточную дозу.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
             <Controller
                control={control}
                name="patientId"
                render={({ field }) => (
                    <FormField label="Пациент" id="patientId" error={errors.patientId}>
                        <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                            <SelectTrigger><SelectValue placeholder="Выберите пациента" /></SelectTrigger>
                            <SelectContent>
                                {patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.fio}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </FormField>
                )}
            />

            <Controller
                control={control}
                name="medicineId"
                render={({ field }) => (
                    <FormField label="Медикамент" id="medicineId" error={errors.medicineId}>
                        <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                            <SelectTrigger><SelectValue placeholder="Выберите медикамент" /></SelectTrigger>
                            <SelectContent>
                                {medicines.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.standardizedMnn} ({m.standardizedDosage})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </FormField>
                )}
            />
            
            <FormField label="Суточная доза" id="dailyDose" error={errors.dailyDose}>
              <Input id="dailyDose" type="number" step="0.1" {...register('dailyDose')} />
            </FormField>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Годовая потребность</Label>
                <div className="col-span-3">
                    <Input value={calculateAnnualRequirement().toFixed(2) + ' уп.'} disabled />
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

function FormField({ label, id, error, children }: { label: string, id: string, error?: { message?: string }, children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">{label}</Label>
      <div className="col-span-3">
        {children}
        {error && <p className="text-destructive text-xs mt-1">{error.message}</p>}
      </div>
    </div>
  )
}
