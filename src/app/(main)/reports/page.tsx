'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MedicationsReport } from "./components/medications-report";
import { PatientsReport } from "./components/patients-report";
import { PrescriptionsReport } from "./components/prescriptions-report";
import { FinancialReport } from "./components/financial-report";
import { DispensationsReport } from "./components/dispensations-report";

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
          <TabsTrigger value="financial">Финансовый</TabsTrigger>
          <TabsTrigger value="dispensations">По выдачам</TabsTrigger>
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
        <TabsContent value="financial">
            <FinancialReport />
        </TabsContent>
        <TabsContent value="dispensations">
            <DispensationsReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
