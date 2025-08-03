'use client';

import type { Patient, Medicine, Prescription, Dispensation } from "@/types";
import { generateInitialData } from "@/lib/mock-data";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, writeBatch, getDoc, setDoc, deleteDoc } from "firebase/firestore";


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
        const collections: { [key: string]: React.Dispatch<React.SetStateAction<any[]>> } = {
            patients: setPatients,
            medicines: setMedicines,
            prescriptions: setPrescriptions,
            dispensations: setDispensations,
        };

        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists() || !userDocSnap.data()?.dataSeeded) {
             console.log("Seeding initial data for new user:", userId);
             const { initialPatients, initialMedicines, initialPrescriptions, initialDispensations } = await seedInitialData(userId);
             setPatients(initialPatients);
             setMedicines(initialMedicines);
             setPrescriptions(initialPrescriptions);
             setDispensations(initialDispensations);
             await setDoc(userDocRef, { dataSeeded: true }, { merge: true });
        } else {
            console.log("Fetching data for existing user:", userId);
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
  const addPatient = async (patientData: Omit<Patient, 'id'>) => {
    if (!user) return;
    const newId = doc(collection(db, '_')).id;
    const newPatient = { ...patientData, id: newId };
    await setDoc(doc(getCollectionRef('patients'), newId), patientData);
    setPatients(prev => [...prev, newPatient]);
  };

  const updatePatient = async (updatedPatient: Patient) => {
    if (!user) return;
    const { id, ...patientData } = updatedPatient;
    await setDoc(doc(getCollectionRef('patients'), id), patientData, { merge: true });
    setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
  };

  const deletePatient = async (patientId: string) => {
    if (!user) return;
    const batch = writeBatch(db);
    batch.delete(doc(getCollectionRef('patients'), patientId));
    
    const relatedPrescriptions = prescriptions.filter(p => p.patientId === patientId);
    relatedPrescriptions.forEach(p => batch.delete(doc(getCollectionRef('prescriptions'), p.id)));

    const relatedDispensations = dispensations.filter(d => d.patientId === patientId);
    relatedDispensations.forEach(d => batch.delete(doc(getCollectionRef('dispensations'), d.id)));

    await batch.commit();

    setPatients(prev => prev.filter(p => p.id !== patientId));
    setPrescriptions(prev => prev.filter(p => p.patientId !== patientId));
    setDispensations(prev => prev.filter(d => d.patientId !== patientId));
  };
  
  // --- MEDICINES ---
 const addMedicine = async (medicineData: Omit<Medicine, 'id'>) => {
    if (!user) return;
    const newId = doc(collection(db, '_')).id;
    const newMedicine = { ...medicineData, id: newId };
    await setDoc(doc(getCollectionRef('medicines'), newId), medicineData);
    setMedicines(prev => [...prev, newMedicine]);
  };

  const updateMedicine = async (updatedMedicine: Medicine) => {
    if (!user) return;
    const { id, ...medicineData } = updatedMedicine;
    await setDoc(doc(getCollectionRef('medicines'), id), medicineData, { merge: true });
    setMedicines(prev => prev.map(m => m.id === id ? updatedMedicine : m));
  };

  const deleteMedicine = async (medicineId: string) => {
    if (!user) return;
    const batch = writeBatch(db);
    batch.delete(doc(getCollectionRef('medicines'), medicineId));

    const relatedPrescriptions = prescriptions.filter(p => p.medicineId === medicineId);
    relatedPrescriptions.forEach(p => batch.delete(doc(getCollectionRef('prescriptions'), p.id)));

    const relatedDispensations = dispensations.filter(d => d.medicineId === medicineId);
    relatedDispensations.forEach(d => batch.delete(doc(getCollectionRef('dispensations'), d.id)));
    
    await batch.commit();

    setMedicines(prev => prev.filter(m => m.id !== medicineId));
    setPrescriptions(prev => prev.filter(p => p.medicineId !== medicineId));
    setDispensations(prev => prev.filter(d => d.medicineId !== medicineId));
  };


  // --- PRESCRIPTIONS ---
 const addPrescription = async (data: Omit<Prescription, 'id' | 'annualRequirement'> & { dailyConsumption: number }) => {
    if (!user) return;
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
       const newId = doc(collection(db, '_')).id;
       const newPrescription = { ...prescriptionData, id: newId };
       const {id, ...rest} = newPrescription;
       await setDoc(doc(getCollectionRef('prescriptions'), newId), rest);
       setPrescriptions(prev => [...prev, newPrescription]);
       toast({ title: 'Назначение добавлено', description: 'Новое назначение было успешно добавлено.' });
    }
  };

  const updatePrescription = async (updatedPrescription: Prescription) => {
    if (!user) return;
    const { id, ...prescriptionData } = updatedPrescription;
    await setDoc(doc(getCollectionRef('prescriptions'), id), prescriptionData, { merge: true });
    setPrescriptions(prev => prev.map(p => p.id === id ? updatedPrescription : p));
  };
  
  const deletePrescription = async (prescriptionId: string) => {
    if (!user) return;
    await deleteDoc(doc(getCollectionRef('prescriptions'), prescriptionId));
    setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
  };
  
  // --- DISPENSATIONS ---
  const addDispensation = async (dispensationData: Omit<Dispensation, 'id'>) => {
    if (!user) return;
    const newId = doc(collection(db, '_')).id;
    const newDispensation = { ...dispensationData, id: newId };
    await setDoc(doc(getCollectionRef('dispensations'), newId), dispensationData);
    setDispensations(prev => [...prev, newDispensation]);
  };
  
  const updateDispensation = async (updatedDispensation: Dispensation) => {
    if (!user) return;
    const { id, ...dispensationData } = updatedDispensation;
    await setDoc(doc(getCollectionRef('dispensations'), id), dispensationData, { merge: true });
    setDispensations(prev => prev.map(d => d.id === id ? updatedDispensation : d));
  };

  const deleteDispensation = async (dispensationId: string) => {
    if (!user) return;
    await deleteDoc(doc(getCollectionRef('dispensations'), dispensationId));
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
