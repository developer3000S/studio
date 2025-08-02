
'use client';
import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Printer, Download, Filter, X } from 'lucide-react';
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
import { Input } from '@/components/ui/input';

export function FinancialReport() {
  const { medicines, prescriptions, dispensations } = useAppContext();
  const [medicineFilter, setMedicineFilter] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 15;

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
  
  const filteredData = useMemo(() => {
    setPage(1); // Reset page on filter change
    return reportData.filter(item => {
        const fullName = `${item.standardizedMnn} ${item.standardizedDosage}`.toLowerCase();
        return medicineFilter ? fullName.includes(medicineFilter.toLowerCase()) : true;
    });
  }, [reportData, medicineFilter]);

  const pageCount = useMemo(() => {
    return Math.ceil(filteredData.length / rowsPerPage);
  }, [filteredData, rowsPerPage]);

  const paginatedData = useMemo(() => {
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      return filteredData.slice(start, end);
  }, [filteredData, page, rowsPerPage]);

  const totals = useMemo(() => {
    return filteredData.reduce((acc, item) => {
        acc.annual += item.totalAnnualRequirementCost;
        acc.dispensed += item.totalDispensedCost;
        acc.remaining += item.remainingNeedCost;
        return acc;
    }, { annual: 0, dispensed: 0, remaining: 0 });
  }, [filteredData]);
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(amount);

  const handleExport = () => {
    const headers = [
        "Препарат", "Общая стоимость потребности (год)", "Стоимость выданного", "Стоимость остатка"
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [
        headers.join(","), 
        ...filteredData.map(item => [
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
            <div className="flex gap-2 self-end sm:self-center print:hidden">
                <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Печать</Button>
                <Button onClick={handleExport}><Download className="mr-2 h-4 w-4" />Экспорт в CSV</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
         <div className="p-4 border rounded-lg mb-4 print:hidden">
            <h4 className="font-semibold mb-2 flex items-center gap-2"><Filter className="h-4 w-4" />Фильтры</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input placeholder="Фильтр по препарату..." value={medicineFilter} onChange={e => setMedicineFilter(e.target.value)} className="lg:col-span-2" />
            </div>
             <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setMedicineFilter('')}><X className="mr-2 h-4 w-4" />Сбросить фильтры</Button>
            </div>
        </div>
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
              {paginatedData.length > 0 ? paginatedData.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.standardizedMnn} {item.standardizedDosage}</TableCell>
                  <TableCell>{formatCurrency(item.totalAnnualRequirementCost)}</TableCell>
                  <TableCell>{formatCurrency(item.totalDispensedCost)}</TableCell>
                  <TableCell>{formatCurrency(item.remainingNeedCost)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Нет данных, соответствующих фильтрам.</TableCell>
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
        {pageCount > 1 && (
            <div className="flex items-center justify-between py-4 print:hidden">
                <div className="text-sm text-muted-foreground">
                    Страница {page} из {pageCount}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                    >
                        Назад
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.min(prev + 1, pageCount))}
                        disabled={page === pageCount}
                    >
                        Вперед
                    </Button>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
