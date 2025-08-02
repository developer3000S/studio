import type { Patient, Medicine, Prescription, Dispensation } from '@/types';

export const generateInitialData = () => {
    const rawPatients: Omit<Patient, 'id'>[] = [
      { fio: "Абаева Татьяна Петровна", birthYear: 1960, diagnosis: "K81.1-Хронический холецистит", attendingDoctor: "Сидорова Е.В." },
      { fio: "Абаева Татьяна Петровна", birthYear: 1960, diagnosis: "E11.7-Инсулиннезависимый сахарный диабет с множественными осложнениями", attendingDoctor: "Ачабаева Анна Васильевна" },
      { fio: "Абакумов Александр Викторович", birthYear: 1963, diagnosis: "H52.1-Миопия", attendingDoctor: "Иванов И.И." },
      { fio: "Иванов Иван Иванович", birthYear: 1980, diagnosis: "J45.9-Астма неуточненная", attendingDoctor: "Петров Петр Петрович" },
      { fio: "Сидорова Елена Васильевна", birthYear: 1975, diagnosis: "I10-Эссенциальная (первичная) гипертензия", attendingDoctor: "Ачабаева Анна Васильевна" },
    ];

    const initialPatients: Patient[] = rawPatients.map((p, i) => ({ ...p, id: `patient-${i + 1}`}));

    const rawMedicines: Omit<Medicine, 'id'>[] = [
      { smmnNodeCode: "21.20.10.236-000024-1-00114-0000000000000", section: "1 (а)", standardizedMnn: "АГОМЕЛАТИН", tradeNameVk: "-", standardizedDosageForm: "ТАБЛЕТКИ, ПОКРЫТЫЕ ОБОЛОЧКОЙ", standardizedDosage: "25 мг", characteristic: "-", packaging: 28, price: 1307.00 },
      { smmnNodeCode: "21.20.10.110-000008-1-00059-0000000000000", section: "5", standardizedMnn: "АДЕМЕТИОНИН", tradeNameVk: "-", standardizedDosageForm: "ТАБЛЕТКИ, ПОКРЫТЫЕ ОБОЛОЧКОЙ", standardizedDosage: "500 мг", characteristic: "-", packaging: 20, price: 1530.00 },
      { smmnNodeCode: "21,20,10,110-000008-1-00061-0000000000000", section: "5", standardizedMnn: "АДЕМЕТИОНИН", tradeNameVk: "-", standardizedDosageForm: "ТАБЛЕТКИ, ПОКРЫТЫЕ ОБОЛОЧКОЙ", standardizedDosage: "400 мг", characteristic: "-", packaging: 20, price: 692 },
      { smmnNodeCode: "N02BE01", section: "Анальгетики", standardizedMnn: "ПАРАЦЕТАМОЛ", tradeNameVk: "Парацетамол", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "500 мг", characteristic: "-", packaging: 10, price: 50.00 },
      { smmnNodeCode: "C09AA02", section: "Сердечно-сосудистые", standardizedMnn: "ЭНАЛАПРИЛ", tradeNameVk: "Энап", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "10 мг", characteristic: "-", packaging: 20, price: 120.00 },
    ];
    
    const initialMedicines: Medicine[] = rawMedicines.map((m, i) => ({ ...m, id: `med-${i+1}`}));
    
    const rawPrescriptions: Omit<Prescription, 'id'>[] = [
        { patientId: initialPatients[1].id, medicineId: initialMedicines[0].id, dailyDose: "1 таб/день", dailyConsumption: 1, annualRequirement: (1*365)/initialMedicines[0].packaging },
        { patientId: initialPatients[3].id, medicineId: initialMedicines[3].id, dailyDose: "по 1 таб. 2 раза в день", dailyConsumption: 2, annualRequirement: (2*365)/initialMedicines[3].packaging },
        { patientId: initialPatients[4].id, medicineId: initialMedicines[4].id, dailyDose: "1 таб. утром", dailyConsumption: 1, annualRequirement: (1*365)/initialMedicines[4].packaging },
        { patientId: initialPatients[0].id, medicineId: initialMedicines[1].id, dailyDose: "1 таб. в обед", dailyConsumption: 1, annualRequirement: (1*365)/initialMedicines[1].packaging },
    ];

    const initialPrescriptions: Prescription[] = rawPrescriptions.map((p, i) => ({ ...p, id: `presc-${i+1}`}));

    const rawDispensations: Omit<Dispensation, 'id'>[] = [
        { patientId: initialPatients[1].id, medicineId: initialMedicines[0].id, dispensationDate: "2024-01-15", quantity: 2 },
        { patientId: initialPatients[1].id, medicineId: initialMedicines[0].id, dispensationDate: "2024-03-20", quantity: 2 },
        { patientId: initialPatients[3].id, medicineId: initialMedicines[3].id, dispensationDate: "2024-02-01", quantity: 10 },
        { patientId: initialPatients[4].id, medicineId: initialMedicines[4].id, dispensationDate: "2024-05-10", quantity: 5 },
    ];

    const initialDispensations: Dispensation[] = rawDispensations.map((d, i) => ({ ...d, id: `disp-${i+1}`}));

    return {
        initialPatients,
        initialMedicines,
        initialPrescriptions,
        initialDispensations
    }
}
