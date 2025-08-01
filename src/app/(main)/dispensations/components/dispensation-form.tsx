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
import type { Dispensation } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DispensationFormProps {
  isOpen: boolean;
  onClose: () => void;
  dispensation?: Dispensation;
}

const formSchema = z.object({
  patientId: z.coerce.number().min(1, 'Пациент обязателен'),
  medicineId: z.coerce.number().min(1, 'Медикамент обязателен'),
  dispensationDate: z.date({ required_error: 'Дата выдачи обязательна'}),
  quantity: z.coerce.number().positive('Количество должно быть положительным числом'),
});

export function DispensationForm({ isOpen, onClose, dispensation }: DispensationFormProps) {
  const { prescriptions, patients, medicines, addDispensation, updateDispensation } = useAppContext();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: dispensation ? { ...dispensation, dispensationDate: new Date(dispensation.dispensationDate) } : {
        dispensationDate: new Date(),
        quantity: undefined
    }
  });

  const selectedPatientId = watch('patientId');

  const availableMedicines = prescriptions
    .filter(p => p.patientId === selectedPatientId)
    .map(p => medicines.find(m => m.id === p.medicineId))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const dataWithFormattedDate = {
        ...data,
        dispensationDate: format(data.dispensationDate, 'yyyy-MM-dd')
    };

    if (dispensation) {
      updateDispensation({ ...dispensation, ...dataWithFormattedDate });
      toast({
        title: 'Выдача обновлена',
        description: 'Запись о выдаче была успешно обновлена.',
      });
    } else {
      addDispensation(dataWithFormattedDate);
      toast({
        title: 'Выдача добавлена',
        description: 'Новая запись о выдаче была успешно добавлена.',
      });
    }
    onClose();
  };

  const handleClose = () => {
    reset(dispensation ? { ...dispensation, dispensationDate: new Date(dispensation.dispensationDate) } : { patientId: undefined, medicineId: undefined, dispensationDate: new Date(), quantity: undefined });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dispensation ? 'Редактировать выдачу' : 'Добавить выдачу'}</DialogTitle>
          <DialogDescription>
             Выберите пациента, медикамент и укажите детали выдачи.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
             <Controller
                control={control}
                name="patientId"
                render={({ field }) => (
                    <FormField label="Пациент" id="patientId" error={errors.patientId}>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
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
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)} disabled={!selectedPatientId}>
                            <SelectTrigger><SelectValue placeholder="Выберите медикамент" /></SelectTrigger>
                            <SelectContent>
                                {availableMedicines.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.standardizedMnn} ({m.standardizedDosage})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </FormField>
                )}
            />
            
            <Controller
                control={control}
                name="dispensationDate"
                render={({ field }) => (
                    <FormField label="Дата выдачи" id="dispensationDate" error={errors.dispensationDate}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Выберите дату</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </FormField>
                )}
            />

            <FormField label="Количество (уп.)" id="quantity" error={errors.quantity}>
              <Input id="quantity" type="number" step="1" {...register('quantity')} />
            </FormField>

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
