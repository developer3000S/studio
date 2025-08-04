export interface User {
  id: string;
  email: string;
}

export interface Patient {
  id: string;
  fio: string;
  birthYear: number;
  diagnosis: string;
  attendingDoctor: string;
}

export interface Medicine {
  id: string;
  smmnNodeCode: string;
  section: string;
  standardizedMnn: string;
  tradeNameVk: string;
  standardizedDosageForm: string;
  standardizedDosage: string;
  characteristic: string;
  packaging: number;
  price: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  medicineId: string;
  dailyDose: string; // текстовое описание
  dailyConsumption: number; // числовой расход в сутки для расчета
  annualRequirement: number;
}

export interface Dispensation {
  id: string;
  patientId: string;
  medicineId: string;
  dispensationDate: string;
  quantity: number;
}
