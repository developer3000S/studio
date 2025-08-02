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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Dispensation } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import React from 'react';

interface DispensationFormProps {
  isOpen: boolean;
  onClose: () => void;
  dispensation?: Dispensation;
}

const formSchema = z.object({
  patientId: z.string({invalid_type_error: "Пациент обязателен"}).min(1, 'Пациент обязателен'),
  medicineId: z.string({invalid_type_error: "Медикамент обязателен"}).min(1, 'Медикамент обязателен'),
  dispensationDate: z.date({ required_error: 'Дата выдачи обязательна'}),
  quantity: z.coerce.number().positive('Количество должно быть положительным числом'),
});

export function DispensationForm({ isOpen, onClose, dispensation }: DispensationFormProps) {
  const { prescriptions, patients, medicines, addDispensation, updateDispensation, dispensations } = useAppContext();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: dispensation ? { ...dispensation, dispensationDate: new Date(dispensation.dispensationDate) } : {
        patientId: '',
        medicineId: '',
        dispensationDate: new Date(),
        quantity: '' as any,
    }
  });

  const { control, handleSubmit, reset, watch } = form;

  const selectedPatientId = watch('patientId');

  const availableMedicines = React.useMemo(() => {
    if (!selectedPatientId) return [];

    return prescriptions
      .filter(p => p.patientId === selectedPatientId)
      .map(p => {
        const medicine = medicines.find(m => m.id === p.medicineId);
        if (!medicine) return null;

        const totalDispensed = dispensations
            .filter(d => d.patientId === p.patientId && d.medicineId === p.medicineId)
            .reduce((sum, d) => sum + d.quantity, 0);
        
        const remainingNeed = p.annualRequirement - totalDispensed;
        
        return {
            ...medicine,
            remainingNeed: remainingNeed.toFixed(2),
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
  }, [selectedPatientId, prescriptions, medicines, dispensations]);


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
    reset(dispensation ? { ...dispensation, dispensationDate: new Date(dispensation.dispensationDate) } : { patientId: '', medicineId: '', dispensationDate: new Date(), quantity: '' as any });
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
                          className={cn(
                            "w-full justify-between md:col-span-3",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                           {field.value
                            ? (() => {
                                const patient = patients.find(p => p.id === field.value);
                                return patient ? `${patient.fio} (${patient.birthYear} г.р.)` : "Выберите пациента";
                              })()
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
                                value={`${p.fio} ${p.birthYear}`}
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
                                {p.fio} ({p.birthYear} г.р.)
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
                          disabled={!selectedPatientId}
                          className={cn(
                            "w-full justify-between md:col-span-3",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? availableMedicines.find(
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
                            {availableMedicines.map((m) => (
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
                                <div>
                                  <div>{m.standardizedMnn} ({m.standardizedDosage})</div>
                                  <div className="text-xs text-muted-foreground">Остаток: {m.remainingNeed} уп.</div>
                                </div>
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
              name="dispensationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col md:grid md:grid-cols-4 md:items-center gap-2">
                  <FormLabel className="md:text-right">Дата выдачи</FormLabel>
                   <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                          variant={"outline"}
                          className={cn(
                              "w-full justify-start text-left font-normal md:col-span-3",
                              !field.value && "text-muted-foreground"
                          )}
                          >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Выберите дату</span>}
                          </Button>
                        </FormControl>
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
                   <FormMessage className="md:col-start-2 md:col-span-3" />
                </FormItem>
              )}
            />

             <FormField
                control={control}
                name="quantity"
                render={({ field }) => (
                    <FormItem className="flex flex-col md:grid md:grid-cols-4 md:items-center gap-2">
                        <FormLabel className="md:text-right">Количество (уп.)</FormLabel>
                        <FormControl className="md:col-span-3">
                            <Input type="number" step="1" {...field} />
                        </FormControl>
                        <FormMessage className="md:col-start-2 md:col-span-3" />
                    </FormItem>
                )}
            />

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