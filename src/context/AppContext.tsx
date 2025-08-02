'use client';

import type { Patient, Medicine, Prescription, Dispensation } from "@/types";
import { generateInitialData } from "@/lib/mock-data";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AppContextType {
  patients: Patient[];
  medicines: Medicine[];
  prescriptions: Prescription[];
  dispensations: Dispensation[];
  loading: boolean;
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (patient: Patient) => void;
  deletePatient: (patientId: string) => void;
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicine: (medicine: Medicine) => void;
  deleteMedicine: (medicineId: string) => void;
  addPrescription: (prescription: Omit<Prescription, 'id' | 'annualRequirement'>) => void;
  updatePrescription: (prescription: Prescription) => void;
  deletePrescription: (prescriptionId: string) => void;
  addDispensation: (dispensation: Omit<Dispensation, 'id'>) => void;
  updateDispensation: (dispensation: Dispensation) => void;
  deleteDispensation: (dispensationId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // This effect runs only on the client, after the initial render.
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            } else {
                 // If no item in localStorage, set the initial value in localStorage
                window.localStorage.setItem(key, JSON.stringify(initialValue));
            }
        } catch (error) {
            console.log(`Error reading from localStorage key "${key}":`, error);
            // If error, still use the initial value
        } finally {
            setIsInitialized(true);
        }
    }, [key]);

    const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
             if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.log(`Error writing to localStorage key "${key}":`, error);
        }
    };
    
    // Return the stored value only after it has been initialized from localStorage
    return [isInitialized ? storedValue : initialValue, setValue];
};


export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { initialPatients, initialMedicines, initialPrescriptions, initialDispensations } = generateInitialData();
  
  const [patients, setPatients] = useLocalStorage<Patient[]>("patients", initialPatients);
  const [medicines, setMedicines] = useLocalStorage<Medicine[]>("medicines", initialMedicines);
  const [prescriptions, setPrescriptions] = useLocalStorage<Prescription[]>("prescriptions", initialPrescriptions);
  const [dispensations, setDispensations] = useLocalStorage<Dispensation[]>("dispensations", initialDispensations);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect ensures we only stop loading on the client-side,
    // preventing hydration mismatches.
    setLoading(false);
  }, []);

  // --- PATIENTS ---
  const addPatient = (patient: Omit<Patient, 'id'>) => {
    const newPatient = { ...patient, id: Date.now().toString() };
    setPatients(prev => [...prev, newPatient]);
  };

  const updatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const deletePatient = (patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setPrescriptions(prev => prev.filter(p => p.patientId !== patientId));
    setDispensations(prev => prev.filter(d => d.patientId !== patientId));
  };
  
  // --- MEDICINES ---
  const addMedicine = (medicine: Omit<Medicine, 'id'>) => {
    const newMedicine = { ...medicine, id: Date.now().toString() };
    setMedicines(prev => [...prev, newMedicine]);
  };

  const updateMedicine = (updatedMedicine: Medicine) => {
    setMedicines(prev => prev.map(m => m.id === updatedMedicine.id ? updatedMedicine : m));
  };

  const deleteMedicine = (medicineId: string) => {
    setMedicines(prev => prev.filter(m => m.id !== medicineId));
    setPrescriptions(prev => prev.filter(p => p.medicineId !== medicineId));
    setDispensations(prev => prev.filter(d => d.medicineId !== medicineId));
  };

  // --- PRESCRIPTIONS ---
  const addPrescription = (prescription: Omit<Prescription, 'id' | 'annualRequirement'>) => {
    const medicine = medicines.find(m => m.id === prescription.medicineId);
    if (!medicine) {
      toast({ title: 'Ошибка', description: 'Медикамент не найден.', variant: 'destructive' });
      return;
    }
    const annualRequirement = (prescription.dailyConsumption * 365) / medicine.packaging;

    const existing = prescriptions.find(p => p.patientId === prescription.patientId && p.medicineId === prescription.medicineId);

    if (existing) {
       toast({
          title: 'Назначение обновлено',
          description: `Назначение для этого пациента и препарата уже существует. Данные были обновлены.` 
      });
      updatePrescription({ ...existing, ...prescription, annualRequirement });
    } else {
       toast({
          title: 'Назначение добавлено',
          description: 'Новое назначение было успешно добавлено.',
      });
      const newPrescription = { ...prescription, annualRequirement, id: Date.now().toString() };
      setPrescriptions(prev => [...prev, newPrescription]);
    }
  };

  const updatePrescription = (updatedPrescription: Prescription) => {
    setPrescriptions(prev => prev.map(p => p.id === updatedPrescription.id ? updatedPrescription : p));
  };
  
  const deletePrescription = (prescriptionId: string) => {
    setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
  };
  
  // --- DISPENSATIONS ---
  const addDispensation = (dispensation: Omit<Dispensation, 'id'>) => {
    const newDispensation = { ...dispensation, id: Date.now().toString() };
    setDispensations(prev => [...prev, newDispensation]);
  };
  
  const updateDispensation = (updatedDispensation: Dispensation) => {
    setDispensations(prev => prev.map(d => d.id === updatedDispensation.id ? updatedDispensation : d));
  };

  const deleteDispensation = (dispensationId: string) => {
    setDispensations(prev => prev.filter(d => d.id !== dispensationId));
  };

  const value = {
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
