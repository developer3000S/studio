'use client';

import type { Patient, Medicine, Prescription, Dispensation } from "@/types";
import { generateInitialData } from "@/lib/mock-data";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface AppContextType {
  patients: Patient[];
  medicines: Medicine[];
  prescriptions: Prescription[];
  dispensations: Dispensation[];
  loading: boolean;
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
  updatePatient: (patient: Patient) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  addMedicine: (medicine: Omit<Medicine, 'id'>) => Promise<void>;
  updateMedicine: (medicine: Medicine) => Promise<void>;
  deleteMedicine: (medicineId: string) => Promise<void>;
  addPrescription: (prescription: Omit<Prescription, 'id' | 'annualRequirement'> & { dailyConsumption: number }) => Promise<void>;
  updatePrescription: (prescription: Prescription) => Promise<void>;
  deletePrescription: (prescriptionId: string) => Promise<void>;
  addDispensation: (dispensation: Omit<Dispensation, 'id'>) => Promise<void>;
  updateDispensation: (dispensation: Dispensation) => Promise<void>;
  deleteDispensation: (dispensationId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const saveDataToLocalStorage = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Error saving to localStorage", error);
    }
}

const loadDataFromLocalStorage = (key: string, fallback: any) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.error("Error loading from localStorage", error);
        return fallback;
    }
}


export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [dispensations, setDispensations] = useState<Dispensation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const { initialPatients, initialMedicines, initialPrescriptions, initialDispensations } = generateInitialData();
    
    setPatients(loadDataFromLocalStorage('patients', initialPatients));
    setMedicines(loadDataFromLocalStorage('medicines', initialMedicines));
    setPrescriptions(loadDataFromLocalStorage('prescriptions', initialPrescriptions));
    setDispensations(loadDataFromLocalStorage('dispensations', initialDispensations));
    
    setLoading(false);
  }, []);

  useEffect(() => { saveDataToLocalStorage('patients', patients) }, [patients]);
  useEffect(() => { saveDataToLocalStorage('medicines', medicines) }, [medicines]);
  useEffect(() => { saveDataToLocalStorage('prescriptions', prescriptions) }, [prescriptions]);
  useEffect(() => { saveDataToLocalStorage('dispensations', dispensations) }, [dispensations]);


  // --- PATIENTS ---
  const addPatient = async (patientData: Omit<Patient, 'id'>) => {
    const newId = `patient-${Date.now()}`;
    const newPatient = { ...patientData, id: newId };
    setPatients(prev => [...prev, newPatient]);
  };

  const updatePatient = async (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const deletePatient = async (patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setPrescriptions(prev => prev.filter(p => p.patientId !== patientId));
    setDispensations(prev => prev.filter(d => d.patientId !== patientId));
  };
  
  // --- MEDICINES ---
 const addMedicine = async (medicineData: Omit<Medicine, 'id'>) => {
    const newId = `med-${Date.now()}`;
    const newMedicine = { ...medicineData, id: newId };
    setMedicines(prev => [...prev, newMedicine]);
  };

  const updateMedicine = async (updatedMedicine: Medicine) => {
    setMedicines(prev => prev.map(m => m.id === updatedMedicine.id ? updatedMedicine : m));
  };

  const deleteMedicine = async (medicineId: string) => {
    setMedicines(prev => prev.filter(m => m.id !== medicineId));
    setPrescriptions(prev => prev.filter(p => p.medicineId !== medicineId));
    setDispensations(prev => prev.filter(d => d.medicineId !== medicineId));
  };


  // --- PRESCRIPTIONS ---
 const addPrescription = async (data: Omit<Prescription, 'id' | 'annualRequirement'> & { dailyConsumption: number }) => {
    const medicine = medicines.find(m => m.id === data.medicineId);
    if (!medicine) {
      toast({ title: 'Ошибка', description: 'Медикамент не найден.', variant: 'destructive' });
      return;
    }
    const annualRequirement = (data.dailyConsumption * 365) / medicine.packaging;
    
    const existing = prescriptions.find(p => p.patientId === data.patientId && p.medicineId === data.medicineId);
    
    const prescriptionData = { ...data, annualRequirement };

    if (existing) {
       await updatePrescription({ ...existing, ...prescriptionData });
       toast({ title: 'Назначение обновлено', description: `Назначение для этого пациента и препарата уже существует. Данные были обновлены.` });
    } else {
       const newId = `presc-${Date.now()}`;
       const newPrescription = { ...prescriptionData, id: newId };
       setPrescriptions(prev => [...prev, newPrescription]);
       toast({ title: 'Назначение добавлено', description: 'Новое назначение было успешно добавлено.' });
    }
  };

  const updatePrescription = async (updatedPrescription: Prescription) => {
    setPrescriptions(prev => prev.map(p => p.id === updatedPrescription.id ? updatedPrescription : p));
  };
  
  const deletePrescription = async (prescriptionId: string) => {
    setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
  };
  
  // --- DISPENSATIONS ---
  const addDispensation = async (dispensationData: Omit<Dispensation, 'id'>) => {
    const newId = `disp-${Date.now()}`;
    const newDispensation = { ...dispensationData, id: newId };
    setDispensations(prev => [...prev, newDispensation]);
  };
  
  const updateDispensation = async (updatedDispensation: Dispensation) => {
    setDispensations(prev => prev.map(d => d.id === updatedDispensation.id ? updatedDispensation : d));
  };

  const deleteDispensation = async (dispensationId: string) => {
    setDispensations(prev => prev.filter(d => d.id !== dispensationId));
  };

  const value: AppContextType = {
    patients,
    medicines,
    prescriptions,
    dispensations,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    addPrescription,
    updatePrescription,
    deletePrescription,
    addDispensation,
    updateDispensation,
    deleteDispensation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
