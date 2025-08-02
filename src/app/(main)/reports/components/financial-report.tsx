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
  TableFooter,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function FinancialReport() {
  const { medicines, prescriptions, dispensations } = useAppContext();

  const reportData = useMemo(() => {
    return medicines.map(med => {
        const medPrescriptions = prescriptions.filter(p => p.medicineId === med.id);
        const medDispensations = dispensations.filter(d => d.medicineId === med.id);

        const totalAnnualRequirement = medPrescriptions.reduce((sum, p) => sum + p.annualRequirement, 0);
        const totalDispensed = medDispensations.reduce((sum, d) => sum + d.quantity, 0);
        const remainingNeed = totalAnnualRequirement - totalDispensed;

        return {
            ...med,
            totalAnnualRequirementCost: totalAnnualRequirement * med.price,
            totalDispensedCost: totalDispensed * med.price,
            remainingNeedCost: remainingNeed > 0 ? remainingNeed * med.price : 0,
        };
    }).filter(item => item.totalAnnualRequirementCost > 0);
  }, [medicines, prescriptions, dispensations]);

  const totals = useMemo(() => {
    return reportData.reduce((acc, item) => {
        acc.annual += item.totalAnnualRequirementCost;
        acc.dispensed += item.totalDispensedCost;
        acc.remaining += item.remainingNeedCost;
        return acc;
    }, { annual: 0, dispensed: 0, remaining: 0 });
  }, [reportData]);
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(amount);

  const handleExport = () => {
    const headers = [
        "Препарат", "Общая стоимость потребности (год)", "Стоимость выданного", "Стоимость остатка"
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [
        headers.join(","), 
        ...reportData.map(item => [
          `"${item.standardizedMnn} ${item.standardizedDosage}"`,
          item.totalAnnualRequirementCost.toFixed(2),
          item.totalDispensedCost.toFixed(2),
          item.remainingNeedCost.toFixed(2)
        ].join(",")),
        `"ИТОГО",${totals.annual.toFixed(2)},${totals.dispensed.toFixed(2)},${totals.remaining.toFixed(2)}`
      ].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_report.csv");
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
                <CardTitle>IV. Финансовый отчет</CardTitle>
                <CardDescription>Анализ затрат на медикаменты.</CardDescription>
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
                <TableHead>Препарат</TableHead>
                <TableHead>Стоимость потребности (год)</TableHead>
                <TableHead>Стоимость выданного</TableHead>
                <TableHead>Стоимость остатка</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length > 0 ? reportData.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.standardizedMnn} {item.standardizedDosage}</TableCell>
                  <TableCell>{formatCurrency(item.totalAnnualRequirementCost)}</TableCell>
                  <TableCell>{formatCurrency(item.totalDispensedCost)}</TableCell>
                  <TableCell>{formatCurrency(item.remainingNeedCost)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Нет данных для отчета.</TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell className="font-bold">Итого</TableCell>
                    <TableCell className="font-bold">{formatCurrency(totals.annual)}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(totals.dispensed)}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(totals.remaining)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
