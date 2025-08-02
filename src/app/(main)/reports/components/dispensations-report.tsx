
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

export function DispensationsReport() {
  const { dispensations, patients, medicines } = useAppContext();
  
  const [patientFilter, setPatientFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [medicineFilter, setMedicineFilter] = useState('');
  const [dateRange, setDateRange] = useState<{from?: Date, to?: Date}>({});


  const reportData = useMemo(() => {
    return dispensations.map(d => {
        const patient = patients.find(p => p.id === d.patientId);
        const medicine = medicines.find(m => m.id === d.medicineId);
        return {
            ...d,
            patientName: patient?.fio || 'н/д',
            doctor: patient?.attendingDoctor || 'н/д',
            medicineName: medicine ? `${medicine.standardizedMnn} ${medicine.standardizedDosage}` : 'н/д',
            dispensationDateFormatted: format(new Date(d.dispensationDate), 'dd.MM.yyyy')
        }
    }).sort((a,b) => new Date(b.dispensationDate).getTime() - new Date(a.dispensationDate).getTime());
  }, [dispensations, patients, medicines]);
  
  const filteredData = useMemo(() => {
    return reportData.filter(item => {
        const itemDate = new Date(item.dispensationDate);
        const fromDate = dateRange.from ? new Date(dateRange.from.setHours(0,0,0,0)) : null;
        const toDate = dateRange.to ? new Date(dateRange.to.setHours(23,59,59,999)) : null;

        const dateMatch = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
        const patientMatch = patientFilter ? item.patientName.toLowerCase().includes(patientFilter.toLowerCase()) : true;
        const doctorMatch = doctorFilter ? item.doctor.toLowerCase().includes(doctorFilter.toLowerCase()) : true;
        const medicineMatch = medicineFilter ? item.medicineName.toLowerCase().includes(medicineFilter.toLowerCase()) : true;

        return dateMatch && patientMatch && doctorMatch && medicineMatch;
    });
  }, [reportData, dateRange, patientFilter, doctorFilter, medicineFilter]);

  const handleExport = () => {
    const headers = [
        "Дата выдачи", "Пациент", "Лечащий врач", "Препарат", "Количество (уп.)"
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [
        headers.join(","), 
        ...filteredData.map(item => [
          `"${item.dispensationDateFormatted}"`,
          `"${item.patientName}"`,
          `"${item.doctor}"`,
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
  
  const resetFilters = () => {
      setPatientFilter('');
      setDoctorFilter('');
      setMedicineFilter('');
      setDateRange({});
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>V. Отчет по выдачам</CardTitle>
                <CardDescription>Хронологический журнал выдачи препаратов.</CardDescription>
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
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                             {dateRange.from ? 
                                (dateRange.to ? `${format(dateRange.from, "dd.MM.yy")} - ${format(dateRange.to, "dd.MM.yy")}` : format(dateRange.from, "dd.MM.yyyy")) 
                                : "Выберите диапазон дат"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            locale={ru}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={resetFilters}><X className="mr-2 h-4 w-4" />Сбросить фильтры</Button>
            </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата выдачи</TableHead>
                <TableHead>Пациент</TableHead>
                <TableHead>Лечащий врач</TableHead>
                <TableHead>Препарат</TableHead>
                <TableHead>Количество (уп.)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? filteredData.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.dispensationDateFormatted}</TableCell>
                  <TableCell className="font-medium">{item.patientName}</TableCell>
                  <TableCell>{item.doctor}</TableCell>
                  <TableCell>{item.medicineName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Нет данных о выдачах, соответствующих фильтрам.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
