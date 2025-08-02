export interface Patient {
  id: number;
  fio: string;
  birthYear: number;
  diagnosis: string;
  attendingDoctor: string;
}

export interface Medicine {
  id: number;
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
  id: number;
  patientId: number;
  medicineId: number;
  dailyDose: string; // текстовое описание
  dailyConsumption: number; // числовой расход в сутки для расчета
  annualRequirement: number;
}

export interface Dispensation {
  id: number;
  patientId: number;
  medicineId: number;
  dispensationDate: string;
  quantity: number;
}
