
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
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function PatientsReport() {
  const { patients, medicines, prescriptions } = useAppContext();
  const [fioFilter, setFioFilter] = useState('');

  const reportData = useMemo(() => {
    return patients.map(patient => {
        const patientPrescriptions = prescriptions
            .filter(p => p.patientId === patient.id)
            .map(p => {
                const medicine = medicines.find(m => m.id === p.medicineId);
                return {
                    ...p,
                    medicineName: medicine ? `${medicine.standardizedMnn} ${medicine.standardizedDosage}` : 'н/д',
                }
            });
        return {
            ...patient,
            prescriptions: patientPrescriptions
        }
    })
  }, [patients, medicines, prescriptions]);
  
  const filteredData = useMemo(() => {
      return reportData.filter(patient => {
          return fioFilter ? patient.fio.toLowerCase().includes(fioFilter.toLowerCase()) : true;
      });
  }, [reportData, fioFilter]);
  
  const resetFilters = () => {
    setFioFilter('');
  }

  const handleExport = () => {
    const rows: string[] = [];
    filteredData.forEach(patient => {
        rows.push(`"${patient.fio}","${patient.attendingDoctor}","",""`);
        patient.prescriptions.forEach(p => {
            rows.push(`"","","${p.medicineName}","${p.annualRequirement.toFixed(2)}"`);
        })
    });

    const headers = ["Пациент", "Лечащий врач", "Препарат", "Годовая потребность (уп.)"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "patients_report.csv");
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
                <CardTitle>II. Отчет по пациентам</CardTitle>
                <CardDescription>Перечень препаратов, назначенных каждому пациенту.</CardDescription>
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
                <Input placeholder="Фильтр по ФИО..." value={fioFilter} onChange={e => setFioFilter(e.target.value)} className="lg:col-span-2" />
            </div>
             <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={resetFilters}><X className="mr-2 h-4 w-4" />Сбросить фильтры</Button>
            </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пациент</TableHead>
                <TableHead>Лечащий врач</TableHead>
                <TableHead>Препарат</TableHead>
                <TableHead>Годовая потребность (уп.)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? filteredData.map(patient => (
                <React.Fragment key={patient.id}>
                    <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">{patient.fio}</TableCell>
                        <TableCell className="font-bold">{patient.attendingDoctor}</TableCell>
                        <TableCell colSpan={2}></TableCell>
                    </TableRow>
                    {patient.prescriptions.length > 0 ? patient.prescriptions.map(p => (
                        <TableRow key={p.id}>
                            <TableCell colSpan={2} className="pl-8"></TableCell>
                            <TableCell>{p.medicineName}</TableCell>
                            <TableCell>{p.annualRequirement.toFixed(2)}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                           <TableCell colSpan={4} className="text-center text-muted-foreground">Нет назначений</TableCell>
                        </TableRow>
                    )}
                </React.Fragment>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Нет пациентов, соответствующих фильтрам.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
