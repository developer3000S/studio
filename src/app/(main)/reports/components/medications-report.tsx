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

export function MedicationsReport() {
  const { medicines, prescriptions } = useAppContext();

  const reportData = useMemo(() => {
    return medicines.map(med => {
      const medPrescriptions = prescriptions.filter(p => p.medicineId === med.id);
      const patientIds = new Set(medPrescriptions.map(p => p.patientId));
      
      const totalAnnualRequirementInPackages = medPrescriptions.reduce((sum, p) => sum + p.annualRequirement, 0);

      return {
        ...med,
        patientCount: patientIds.size,
        totalAnnualRequirementInPackages,
      };
    });
  }, [medicines, prescriptions]);

  const handleExport = () => {
    const headers = [
        "id", "Код_узла_СМНН", "Раздел", "Стандартизированное_МНН", 
        "Торговое наименование ВК", "Стандартизированная_лекарственная_форма", 
        "Стандартизированная_лекарственная_доза", "Характеристика", "Фасовка", 
        "Цена", "Количество_пациентов", "Количество_упаковок_всего"
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...reportData.map(item => [
          item.id,
          `"${item.smmnNodeCode}"`,
          `"${item.section}"`,
          `"${item.standardizedMnn}"`,
          `"${item.tradeNameVk}"`,
          `"${item.standardizedDosageForm}"`,
          `"${item.standardizedDosage}"`,
          `"${item.characteristic}"`,
          item.packaging,
          item.price,
          item.patientCount,
          item.totalAnnualRequirementInPackages.toFixed(2)
        ].join(","))
      ].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "medications_report.csv");
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
                <CardTitle>I. Отчет по препаратам</CardTitle>
                <CardDescription>Полный перечень медикаментов с анализом назначений.</CardDescription>
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
                <TableHead>№ п/п</TableHead>
                <TableHead>Код узла СМНН</TableHead>
                <TableHead>Раздел</TableHead>
                <TableHead>Стандартизированное МНН</TableHead>
                <TableHead>Торг. наименование</TableHead>
                <TableHead>Лек. форма</TableHead>
                <TableHead>Доза</TableHead>
                <TableHead>Характеристика</TableHead>
                <TableHead>Фасовка</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Кол-во пациентов</TableHead>
                <TableHead>Кол-во уп. (год)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length > 0 ? reportData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.smmnNodeCode}</TableCell>
                  <TableCell>{item.section}</TableCell>
                  <TableCell>{item.standardizedMnn}</TableCell>
                  <TableCell>{item.tradeNameVk}</TableCell>
                  <TableCell>{item.standardizedDosageForm}</TableCell>
                  <TableCell>{item.standardizedDosage}</TableCell>
                  <TableCell>{item.characteristic}</TableCell>
                  <TableCell>{item.packaging}</TableCell>
                  <TableCell>{new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(item.price)}</TableCell>
                  <TableCell>{item.patientCount}</TableCell>
                  <TableCell>{item.totalAnnualRequirementInPackages.toFixed(2)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center">Нет данных для отчета.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
