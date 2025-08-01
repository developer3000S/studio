"use client";

import type { Patient, Medicine, Prescription, Dispensation } from "@/types";
import { initialPatients, initialMedicines, initialPrescriptions, initialDispensations } from "@/lib/mock-data";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  patients: Patient[];
  medicines: Medicine[];
  prescriptions: Prescription[];
  dispensations: Dispensation[];
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (patient: Patient) => void;
  deletePatient: (patientId: number) => void;
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicine: (medicine: Medicine) => void;
  deleteMedicine: (medicineId: number) => void;
  addPrescription: (prescription: Omit<Prescription, 'id'>) => void;
  updatePrescription: (prescription: Prescription) => void;
  deletePrescription: (prescriptionId: number) => void;
  addDispensation: (dispensation: Omit<Dispensation, 'id'>) => void;
  updateDispensation: (dispensation: Dispensation) => void;
  deleteDispensation: (dispensationId: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
  const [dispensations, setDispensations] = useState<Dispensation[]>(initialDispensations);

  const addPatient = (patient: Omit<Patient, 'id'>) => {
    setPatients(prev => [...prev, { ...patient, id: Date.now() }]);
  };

  const updatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const deletePatient = (patientId: number) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setPrescriptions(prev => prev.filter(p => p.patientId !== patientId));
    setDispensations(prev => prev.filter(d => d.patientId !== patientId));
  };
  
  const addMedicine = (medicine: Omit<Medicine, 'id'>) => {
    setMedicines(prev => [...prev, { ...medicine, id: Date.now() }]);
  };

  const updateMedicine = (updatedMedicine: Medicine) => {
    setMedicines(prev => prev.map(m => m.id === updatedMedicine.id ? updatedMedicine : m));
  };

  const deleteMedicine = (medicineId: number) => {
    setMedicines(prev => prev.filter(m => m.id !== medicineId));
    setPrescriptions(prev => prev.filter(p => p.medicineId !== medicineId));
    setDispensations(prev => prev.filter(d => d.medicineId !== medicineId));
  };

  const addPrescription = (prescription: Omit<Prescription, 'id'>) => {
    setPrescriptions(prev => [...prev, { ...prescription, id: Date.now() }]);
  };

  const updatePrescription = (updatedPrescription: Prescription) => {
    setPrescriptions(prev => prev.map(p => p.id === updatedPrescription.id ? updatedPrescription : p));
  };
  
  const deletePrescription = (prescriptionId: number) => {
    setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
  };
  
  const addDispensation = (dispensation: Omit<Dispensation, 'id'>) => {
    setDispensations(prev => [...prev, { ...dispensation, id: Date.now() }]);
  };
  
  const updateDispensation = (updatedDispensation: Dispensation) => {
    setDispensations(prev => prev.map(d => d.id === updatedDispensation.id ? updatedDispensation : d));
  };

  const deleteDispensation = (dispensationId: number) => {
    setDispensations(prev => prev.filter(d => d.id !== dispensationId));
  };

  const value = {
    patients,
    medicines,
    prescriptions,
    dispensations,
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
