'use client';

import type { Patient, Medicine, Prescription, Dispensation } from "@/types";
import { generateInitialData } from "@/lib/mock-data";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, writeBatch, getDoc, setDoc } from "firebase/firestore";


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
  addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<void>;
  updatePrescription: (prescription: Prescription) => Promise<void>;
  deletePrescription: (prescriptionId: string) => Promise<void>;
  addDispensation: (dispensation: Omit<Dispensation, 'id'>) => Promise<void>;
  updateDispensation: (dispensation: Dispensation) => Promise<void>;
  deleteDispensation: (dispensationId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const seedInitialData = async (userId: string) => {
    const { initialPatients, initialMedicines, initialPrescriptions, initialDispensations } = generateInitialData();
    const batch = writeBatch(db);

    const seedCollection = (collectionName: string, data: any[]) => {
        data.forEach(item => {
            const docRef = doc(db, "users", userId, collectionName, item.id);
            batch.set(docRef, item);
        });
    };
    
    seedCollection('patients', initialPatients);
    seedCollection('medicines', initialMedicines);
    seedCollection('prescriptions', initialPrescriptions);
    seedCollection('dispensations', initialDispensations);

    await batch.commit();

    return { initialPatients, initialMedicines, initialPrescriptions, initialDispensations };
};


export function AppProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [dispensations, setDispensations] = useState<Dispensation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (userId: string) => {
    setLoading(true);
    try {
        const collections = {
            patients: setPatients,
            medicines: setMedicines,
            prescriptions: setPrescriptions,
            dispensations: setDispensations,
        };

        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists() || !userDocSnap.data()?.dataSeeded) {
             const { initialPatients, initialMedicines, initialPrescriptions, initialDispensations } = await seedInitialData(userId);
             setPatients(initialPatients);
             setMedicines(initialMedicines);
             setPrescriptions(initialPrescriptions);
             setDispensations(initialDispensations);
             await setDoc(userDocRef, { dataSeeded: true });
        } else {
            for (const [name, setter] of Object.entries(collections)) {
                const querySnapshot = await getDocs(collection(db, "users", userId, name));
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
                setter(data);
            }
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        toast({ title: "Ошибка загрузки данных", description: "Не удалось получить данные из базы.", variant: "destructive"});
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchData(user.uid);
    } else {
      setLoading(false);
      setPatients([]);
      setMedicines([]);
      setPrescriptions([]);
      setDispensations([]);
    }
  }, [user, fetchData]);

  const getCollectionRef = (collectionName: string) => {
      if (!user) throw new Error("Пользователь не аутентифицирован.");
      return collection(db, "users", user.uid, collectionName);
  }

  // --- PATIENTS ---
  const addPatient = async (patient: Omit<Patient, 'id'>) => {
    const newPatient = { ...patient, id: doc(collection(db, '_')).id };
    const docRef = doc(getCollectionRef('patients'), newPatient.id);
    await setDoc(docRef, patient);
    setPatients(prev => [...prev, newPatient]);
  };

  const updatePatient = async (updatedPatient: Patient) => {
    const docRef = doc(getCollectionRef('patients'), updatedPatient.id);
    await setDoc(docRef, { ...updatedPatient }, { merge: true });
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const deletePatient = async (patientId: string) => {
    const batch = writeBatch(db);
    batch.delete(doc(getCollectionRef('patients'), patientId));
    prescriptions.filter(p => p.patientId === patientId).forEach(p => batch.delete(doc(getCollectionRef('prescriptions'), p.id)));
    dispensations.filter(d => d.patientId === patientId).forEach(d => batch.delete(doc(getCollectionRef('dispensations'), d.id)));
    await batch.commit();

    setPatients(prev => prev.filter(p => p.id !== patientId));
    setPrescriptions(prev => prev.filter(p => p.patientId !== patientId));
    setDispensations(prev => prev.filter(d => d.patientId !== patientId));
  };
  
  // --- MEDICINES ---
 const addMedicine = async (medicine: Omit<Medicine, 'id'>) => {
    const newMedicine = { ...medicine, id: doc(collection(db, '_')).id };
    await setDoc(doc(getCollectionRef('medicines'), newMedicine.id), medicine);
    setMedicines(prev => [...prev, newMedicine]);
  };

  const updateMedicine = async (updatedMedicine: Medicine) => {
    await setDoc(doc(getCollectionRef('medicines'), updatedMedicine.id), { ...updatedMedicine }, { merge: true });
    setMedicines(prev => prev.map(m => m.id === updatedMedicine.id ? updatedMedicine : m));
  };

  const deleteMedicine = async (medicineId: string) => {
     const batch = writeBatch(db);
    batch.delete(doc(getCollectionRef('medicines'), medicineId));
    prescriptions.filter(p => p.medicineId === medicineId).forEach(p => batch.delete(doc(getCollectionRef('prescriptions'), p.id)));
    dispensations.filter(d => d.medicineId === medicineId).forEach(d => batch.delete(doc(getCollectionRef('dispensations'), d.id)));
    await batch.commit();

    setMedicines(prev => prev.filter(m => m.id !== medicineId));
    setPrescriptions(prev => prev.filter(p => p.medicineId !== medicineId));
    setDispensations(prev => prev.filter(d => d.medicineId !== medicineId));
  };


  // --- PRESCRIPTIONS ---
 const addPrescription = async (data: Omit<Prescription, 'id' | 'annualRequirement'>) => {
    const medicine = medicines.find(m => m.id === data.medicineId);
    if (!medicine) {
      toast({ title: 'Ошибка', description: 'Медикамент не найден.', variant: 'destructive' });
      return;
    }
    const annualRequirement = (data.dailyConsumption * 365) / medicine.packaging;
    
    const existing = prescriptions.find(p => p.patientId === data.patientId && p.medicineId === data.medicineId);

    if (existing) {
       toast({ title: 'Назначение обновлено', description: `Назначение для этого пациента и препарата уже существует. Данные были обновлены.` });
       await updatePrescription({ ...existing, ...data, annualRequirement });
    } else {
       const newPrescription = { ...data, annualRequirement, id: doc(collection(db, '_')).id };
       await setDoc(doc(getCollectionRef('prescriptions'), newPrescription.id), { ...data, annualRequirement});
       setPrescriptions(prev => [...prev, newPrescription]);
       toast({ title: 'Назначение добавлено', description: 'Новое назначение было успешно добавлено.' });
    }
  };

  const updatePrescription = async (updatedPrescription: Prescription) => {
    await setDoc(doc(getCollectionRef('prescriptions'), updatedPrescription.id), { ...updatedPrescription }, { merge: true });
    setPrescriptions(prev => prev.map(p => p.id === updatedPrescription.id ? updatedPrescription : p));
  };
  
  const deletePrescription = async (prescriptionId: string) => {
    await writeBatch(db).delete(doc(getCollectionRef('prescriptions'), prescriptionId)).commit();
    setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
  };
  
  // --- DISPENSATIONS ---
  const addDispensation = async (dispensation: Omit<Dispensation, 'id'>) => {
    const newDispensation = { ...dispensation, id: doc(collection(db, '_')).id };
    await setDoc(doc(getCollectionRef('dispensations'), newDispensation.id), dispensation);
    setDispensations(prev => [...prev, newDispensation]);
  };
  
  const updateDispensation = async (updatedDispensation: Dispensation) => {
    await setDoc(doc(getCollectionRef('dispensations'), updatedDispensation.id), { ...updatedDispensation }, { merge: true });
    setDispensations(prev => prev.map(d => d.id === updatedDispensation.id ? updatedDispensation : d));
  };

  const deleteDispensation = async (dispensationId: string) => {
    await writeBatch(db).delete(doc(getCollectionRef('dispensations'), dispensationId)).commit();
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
