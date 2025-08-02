import type { Patient, Medicine, Prescription, Dispensation } from '@/types';

export const initialPatients: Patient[] = [
  { id: 1, fio: "Абаева Татьяна Петровна", birthYear: 1960, diagnosis: "K81.1-Хронический холецистит", attendingDoctor: "н/д" },
  { id: 2, fio: "Абаева Татьяна Петровна", birthYear: 1960, diagnosis: "E11.7-Инсулиннезависимый сахарный диабет с множественными осложнениями", attendingDoctor: "Ачабаева Анна Васильевна" },
  { id: 3, fio: "Абакумов Александр Викторович", birthYear: 1963, diagnosis: "H52.1-Миопия", attendingDoctor: "н/д" },
  { id: 4, fio: "Иванов Иван Иванович", birthYear: 1980, diagnosis: "J45.9-Астма неуточненная", attendingDoctor: "Петров Петр Петрович" },
  { id: 5, fio: "Сидорова Елена Васильевна", birthYear: 1975, diagnosis: "I10-Эссенциальная (первичная) гипертензия", attendingDoctor: "Ачабаева Анна Васильевна" },
];

export const initialMedicines: Medicine[] = [
  { id: 1, smmnNodeCode: "21.20.10.236-000024-1-00114-0000000000000", section: "1 (а)", standardizedMnn: "АГОМЕЛАТИН", tradeNameVk: "-", standardizedDosageForm: "ТАБЛЕТКИ, ПОКРЫТЫЕ ОБОЛОЧКОЙ", standardizedDosage: "25 мг", characteristic: "-", packaging: 28, price: 1307.00 },
  { id: 2, smmnNodeCode: "21.20.10.110-000008-1-00059-0000000000000", section: "5", standardizedMnn: "АДЕМЕТИОНИН", tradeNameVk: "-", standardizedDosageForm: "ТАБЛЕТКИ, ПОКРЫТЫЕ ОБОЛОЧКОЙ", standardizedDosage: "500 мг", characteristic: "-", packaging: 20, price: 1530.00 },
  { id: 3, smmnNodeCode: "21,20,10,110-000008-1-00061-0000000000000", section: "5", standardizedMnn: "АДЕМЕТИОНИН", tradeNameVk: "-", standardizedDosageForm: "ТАБЛЕТКИ, ПОКРЫТЫЕ ОБОЛОЧКОЙ", standardizedDosage: "400 мг", characteristic: "-", packaging: 20, price: 692 },
  { id: 4, smmnNodeCode: "N02BE01", section: "Анальгетики", standardizedMnn: "ПАРАЦЕТАМОЛ", tradeNameVk: "Парацетамол", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "500 мг", characteristic: "-", packaging: 10, price: 50.00 },
  { id: 5, smmnNodeCode: "C09AA02", section: "Сердечно-сосудистые", standardizedMnn: "ЭНАЛАПРИЛ", tradeNameVk: "Энап", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "10 мг", characteristic: "-", packaging: 20, price: 120.00 },
];

export const initialPrescriptions: Prescription[] = [
    { id: 1, patientId: 2, medicineId: 1, dailyDose: "1 таб/день", dailyConsumption: 1, annualRequirement: 13.04 },
    { id: 2, patientId: 4, medicineId: 4, dailyDose: "по 1 таб. 2 раза в день", dailyConsumption: 2, annualRequirement: 73 },
    { id: 3, patientId: 5, medicineId: 5, dailyDose: "1 таб. утром", dailyConsumption: 1, annualRequirement: 18.25 },
    { id: 4, patientId: 1, medicineId: 2, dailyDose: "1 таб. в обед", dailyConsumption: 1, annualRequirement: 18.25 },
];

export const initialDispensations: Dispensation[] = [
    { id: 1, patientId: 2, medicineId: 1, dispensationDate: "2024-01-15", quantity: 2 },
    { id: 2, patientId: 2, medicineId: 1, dispensationDate: "2024-03-20", quantity: 2 },
    { id: 3, patientId: 4, medicineId: 4, dispensationDate: "2024-02-01", quantity: 10 },
    { id: 4, patientId: 5, medicineId: 5, dispensationDate: "2024-05-10", quantity: 5 },
];
