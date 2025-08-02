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
import React from 'react';

export function PatientsReport() {
  const { patients, medicines, prescriptions } = useAppContext();

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

  const handleExport = () => {
    const rows: string[] = [];
    reportData.forEach(patient => {
        rows.push(`"${patient.fio}","",""`);
        patient.prescriptions.forEach(p => {
            rows.push(`"","${p.medicineName}","${p.annualRequirement.toFixed(2)}"`);
        })
    });

    const headers = ["Пациент", "Препарат", "Годовая потребность (уп.)"];
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
                <TableHead>Пациент</TableHead>
                <TableHead>Препарат</TableHead>
                <TableHead>Годовая потребность (уп.)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length > 0 ? reportData.map(patient => (
                <React.Fragment key={patient.id}>
                    <TableRow className="bg-muted/50">
                        <TableCell colSpan={3} className="font-bold">{patient.fio}</TableCell>
                    </TableRow>
                    {patient.prescriptions.length > 0 ? patient.prescriptions.map(p => (
                        <TableRow key={p.id}>
                            <TableCell className="pl-8"></TableCell>
                            <TableCell>{p.medicineName}</TableCell>
                            <TableCell>{p.annualRequirement.toFixed(2)}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                           <TableCell colSpan={3} className="text-center text-muted-foreground">Нет назначений</TableCell>
                        </TableRow>
                    )}
                </React.Fragment>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">Нет пациентов для отчета.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
