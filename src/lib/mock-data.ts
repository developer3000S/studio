import type { Patient, Medicine, Prescription, Dispensation } from '@/types';

export const generateInitialData = () => {
    const rawPatients: Omit<Patient, 'id'>[] = [
      { fio: "Иванов Иван Иванович", birthYear: 1960, diagnosis: "I10-Эссенциальная гипертензия", attendingDoctor: "Петрова М.А." },
      { fio: "Петрова Анна Сергеевна", birthYear: 1975, diagnosis: "E11.9-Инсулиннезависимый сахарный диабет", attendingDoctor: "Сидоров В.В." },
      { fio: "Сидоров Василий Петрович", birthYear: 1955, diagnosis: "J45.9-Астма неуточненная", attendingDoctor: "Козлова Е.И." },
      { fio: "Козлова Елена Игоревна", birthYear: 1982, diagnosis: "K29.7-Гастрит неуточненный", attendingDoctor: "Михайлов А.С." },
      { fio: "Михайлов Алексей Степанович", birthYear: 1990, diagnosis: "M19.9-Артроз неуточненный", attendingDoctor: "Васильева О.П." },
      { fio: "Васильева Ольга Петровна", birthYear: 1968, diagnosis: "I25.1-Атеросклеротическая болезнь сердца", attendingDoctor: "Петрова М.А." },
      { fio: "Зайцев Андрей Викторович", birthYear: 1988, diagnosis: "G43.9-Мигрень неуточненная", attendingDoctor: "Сидоров В.В." },
      { fio: "Соколова Мария Дмитриевна", birthYear: 1995, diagnosis: "L20.9-Атопический дерматит неуточненный", attendingDoctor: "Козлова Е.И." },
      { fio: "Попов Дмитрий Александрович", birthYear: 1971, diagnosis: "I10-Эссенциальная гипертензия", attendingDoctor: "Михайлов А.С." },
      { fio: "Лебедева Ирина Владимировна", birthYear: 1965, diagnosis: "E11.8-Инсулиннезависимый сахарный диабет с осложнениями", attendingDoctor: "Васильева О.П." },
      { fio: "Новиков Сергей Павлович", birthYear: 1958, diagnosis: "J44.9-Хроническая обструктивная легочная болезнь", attendingDoctor: "Петрова М.А." },
      { fio: "Морозова Анастасия Юрьевна", birthYear: 1985, diagnosis: "K21.9-Гастроэзофагеальный рефлюкс без эзофагита", attendingDoctor: "Сидоров В.В." },
      { fio: "Волков Артем Геннадьевич", birthYear: 1992, diagnosis: "M54.5-Боль внизу спины", attendingDoctor: "Козлова Е.И." },
      { fio: "Дмитриева Светлана Олеговна", birthYear: 1979, diagnosis: "F32.9-Депрессивный эпизод неуточненный", attendingDoctor: "Михайлов А.С." },
      { fio: "Кузнецов Павел Андреевич", birthYear: 1963, diagnosis: "I20.9-Стенокардия неуточненная", attendingDoctor: "Васильева О.П." },
      { fio: "Орлова Екатерина Денисовна", birthYear: 1980, diagnosis: "N18.9-Хроническая почечная недостаточность", attendingDoctor: "Петрова М.А." },
      { fio: "Белов Константин Романович", birthYear: 1977, diagnosis: "E78.5-Гиперлипидемия неуточненная", attendingDoctor: "Сидоров В.В." },
      { fio: "Калинина Вероника Станиславовна", birthYear: 1998, diagnosis: "H52.1-Миопия", attendingDoctor: "Козлова Е.И." },
      { fio: "Максимов Егор Алексеевич", birthYear: 1951, diagnosis: "G20-Болезнь Паркинсона", attendingDoctor: "Михайлов А.С." },
      { fio: "Федорова Любовь Борисовна", birthYear: 1949, diagnosis: "M05.9-Серопозитивный ревматоидный артрит", attendingDoctor: "Васильева О.П." }
    ];
    const initialPatients: Patient[] = rawPatients.map((p, i) => ({ ...p, id: `patient-${i + 1}`}));

    const rawMedicines: Omit<Medicine, 'id'>[] = [
      { smmnNodeCode: "C09AA02", section: "Сердечно-сосудистые", standardizedMnn: "ЭНАЛАПРИЛ", tradeNameVk: "Энап", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "10 мг", characteristic: "-", packaging: 20, price: 120.00 },
      { smmnNodeCode: "A10BA02", section: "Противодиабетические", standardizedMnn: "МЕТФОРМИН", tradeNameVk: "Глюкофаж", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "1000 мг", characteristic: "-", packaging: 60, price: 350.00 },
      { smmnNodeCode: "R03AC02", section: "Дыхательная система", standardizedMnn: "САЛЬБУТАМОЛ", tradeNameVk: "Вентолин", standardizedDosageForm: "АЭРОЗОЛЬ", standardizedDosage: "100 мкг/доза", characteristic: "200 доз", packaging: 1, price: 150.00 },
      { smmnNodeCode: "A02BC01", section: "Пищеварительный тракт", standardizedMnn: "ОМЕПРАЗОЛ", tradeNameVk: "Омез", standardizedDosageForm: "КАПСУЛЫ", standardizedDosage: "20 мг", characteristic: "-", packaging: 30, price: 180.00 },
      { smmnNodeCode: "M01AE01", section: "Противовоспалительные", standardizedMnn: "ИБУПРОФЕН", tradeNameVk: "Нурофен", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "400 мг", characteristic: "-", packaging: 20, price: 250.00 },
      { smmnNodeCode: "C10AA01", section: "Сердечно-сосудистые", standardizedMnn: "СИМВАСТАТИН", tradeNameVk: "Зокор", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "20 мг", characteristic: "-", packaging: 28, price: 400.00 },
      { smmnNodeCode: "N02BE01", section: "Анальгетики", standardizedMnn: "ПАРАЦЕТАМОЛ", tradeNameVk: "Панадол", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "500 мг", characteristic: "-", packaging: 12, price: 70.00 },
      { smmnNodeCode: "D07AC01", section: "Дерматологические", standardizedMnn: "БЕТАМЕТАЗОН", tradeNameVk: "Целестодерм", standardizedDosageForm: "КРЕМ", standardizedDosage: "0.1%", characteristic: "30 г", packaging: 1, price: 500.00 },
      { smmnNodeCode: "C07AB02", section: "Сердечно-сосудистые", standardizedMnn: "МЕТОПРОЛОЛ", tradeNameVk: "Беталок ЗОК", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "50 мг", characteristic: "-", packaging: 30, price: 320.00 },
      { smmnNodeCode: "A10BB01", section: "Противодиабетические", standardizedMnn: "ГЛИБЕНКЛАМИД", tradeNameVk: "Манинил", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "5 мг", characteristic: "-", packaging: 120, price: 150.00 },
      { smmnNodeCode: "R03BA02", section: "Дыхательная система", standardizedMnn: "БУДЕСОНИД", tradeNameVk: "Пульмикорт", standardizedDosageForm: "СУСПЕНЗИЯ Д/ИНГАЛЯЦИЙ", standardizedDosage: "0.5 мг/мл", characteristic: "2 мл", packaging: 20, price: 1300.00 },
      { smmnNodeCode: "A02BC02", section: "Пищеварительный тракт", standardizedMnn: "ПАНТОПРАЗОЛ", tradeNameVk: "Нольпаза", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "40 мг", characteristic: "-", packaging: 28, price: 550.00 },
      { smmnNodeCode: "M01AB05", section: "Противовоспалительные", standardizedMnn: "ДИКЛОФЕНАК", tradeNameVk: "Вольтарен", standardizedDosageForm: "ГЕЛЬ", standardizedDosage: "1%", characteristic: "50 г", packaging: 1, price: 450.00 },
      { smmnNodeCode: "N06AB06", section: "Антидепрессанты", standardizedMnn: "СЕРТРАЛИН", tradeNameVk: "Золофт", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "50 мг", characteristic: "-", packaging: 28, price: 800.00 },
      { smmnNodeCode: "C08CA01", section: "Сердечно-сосудистые", standardizedMnn: "АМЛОДИПИН", tradeNameVk: "Норваск", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "5 мг", characteristic: "-", packaging: 30, price: 200.00 },
      { smmnNodeCode: "B01AA03", section: "Антикоагулянты", standardizedMnn: "ВАРФАРИН", tradeNameVk: "Варфарин", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "2.5 мг", characteristic: "-", packaging: 100, price: 250.00 },
      { smmnNodeCode: "C10AA05", section: "Сердечно-сосудистые", standardizedMnn: "АТОРВАСТАТИН", tradeNameVk: "Липримар", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "20 мг", characteristic: "-", packaging: 30, price: 700.00 },
      { smmnNodeCode: "S01EE01", section: "Офтальмологические", standardizedMnn: "ЛАТАНОПРОСТ", tradeNameVk: "Ксалатан", standardizedDosageForm: "КАПЛИ ГЛАЗНЫЕ", standardizedDosage: "0.005%", characteristic: "2.5 мл", packaging: 1, price: 650.00 },
      { smmnNodeCode: "N04BA02", section: "Противопаркинсонические", standardizedMnn: "ЛЕВОДОПА + КАРБИДОПА", tradeNameVk: "Наком", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "250 мг + 25 мг", characteristic: "-", packaging: 100, price: 1200.00 },
      { smmnNodeCode: "L04AA13", section: "Иммунодепрессанты", standardizedMnn: "ЛЕФЛУНОМИД", tradeNameVk: "Арава", standardizedDosageForm: "ТАБЛЕТКИ", standardizedDosage: "20 мг", characteristic: "-", packaging: 30, price: 2500.00 }
    ];
    const initialMedicines: Medicine[] = rawMedicines.map((m, i) => ({ ...m, id: `med-${i+1}`}));
    
    const rawPrescriptions: Omit<Prescription, 'id'>[] = [
      { patientId: "patient-1", medicineId: "med-1", dailyDose: "1 таб. утром", dailyConsumption: 1, annualRequirement: (1*365)/20 },
      { patientId: "patient-2", medicineId: "med-2", dailyDose: "1 таб. 2 раза в день", dailyConsumption: 2, annualRequirement: (2*365)/60 },
      { patientId: "patient-3", medicineId: "med-3", dailyDose: "2 ингаляции по необх.", dailyConsumption: 2, annualRequirement: (2*365)/200 },
      { patientId: "patient-4", medicineId: "med-4", dailyDose: "1 капс. утром", dailyConsumption: 1, annualRequirement: (1*365)/30 },
      { patientId: "patient-5", medicineId: "med-5", dailyDose: "1 таб. при болях", dailyConsumption: 0.5, annualRequirement: (0.5*365)/20 },
      { patientId: "patient-6", medicineId: "med-6", dailyDose: "1 таб. на ночь", dailyConsumption: 1, annualRequirement: (1*365)/28 },
      { patientId: "patient-7", medicineId: "med-7", dailyDose: "1 таб. при t", dailyConsumption: 0.2, annualRequirement: (0.2*365)/12 },
      { patientId: "patient-8", medicineId: "med-8", dailyDose: "наносить 2 раза в день", dailyConsumption: 0.1, annualRequirement: (0.1*365)/1 },
      { patientId: "patient-9", medicineId: "med-9", dailyDose: "1 таб. утром", dailyConsumption: 1, annualRequirement: (1*365)/30 },
      { patientId: "patient-10", medicineId: "med-10", dailyDose: "1 таб. утром", dailyConsumption: 1, annualRequirement: (1*365)/120 },
      { patientId: "patient-11", medicineId: "med-11", dailyDose: "1 ингаляция 2 раза в день", dailyConsumption: 2, annualRequirement: (2*365)/20 },
      { patientId: "patient-12", medicineId: "med-12", dailyDose: "1 таб. перед сном", dailyConsumption: 1, annualRequirement: (1*365)/28 },
      { patientId: "patient-13", medicineId: "med-13", dailyDose: "наносить на бол. место", dailyConsumption: 0.2, annualRequirement: (0.2*365)/1 },
      { patientId: "patient-14", medicineId: "med-14", dailyDose: "1 таб. утром", dailyConsumption: 1, annualRequirement: (1*365)/28 },
      { patientId: "patient-15", medicineId: "med-15", dailyDose: "1 таб. 2 раза в день", dailyConsumption: 2, annualRequirement: (2*365)/30 },
      { patientId: "patient-16", medicineId: "med-16", dailyDose: "1 таб. по схеме", dailyConsumption: 1, annualRequirement: (1*365)/100 },
      { patientId: "patient-17", medicineId: "med-17", dailyDose: "1 таб. на ночь", dailyConsumption: 1, annualRequirement: (1*365)/30 },
      { patientId: "patient-18", medicineId: "med-18", dailyDose: "1 капля в оба глаза", dailyConsumption: 2, annualRequirement: (2*365)/50 }, // Approximation
      { patientId: "patient-19", medicineId: "med-19", dailyDose: "1/2 таб. 3 раза в день", dailyConsumption: 1.5, annualRequirement: (1.5*365)/100 },
      { patientId: "patient-20", medicineId: "med-20", dailyDose: "1 таб. в день", dailyConsumption: 1, annualRequirement: (1*365)/30 }
    ];
    const initialPrescriptions: Prescription[] = rawPrescriptions.map((p, i) => ({ ...p, id: `presc-${i+1}`}));
    
    function randomDate(start: Date, end: Date) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    const rawDispensations: Omit<Dispensation, 'id'>[] = [
      { patientId: "patient-1", medicineId: "med-1", dispensationDate: "2024-01-15", quantity: 2 },
      { patientId: "patient-2", medicineId: "med-2", dispensationDate: "2024-02-20", quantity: 1 },
      { patientId: "patient-3", medicineId: "med-3", dispensationDate: "2024-03-10", quantity: 1 },
      { patientId: "patient-4", medicineId: "med-4", dispensationDate: "2024-04-05", quantity: 3 },
      { patientId: "patient-5", medicineId: "med-5", dispensationDate: "2024-05-25", quantity: 1 },
      { patientId: "patient-6", medicineId: "med-6", dispensationDate: "2024-06-18", quantity: 2 },
      { patientId: "patient-1", medicineId: "med-1", dispensationDate: "2024-03-15", quantity: 2 },
      { patientId: "patient-2", medicineId: "med-2", dispensationDate: "2024-04-20", quantity: 1 },
      { patientId: "patient-11", medicineId: "med-11", dispensationDate: "2023-12-01", quantity: 2 },
      { patientId: "patient-12", medicineId: "med-12", dispensationDate: "2024-01-10", quantity: 1 },
      { patientId: "patient-13", medicineId: "med-13", dispensationDate: "2024-02-14", quantity: 1 },
      { patientId: "patient-14", medicineId: "med-14", dispensationDate: "2024-03-22", quantity: 2 },
      { patientId: "patient-15", medicineId: "med-15", dispensationDate: "2024-04-30", quantity: 1 },
      { patientId: "patient-16", medicineId: "med-16", dispensationDate: "2024-05-19", quantity: 1 },
      { patientId: "patient-17", medicineId: "med-17", dispensationDate: "2024-06-21", quantity: 3 },
      { patientId: "patient-19", medicineId: "med-19", dispensationDate: "2024-01-28", quantity: 1 },
      { patientId: "patient-20", medicineId: "med-20", dispensationDate: "2024-02-15", quantity: 2 },
      { patientId: "patient-11", medicineId: "med-11", dispensationDate: "2024-02-01", quantity: 2 },
      { patientId: "patient-15", medicineId: "med-15", dispensationDate: "2024-06-30", quantity: 1 },
      { patientId: "patient-10", medicineId: "med-10", dispensationDate: "2024-05-01", quantity: 1 }
    ];

    const initialDispensations: Dispensation[] = rawDispensations.map((d, i) => ({ 
        ...d, 
        id: `disp-${i+1}`,
        dispensationDate: d.dispensationDate || format(randomDate(new Date(2023, 0, 1), new Date()), 'yyyy-MM-dd')
    }));

    return {
        initialPatients,
        initialMedicines,
        initialPrescriptions,
        initialDispensations
    }
}
