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
import type { Medicine } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MedicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  medicine?: Medicine;
}

const formSchema = z.object({
    smmnNodeCode: z.string().min(1, 'Код обязателен'),
    section: z.string().min(1, 'Раздел обязателен'),
    standardizedMnn: z.string().min(1, 'МНН обязательно'),
    tradeNameVk: z.string().min(1, 'Торговое наименование обязательно'),
    standardizedDosageForm: z.string().min(1, 'Лекарственная форма обязательна'),
    standardizedDosage: z.string().min(1, 'Дозировка обязательна'),
    characteristic: z.string(),
    packaging: z.coerce.number().positive('Фасовка должна быть положительным числом'),
    price: z.coerce.number().positive('Цена должна быть положительным числом'),
});

export function MedicationForm({ isOpen, onClose, medicine }: MedicationFormProps) {
  const { addMedicine, updateMedicine } = useAppContext();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: medicine || {
        smmnNodeCode: '',
        section: '',
        standardizedMnn: '',
        tradeNameVk: '',
        standardizedDosageForm: '',
        standardizedDosage: '',
        characteristic: '-',
        packaging: undefined,
        price: undefined,
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (medicine) {
      updateMedicine({ ...medicine, ...data });
      toast({
        title: 'Медикамент обновлен',
        description: `Данные для ${data.standardizedMnn} были успешно обновлены.`,
      });
    } else {
      addMedicine(data);
      toast({
        title: 'Медикамент добавлен',
        description: `${data.standardizedMnn} был успешно добавлен в систему.`,
      });
    }
    onClose();
  };

  const handleClose = () => {
     reset(medicine || { smmnNodeCode: '', section: '', standardizedMnn: '', tradeNameVk: '', standardizedDosageForm: '', standardizedDosage: '', characteristic: '-', packaging: undefined, price: undefined });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{medicine ? 'Редактировать медикамент' : 'Добавить медикамент'}</DialogTitle>
          <DialogDescription>
            {medicine ? 'Отредактируйте информацию ниже.' : 'Заполните информацию ниже, чтобы добавить новый медикамент.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
        <ScrollArea className="max-h-[70vh]">
          <div className="grid gap-4 py-4 px-2">
            
            <FormField label="Код узла СМНН" id="smmnNodeCode" error={errors.smmnNodeCode}>
              <Input id="smmnNodeCode" {...register('smmnNodeCode')} />
            </FormField>

            <FormField label="Раздел" id="section" error={errors.section}>
              <Input id="section" {...register('section')} />
            </FormField>
            
            <FormField label="Стандартизированное МНН" id="standardizedMnn" error={errors.standardizedMnn}>
              <Input id="standardizedMnn" {...register('standardizedMnn')} />
            </FormField>

            <FormField label="Торговое наименование" id="tradeNameVk" error={errors.tradeNameVk}>
              <Input id="tradeNameVk" {...register('tradeNameVk')} />
            </FormField>

            <FormField label="Лекарственная форма" id="standardizedDosageForm" error={errors.standardizedDosageForm}>
              <Input id="standardizedDosageForm" {...register('standardizedDosageForm')} />
            </FormField>

            <FormField label="Дозировка" id="standardizedDosage" error={errors.standardizedDosage}>
              <Input id="standardizedDosage" {...register('standardizedDosage')} />
            </FormField>

            <FormField label="Характеристика" id="characteristic" error={errors.characteristic}>
              <Input id="characteristic" {...register('characteristic')} />
            </FormField>

            <FormField label="Фасовка" id="packaging" error={errors.packaging}>
              <Input id="packaging" type="number" {...register('packaging')} />
            </FormField>
            
            <FormField label="Цена" id="price" error={errors.price}>
              <Input id="price" type="number" step="0.01" {...register('price')} />
            </FormField>

          </div>
          </ScrollArea>
          <DialogFooter className='mt-4'>
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
    <div className="grid grid-cols-1 md:grid-cols-4 items-start md:items-center gap-2 md:gap-4">
      <Label htmlFor={id} className="md:text-right">{label}</Label>
      <div className="md:col-span-3">
        {children}
        {error && <p className="text-destructive text-xs mt-1">{error.message}</p>}
      </div>
    </div>
  )
}
