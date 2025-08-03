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
  error: string | null;
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
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { error: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
     if (response.status === 204) {
        return null as T;
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
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
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
    } catch (err: any) {
        const errorMessage = "Не удалось загрузить данные. Проверьте, что сервер запущен, база данных доступна и переменная DATABASE_URL в .env файле настроена правильно. После установки переменной выполните 'npx prisma db push'.";
        setError(errorMessage);
        toast({ title: "Ошибка подключения к базе данных", description: errorMessage, variant: "destructive", duration: 15000 });
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
        setPatients(prev => [...prev, newPatient].sort((a,b) => a.fio.localeCompare(b.fio)));
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
        // Also remove related prescriptions and dispensations from local state
        setPrescriptions(prev => prev.filter(p => p.patientId !== patientId));
        setDispensations(prev => prev.filter(d => d.patientId !== patientId));
        toast({ title: "Пациент удален" });
    } catch (error) {
        handleError(error, "Не удалось удалить пациента");
    }
  };
  
  // --- MEDICINES ---
 const addMedicine = async (medicineData: Omit<Medicine, 'id'>) => {
    try {
        const newMedicine = await apiRequest<Medicine>('/api/medicines', 'POST', medicineData);
        setMedicines(prev => [...prev, newMedicine].sort((a,b) => a.standardizedMnn.localeCompare(b.standardizedMnn)));
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
         // Also remove related prescriptions and dispensations from local state
        setPrescriptions(prev => prev.filter(p => p.medicineId !== medicineId));
        setDispensations(prev => prev.filter(d => d.medicineId !== medicineId));
        toast({ title: "Медикамент удален" });
    } catch (error) {
        handleError(error, "Не удалось удалить медикамент");
    }
  };

  // --- PRESCRIPTIONS ---
  const addPrescription = async (data: Omit<Prescription, 'id' | 'annualRequirement'> & { dailyConsumption: number }) => {
     try {
        const result = await apiRequest<Prescription>('/api/prescriptions', 'POST', data);
        if (prescriptions.some(p => p.id === result.id)) {
           setPrescriptions(prev => prev.map(p => p.id === result.id ? result : p));
        } else {
           setPrescriptions(prev => [...prev, result]);
        }
        toast({ title: 'Назначение добавлено/обновлено' });
    } catch (error) {
        handleError(error, "Не удалось добавить назначение");
    }
  };

  const updatePrescription = async (updatedPrescription: Prescription) => {
    try {
        const result = await apiRequest<Prescription>(`/api/prescriptions/${updatedPrescription.id}`, 'PUT', updatedPrescription);
        setPrescriptions(prev => prev.map(p => p.id === result.id ? result : p));
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
        setDispensations(prev => [...prev, newDispensation].sort((a,b) => new Date(b.dispensationDate).getTime() - new Date(a.dispensationDate).getTime()));
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
    error,
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

    