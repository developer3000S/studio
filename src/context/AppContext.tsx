"use client";

import type { Patient, Medicine, Prescription, Dispensation } from "@/types";
import { initialPatients, initialMedicines, initialPrescriptions, initialDispensations } from "@/lib/mock-data";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface AppContextType {
  patients: Patient[];
  medicines: Medicine[];
  prescriptions: Prescription[];
  dispensations: Dispensation[];
  loading: boolean;
  addPatient: (patient: Omit<Patient, 'id' | 'userId'>) => Promise<void>;
  updatePatient: (patient: Patient) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  addMedicine: (medicine: Omit<Medicine, 'id' | 'userId'>) => Promise<void>;
  updateMedicine: (medicine: Medicine) => Promise<void>;
  deleteMedicine: (medicineId: string) => Promise<void>;
  addPrescription: (prescription: Omit<Prescription, 'id' | 'userId'>) => Promise<void>;
  updatePrescription: (prescription: Prescription) => Promise<void>;
  deletePrescription: (prescriptionId: string) => Promise<void>;
  addDispensation: (dispensation: Omit<Dispensation, 'id' | 'userId'>) => Promise<void>;
  updateDispensation: (dispensation: Dispensation) => Promise<void>;
  deleteDispensation: (dispensationId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const seedInitialData = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists() || !userDocSnap.data()?.hasSeeded) {
        const batch = writeBatch(db);

        initialPatients.forEach(patient => {
            const docRef = doc(collection(db, 'patients'));
            batch.set(docRef, { ...patient, id: docRef.id, userId });
        });

        initialMedicines.forEach(medicine => {
            const docRef = doc(collection(db, 'medicines'));
            batch.set(docRef, { ...medicine, id: docRef.id, userId });
        });

        // We need to know the new IDs to create related prescriptions and dispensations
        // For simplicity, this seeding logic will not create related data.
        // In a real app, you would handle this more robustly.

        batch.set(userDocRef, { hasSeeded: true }, { merge: true });

        await batch.commit();
        console.log('Initial data seeded for user:', userId);
        return true;
    }
    return false;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [dispensations, setDispensations] = useState<Dispensation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (userId: string) => {
    setLoading(true);
    try {
      const wasSeeded = await seedInitialData(userId);
      
      const collections = {
        patients: setPatients,
        medicines: setMedicines,
        prescriptions: setPrescriptions,
        dispensations: setDispensations,
      };

      for (const [colName, setter] of Object.entries(collections)) {
        const q = query(collection(db, colName), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setter(data);
      }
      
      if(wasSeeded) {
          toast({
              title: "Добро пожаловать!",
              description: "Мы добавили несколько демонстрационных данных, чтобы вы могли начать."
          })
      }

    } catch (error) {
      console.error("Error fetching data:", error);
       toast({
        title: "Ошибка загрузки данных",
        description: "Не удалось загрузить данные из базы. Пожалуйста, попробуйте обновить страницу.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData(user.uid);
    } else {
      // Clear data when user logs out
      setPatients([]);
      setMedicines([]);
      setPrescriptions([]);
      setDispensations([]);
      setLoading(false);
    }
  }, [user]);

  // --- PATIENTS ---
  const addPatient = async (patient: Omit<Patient, 'id' | 'userId'>) => {
    if (!user) return;
    const newPatient = { ...patient, userId: user.uid };
    const docRef = await addDoc(collection(db, 'patients'), newPatient);
    setPatients(prev => [...prev, { ...newPatient, id: docRef.id }]);
  };

  const updatePatient = async (updatedPatient: Patient) => {
    const { id, ...data } = updatedPatient;
    await updateDoc(doc(db, 'patients', id), data);
    setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
  };

  const deletePatient = async (patientId: string) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'patients', patientId));
    
    const relatedPrescriptions = prescriptions.filter(p => p.patientId === patientId);
    relatedPrescriptions.forEach(p => batch.delete(doc(db, 'prescriptions', p.id)));

    const relatedDispensations = dispensations.filter(d => d.patientId === patientId);
    relatedDispensations.forEach(d => batch.delete(doc(db, 'dispensations', d.id)));

    await batch.commit();

    setPatients(prev => prev.filter(p => p.id !== patientId));
    setPrescriptions(prev => prev.filter(p => p.patientId !== patientId));
    setDispensations(prev => prev.filter(d => d.patientId !== patientId));
  };
  
  // --- MEDICINES ---
  const addMedicine = async (medicine: Omit<Medicine, 'id' | 'userId'>) => {
     if (!user) return;
    const newMedicine = { ...medicine, userId: user.uid };
    const docRef = await addDoc(collection(db, 'medicines'), newMedicine);
    setMedicines(prev => [...prev, { ...newMedicine, id: docRef.id }]);
  };

  const updateMedicine = async (updatedMedicine: Medicine) => {
     const { id, ...data } = updatedMedicine;
    await updateDoc(doc(db, 'medicines', id), data);
    setMedicines(prev => prev.map(m => m.id === id ? updatedMedicine : m));
  };

  const deleteMedicine = async (medicineId: string) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'medicines', medicineId));
    
    const relatedPrescriptions = prescriptions.filter(p => p.medicineId === medicineId);
    relatedPrescriptions.forEach(p => batch.delete(doc(db, 'prescriptions', p.id)));

    const relatedDispensations = dispensations.filter(d => d.medicineId === medicineId);
    relatedDispensations.forEach(d => batch.delete(doc(db, 'dispensations', d.id)));

    await batch.commit();

    setMedicines(prev => prev.filter(m => m.id !== medicineId));
    setPrescriptions(prev => prev.filter(p => p.medicineId !== medicineId));
    setDispensations(prev => prev.filter(d => d.medicineId !== medicineId));
  };

  // --- PRESCRIPTIONS ---
  const addPrescription = async (prescription: Omit<Prescription, 'id' | 'userId'>) => {
    if (!user) return;
    
    const existing = prescriptions.find(p => p.patientId === prescription.patientId && p.medicineId === prescription.medicineId);

    if (existing) {
       toast({
          title: 'Назначение обновлено',
          description: `Назначение для этого пациента и препарата уже существует. Данные были обновлены.` 
      });
      await updatePrescription({ ...existing, ...prescription });
    } else {
       toast({
          title: 'Назначение добавлено',
          description: 'Новое назначение было успешно добавлено.',
      });
      const newPrescription = { ...prescription, userId: user.uid };
      const docRef = await addDoc(collection(db, 'prescriptions'), newPrescription);
      setPrescriptions(prev => [...prev, { ...newPrescription, id: docRef.id }]);
    }
  };

  const updatePrescription = async (updatedPrescription: Prescription) => {
    const { id, ...data } = updatedPrescription;
    await updateDoc(doc(db, 'prescriptions', id), data);
    setPrescriptions(prev => prev.map(p => p.id === id ? updatedPrescription : p));
  };
  
  const deletePrescription = async (prescriptionId: string) => {
    await deleteDoc(doc(db, 'prescriptions', prescriptionId));
    setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
  };
  
  // --- DISPENSATIONS ---
  const addDispensation = async (dispensation: Omit<Dispensation, 'id' | 'userId'>) => {
    if (!user) return;
    const newDispensation = { ...dispensation, userId: user.uid };
    const docRef = await addDoc(collection(db, 'dispensations'), newDispensation);
    setDispensations(prev => [...prev, { ...newDispensation, id: docRef.id }]);
  };
  
  const updateDispensation = async (updatedDispensation: Dispensation) => {
    const { id, ...data } = updatedDispensation;
    await updateDoc(doc(db, 'dispensations', id), data);
    setDispensations(prev => prev.map(d => d.id === id ? updatedDispensation : d));
  };

  const deleteDispensation = async (dispensationId: string) => {
    await deleteDoc(doc(db, 'dispensations', dispensationId));
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
    throw new Error("useAppContext must be used within