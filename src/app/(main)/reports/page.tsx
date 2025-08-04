'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const loadingComponent = <div className="mt-2"><Skeleton className="w-full h-[600px] rounded-lg" /></div>;

const MedicationsReport = dynamic(() => import('./components/medications-report').then(mod => mod.MedicationsReport), {
  ssr: false,
  loading: () => loadingComponent,
});
const PatientsReport = dynamic(() => import('./components/patients-report').then(mod => mod.PatientsReport), {
  ssr: false,
  loading: () => loadingComponent,
});
const PrescriptionsReport = dynamic(() => import('./components/prescriptions-report').then(mod => mod.PrescriptionsReport), {
  ssr: false,
  loading: () => loadingComponent,
});
const FinancialReport = dynamic(() => import('./components/financial-report').then(mod => mod.FinancialReport), {
  ssr: false,
  loading: () => loadingComponent,
});
const DispensationsReport = dynamic(() => import('./components/dispensations-report').then(mod => mod.DispensationsReport), {
  ssr: false,
  loading: () => loadingComponent,
});


export default function ReportsPage() {
  return (
    <div className="container mx-auto py-2">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">Отчеты</h1>
          <p className="text-muted-foreground">Комплексная аналитика по данным системы.</p>
        </div>
      </div>

      <Tabs defaultValue="medications">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="medications">По препаратам</TabsTrigger>
          <TabsTrigger value="patients">По пациентам</TabsTrigger>
          <TabsTrigger value="prescriptions">По назначениям</TabsTrigger>
          <TabsTrigger value="dispensations">По выдачам</TabsTrigger>
          <TabsTrigger value="financial">Финансовый</TabsTrigger>
        </TabsList>
        <TabsContent value="medications">
            <MedicationsReport />
        </TabsContent>
        <TabsContent value="patients">
            <PatientsReport />
        </TabsContent>
        <TabsContent value="prescriptions">
            <PrescriptionsReport />
        </TabsContent>
        <TabsContent value="dispensations">
            <DispensationsReport />
        </TabsContent>
        <TabsContent value="financial">
            <FinancialReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
