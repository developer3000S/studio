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
import { Badge } from '@/components/ui/badge';

export function PrescriptionsReport() {
  const { patients, medicines, prescriptions, dispensations } = useAppContext();

  const reportData = useMemo(() => {
    return prescriptions.map(p => {
        const patient = patients.find(pat => pat.id === p.patientId);
        const medicine = medicines.find(med => med.id === p.medicineId);
        const totalDispensed = dispensations
            .filter(d => d.patientId === p.patientId && d.medicineId === p.medicineId)
            .reduce((sum, d) => sum + d.quantity, 0);
        const remainingNeed = p.annualRequirement - totalDispensed;

        return {
            ...p,
            patientName: patient?.fio || 'н/д',
            doctor: patient?.attendingDoctor || 'н/д',
            diagnosis: patient?.diagnosis || 'н/д',
            medicineName: medicine ? `${medicine.standardizedMnn} ${medicine.standardizedDosage}` : 'н/д',
            totalDispensed,
            remainingNeed,
            status: remainingNeed <= 0 ? "Потребность удовлетворена" : "Требуется выдача"
        };
    }).sort((a,b) => a.patientName.localeCompare(b.patientName));
  }, [patients, medicines, prescriptions, dispensations]);

  const handleExport = () => {
    const headers = [
        "Пациент", "Лечащий врач", "Диагноз", "Препарат", "Назначение", 
        "Годовая потребность (уп.)", "Выдано (уп.)", "Остаток (уп.)", "Статус"
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...reportData.map(item => [
          `"${item.patientName}"`,
          `"${item.doctor}"`,
          `"${item.diagnosis}"`,
          `"${item.medicineName}"`,
          `"${item.dailyDose}"`,
          item.annualRequirement.toFixed(2),
          item.totalDispensed.toFixed(2),
          item.remainingNeed.toFixed(2),
          `"${item.status}"`
        ].join(","))
      ].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "prescriptions_report.csv");
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
                <CardTitle>III. Отчет по назначениям</CardTitle>
                <CardDescription>Детальная информация по каждому назначению.</CardDescription>
            </div>
            <div className="flex gap-2 self-end sm:self-center">
                <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Печать</Button>
                <Button onClick={handleExport}><Download className="mr-2 h-4 w-4" />Экспорт в CSV</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пациент</TableHead>
                <TableHead>Лечащий врач</TableHead>
                <TableHead>Препарат</TableHead>
                <TableHead>Потребность (Год/Выдано/Ост.)</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length > 0 ? reportData.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                      <div className="font-bold">{item.patientName}</div>
                      <div className="text-sm text-muted-foreground">{item.diagnosis}</div>
                  </TableCell>
                  <TableCell>
                      <div className="font-medium">{item.doctor}</div>
                  </TableCell>
                  <TableCell>
                      <div className="font-medium">{item.medicineName}</div>
                      <div className="text-sm text-muted-foreground">Назначение: {item.dailyDose}</div>
                  </TableCell>
                  <TableCell>
                      <div>Год: {item.annualRequirement.toFixed(2)} уп.</div>
                      <div>Выдано: {item.totalDispensed.toFixed(2)} уп.</div>
                      <div className="font-bold">Остаток: {item.remainingNeed.toFixed(2)} уп.</div>
                  </TableCell>
                  <TableCell>
                      <Badge variant={item.remainingNeed <= 0 ? 'secondary' : 'destructive'}>
                          {item.status}
                      </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Нет данных для отчета.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
