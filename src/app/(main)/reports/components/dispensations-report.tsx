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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';

export function DispensationsReport() {
  const { dispensations, patients, medicines } = useAppContext();

  const reportData = useMemo(() => {
    return dispensations.map(d => {
        const patient = patients.find(p => p.id === d.patientId);
        const medicine = medicines.find(m => m.id === d.medicineId);
        return {
            ...d,
            patientName: patient?.fio || 'н/д',
            medicineName: medicine ? `${medicine.standardizedMnn} ${medicine.standardizedDosage}` : 'н/д',
            dispensationDateFormatted: format(new Date(d.dispensationDate), 'dd.MM.yyyy')
        }
    }).sort((a,b) => new Date(b.dispensationDate).getTime() - new Date(a.dispensationDate).getTime());
  }, [dispensations, patients, medicines]);
  
  const handleExport = () => {
    const headers = [
        "Дата выдачи", "Пациент", "Препарат", "Количество (уп.)"
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [
        headers.join(","), 
        ...reportData.map(item => [
          `"${item.dispensationDateFormatted}"`,
          `"${item.patientName}"`,
          `"${item.medicineName}"`,
          item.quantity
        ].join(","))
      ].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dispensations_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePrint = () => window.print();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>V. Отчет по выдачам</CardTitle>
                <CardDescription>Хронологический журнал выдачи препаратов.</CardDescription>
            </div>
            <div className="flex gap-2 self-end sm:self-center">
                <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Печать</Button>
                <Button onClick={handleExport}><Download className="mr-2 h-4 w-4" />Экспорт в CSV</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата выдачи</TableHead>
                <TableHead>Пациент</TableHead>
                <TableHead>Препарат</TableHead>
                <TableHead>Количество (уп.)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length > 0 ? reportData.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.dispensationDateFormatted}</TableCell>
                  <TableCell className="font-medium">{item.patientName}</TableCell>
                  <TableCell>{item.medicineName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Нет данных о выдачах.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
