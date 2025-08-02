
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type StatusFilter = "all" | "met" | "unmet";

export function PrescriptionsReport() {
  const { patients, medicines, prescriptions, dispensations } = useAppContext();
  
  const [patientFilter, setPatientFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [medicineFilter, setMedicineFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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
  
  const filteredData = useMemo(() => {
      return reportData.filter(item => {
          const patientMatch = patientFilter ? item.patientName.toLowerCase().includes(patientFilter.toLowerCase()) : true;
          const doctorMatch = doctorFilter ? item.doctor.toLowerCase().includes(doctorFilter.toLowerCase()) : true;
          const medicineMatch = medicineFilter ? item.medicineName.toLowerCase().includes(medicineFilter.toLowerCase()) : true;
          const statusMatch = statusFilter === 'all' 
            || (statusFilter === 'met' && item.remainingNeed <= 0)
            || (statusFilter === 'unmet' && item.remainingNeed > 0);
          
          return patientMatch && doctorMatch && medicineMatch && statusMatch;
      })
  }, [reportData, patientFilter, doctorFilter, medicineFilter, statusFilter]);

  const handleExport = () => {
    const headers = [
        "Пациент", "Лечащий врач", "Диагноз", "Препарат", "Назначение", 
        "Годовая потребность (уп.)", "Выдано (уп.)", "Остаток (уп.)", "Статус"
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...filteredData.map(item => [
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
  
  const resetFilters = () => {
      setPatientFilter('');
      setDoctorFilter('');
      setMedicineFilter('');
      setStatusFilter('all');
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>III. Отчет по назначениям</CardTitle>
                <CardDescription>Детальная информация по каждому назначению.</CardDescription>
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
                <Input placeholder="Фильтр по пациенту..." value={patientFilter} onChange={e => setPatientFilter(e.target.value)} />
                <Input placeholder="Фильтр по врачу..." value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)} />
                <Input placeholder="Фильтр по препарату..." value={medicineFilter} onChange={e => setMedicineFilter(e.target.value)} />
                 <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Фильтр по статусу" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="met">Потребность удовлетворена</SelectItem>
                        <SelectItem value="unmet">Требуется выдача</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={resetFilters}><X className="mr-2 h-4 w-4" />Сбросить фильтры</Button>
            </div>
        </div>
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
              {filteredData.length > 0 ? filteredData.map(item => (
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
                  <TableCell colSpan={5} className="h-24 text-center">Нет данных, соответствующих фильтрам.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
