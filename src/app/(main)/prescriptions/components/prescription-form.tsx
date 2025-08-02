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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Prescription } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';


interface PrescriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  prescription?: Prescription;
}

const formSchema = z.object({
  patientId: z.coerce.number({invalid_type_error: "Пациент обязателен"}).min(1, 'Пациент обязателен'),
  medicineId: z.coerce.number({invalid_type_error: "Медикамент обязателен"}).min(1, 'Медикамент обязателен'),
  dailyDose: z.coerce.number().positive('Суточная доза должна быть положительным числом'),
});

export function PrescriptionForm({ isOpen, onClose, prescription }: PrescriptionFormProps) {
  const { patients, medicines, addPrescription, updatePrescription, prescriptions } = useAppContext();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: prescription ? {
        patientId: prescription.patientId,
        medicineId: prescription.medicineId,
        dailyDose: prescription.dailyDose,
    } : {
        patientId: undefined,
        medicineId: undefined,
        dailyDose: undefined,
    },
  });
  
  const { control, handleSubmit, reset, watch, setError } = form;

  const selectedMedicineId = watch('medicineId');
  const dailyDose = watch('dailyDose');
  const patientId = watch('patientId');
  
  const selectedMedicine = React.useMemo(() => {
    return medicines.find(m => m.id === selectedMedicineId)
  }, [selectedMedicineId, medicines]);

  const calculateAnnualRequirement = () => {
    const medicine = selectedMedicine;
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
        const existing = prescriptions.find(p => p.patientId === patientId && p.medicineId === selectedMedicineId);
        toast({
            title: existing ? 'Назначение обновлено' : 'Назначение добавлено',
            description: existing 
                ? `Суточная доза для существующего назначения была увеличена.` 
                : 'Новое назначение было успешно добавлено.',
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
        <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[70vh]">
          <div className="grid gap-4 py-4 px-2">
            <FormField
              control={control}
              name="patientId"
              render={({ field }) => (
                <FormItem className="flex flex-col md:grid md:grid-cols-4 md:items-center gap-2">
                  <FormLabel className="md:text-right">Пациент</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!!prescription}
                          className={cn(
                            "w-full justify-between md:col-span-3",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? patients.find(
                                (p) => p.id === field.value
                              )?.fio
                            : "Выберите пациента"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                       <Command>
                          <CommandInput placeholder="Поиск пациента..." />
                          <CommandEmpty>Пациент не найден.</CommandEmpty>
                          <CommandGroup>
                             <ScrollArea className="h-48">
                            {patients.map((p) => (
                              <CommandItem
                                value={p.fio}
                                key={p.id}
                                onSelect={() => {
                                  field.onChange(p.id)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    p.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {p.fio}
                              </CommandItem>
                            ))}
                            </ScrollArea>
                          </CommandGroup>
                        </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="md:col-start-2 md:col-span-3" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="medicineId"
              render={({ field }) => (
                 <FormItem className="flex flex-col md:grid md:grid-cols-4 md:items-center gap-2">
                  <FormLabel className="md:text-right">Медикамент</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!!prescription}
                          className={cn(
                            "w-full justify-between md:col-span-3",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? medicines.find(
                                (m) => m.id === field.value
                              )?.standardizedMnn
                            : "Выберите медикамент"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                       <Command>
                          <CommandInput placeholder="Поиск медикамента..." />
                          <CommandEmpty>Медикамент не найден.</CommandEmpty>
                          <CommandGroup>
                             <ScrollArea className="h-48">
                            {medicines.map((m) => (
                              <CommandItem
                                value={`${m.standardizedMnn} ${m.standardizedDosage}`}
                                key={m.id}
                                onSelect={() => {
                                   field.onChange(m.id)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    m.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {m.standardizedMnn} ({m.standardizedDosage})
                              </CommandItem>
                            ))}
                             </ScrollArea>
                          </CommandGroup>
                        </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="md:col-start-2 md:col-span-3" />
                </FormItem>
              )}
            />
            
            <FormField
                control={control}
                name="dailyDose"
                render={({ field }) => (
                    <FormItem className="flex flex-col md:grid md:grid-cols-4 md:items-center gap-2">
                        <FormLabel className="md:text-right">Суточная доза</FormLabel>
                        <div className="md:col-span-3">
                            <FormControl>
                                <Input type="number" step="0.1" {...field} />
                            </FormControl>
                             {selectedMedicine && (
                                <FormDescription>
                                    Стандартная дозировка: {selectedMedicine.standardizedDosage}
                                </FormDescription>
                             )}
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <div className="flex flex-col md:grid md:grid-cols-4 md:items-center gap-2">
                <FormLabel className="md:text-right">Годовая потребность</FormLabel>
                <div className="md:col-span-3">
                    <Input value={calculateAnnualRequirement().toFixed(2) + ' уп.'} disabled />
                </div>
            </div>

          </div>
          </ScrollArea>
          <DialogFooter className='mt-4'>
            <Button type="button" variant="outline" onClick={handleClose}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
