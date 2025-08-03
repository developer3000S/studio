'use client';
import type { Patient, Medicine, Prescription, Dispensation } from "@/types";
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
  fetchData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

async function apiRequest<T>(url: string, method: string, body?: any): Promise<T> {
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
    }
    return response.json();
}


export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [dispensations, setDispensations] = useState<Dispensation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const [patientsData, medicinesData, prescriptionsData, dispensationsData] = await Promise.all([
            apiRequest<Patient[]>('/api/patients', 'GET'),
            apiRequest<Medicine[]>('/api/medicines', 'GET'),
            apiRequest<Prescription[]>('/api/prescriptions', 'GET'),
            apiRequest<Dispensation[]>('/api/dispensations', 'GET'),
        ]);
        setPatients(patientsData);
        setMedicines(medicinesData);
        setPrescriptions(prescriptionsData);
        setDispensations(dispensationsData);
    } catch (error: any) {
        toast({ title: "Ошибка загрузки данных", description: error.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleError = (error: any, defaultMessage: string) => {
    toast({
        title: "Ошибка",
        description: error.message || defaultMessage,
        variant: "destructive"
    });
  }

  // --- PATIENTS ---
  const addPatient = async (patientData: Omit<Patient, 'id'>) => {
    try {
        const newPatient = await apiRequest<Patient>('/api/patients', 'POST', patientData);
        setPatients(prev => [...prev, newPatient]);
        toast({ title: "Пациент добавлен" });
    } catch (error) {
        handleError(error, "Не удалось добавить пациента");
    }
  };

  const updatePatient = async (updatedPatient: Patient) => {
    try {
        const result = await apiRequest<Patient>(`/api/patients/${updatedPatient.id}`, 'PUT', updatedPatient);
        setPatients(prev => prev.map(p => p.id === result.id ? result : p));
        toast({ title: "Пациент обновлен" });
    } catch (error) {
        handleError(error, "Не удалось обновить пациента");
    }
  };

  const deletePatient = async (patientId: string) => {
    try {
        await apiRequest(`/api/patients/${patientId}`, 'DELETE');
        setPatients(prev => prev.filter(p => p.id !== patientId));
        toast({ title: "Пациент удален" });
    } catch (error) {
        handleError(error, "Не удалось удалить пациента");
    }
  };
  
  // --- MEDICINES ---
 const addMedicine = async (medicineData: Omit<Medicine, 'id'>) => {
    try {
        const newMedicine = await apiRequest<Medicine>('/api/medicines', 'POST', medicineData);
        setMedicines(prev => [...prev, newMedicine]);
        toast({ title: "Медикамент добавлен" });
    } catch (error) {
        handleError(error, "Не удалось добавить медикамент");
    }
  };

  const updateMedicine = async (updatedMedicine: Medicine) => {
    try {
        const result = await apiRequest<Medicine>(`/api/medicines/${updatedMedicine.id}`, 'PUT', updatedMedicine);
        setMedicines(prev => prev.map(m => m.id === result.id ? result : m));
        toast({ title: "Медикамент обновлен" });
    } catch (error) {
        handleError(error, "Не удалось обновить медикамент");
    }
  };

  const deleteMedicine = async (medicineId: string) => {
    try {
        await apiRequest(`/api/medicines/${medicineId}`, 'DELETE');
        setMedicines(prev => prev.filter(m => m.id !== medicineId));
        toast({ title: "Медикамент удален" });
    } catch (error) {
        handleError(error, "Не удалось удалить медикамент");
    }
  };

  // --- PRESCRIPTIONS ---
  const addPrescription = async (data: Omit<Prescription, 'id' | 'annualRequirement'> & { dailyConsumption: number }) => {
     try {
        const newPrescription = await apiRequest<Prescription>('/api/prescriptions', 'POST', data);
        await fetchData(); // Refetch all data to ensure consistency
        toast({ title: 'Назначение добавлено' });
    } catch (error) {
        handleError(error, "Не удалось добавить назначение");
    }
  };

  const updatePrescription = async (updatedPrescription: Prescription) => {
    try {
        const result = await apiRequest<Prescription>(`/api/prescriptions/${updatedPrescription.id}`, 'PUT', updatedPrescription);
        await fetchData(); // Refetch all data to ensure consistency
        toast({ title: "Назначение обновлено" });
    } catch (error) {
        handleError(error, "Не удалось обновить назначение");
    }
  };
  
  const deletePrescription = async (prescriptionId: string) => {
    try {
        await apiRequest(`/api/prescriptions/${prescriptionId}`, 'DELETE');
        setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
        toast({ title: "Назначение удалено" });
    } catch (error) {
        handleError(error, "Не удалось удалить назначение");
    }
  };
  
  // --- DISPENSATIONS ---
  const addDispensation = async (dispensationData: Omit<Dispensation, 'id'>) => {
    try {
        const newDispensation = await apiRequest<Dispensation>('/api/dispensations', 'POST', dispensationData);
        setDispensations(prev => [...prev, newDispensation]);
        toast({ title: "Выдача добавлена" });
    } catch (error) {
        handleError(error, "Не удалось добавить выдачу");
    }
  };
  
  const updateDispensation = async (updatedDispensation: Dispensation) => {
     try {
        const result = await apiRequest<Dispensation>(`/api/dispensations/${updatedDispensation.id}`, 'PUT', updatedDispensation);
        setDispensations(prev => prev.map(d => d.id === result.id ? result : d));
        toast({ title: "Выдача обновлена" });
    } catch (error) {
        handleError(error, "Не удалось обновить выдачу");
    }
  };

  const deleteDispensation = async (dispensationId: string) => {
    try {
        await apiRequest(`/api/dispensations/${dispensationId}`, 'DELETE');
        setDispensations(prev => prev.filter(d => d.id !== dispensationId));
        toast({ title: "Выдача удалена" });
    } catch (error) {
        handleError(error, "Не удалось удалить выдачу");
    }
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
    fetchData,
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
