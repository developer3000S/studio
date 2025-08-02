'use client';
import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsPage() {
  const { medicines, prescriptions, dispensations, patients } = useAppContext();

  const reportData = useMemo(() => {
    return medicines.map(med => {
      const medPrescriptions = prescriptions.filter(p => p.medicineId === med.id);
      
      let patientCount = 0;
      let totalNeed = 0;

      medPrescriptions.forEach(p => {
        const totalDispensed = dispensations
          .filter(d => d.patientId === p.patientId && d.medicineId === med.id)
          .reduce((sum, d) => sum + d.quantity, 0);
        
        const remainingNeed = p.annualRequirement - totalDispensed;

        if (remainingNeed > 0) {
          patientCount++;
          totalNeed += remainingNeed;
        }
      });
      
      const totalAmount = totalNeed * med.price;

      return {
        ...med,
        patientCount,
        totalNeed,
        totalAmount,
      };
    });
  }, [medicines, prescriptions, dispensations, patients]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const headers = [
      "Код_медпрепарата", "Стандартизированное_МНН", "Количество пациентов, нуждающихся в препарате", "Общая потребность (уп.)", "Общая сумма (руб.)"
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...reportData.map(item => [
          item.id,
          `"${item.standardizedMnn}"`,
          item.patientCount,
          item.totalNeed.toFixed(2),
          item.totalAmount.toFixed(2)
        ].join(","))
      ].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "medication_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Сводный отчет</h1>
          <p className="text-muted-foreground">Отчет по потребности в медикаментах.</p>
        </div>
        <div className="flex gap-2 self-end sm:self-center">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Печать
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Экспорт в CSV
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Отчет по препаратам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">МНН</TableHead>
                  <TableHead>Информация о препарате</TableHead>
                  <TableHead className="hidden lg:table-cell">Цена</TableHead>
                  <TableHead>Потребность</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.length > 0 ? reportData.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="hidden md:table-cell font-medium">{item.standardizedMnn}</TableCell>
                    <TableCell>
                        <div className="font-medium md:hidden">{item.standardizedMnn}</div>
                        <div className="text-sm text-muted-foreground">{item.standardizedDosageForm}</div>
                        <div className="lg:hidden mt-1">{new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(item.price)}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(item.price)}</TableCell>
                    <TableCell>
                        <div>{item.patientCount} пациент(ов)</div>
                        <div className="text-sm text-muted-foreground">Нужно: {item.totalNeed.toFixed(2)} уп.</div>
                        <div className="font-semibold">{new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(item.totalAmount)}</div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Нет данных для отчета.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
