// src/app/(main)/dashboard/page.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Users, Pill, ClipboardList, PackageCheck, PlusCircle, Syringe, FilePlus, AlertTriangle, Clock, BarChart, PieChart } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Bar, Pie, Cell, ResponsiveContainer, BarChart as BarChartComponent, XAxis, YAxis, Tooltip, Legend, PieChart as PieChartComponent } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

function StatCard({ title, value, change, icon: Icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && <p className="text-xs text-muted-foreground">{change}</p>}
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ children, icon: Icon, className, href }) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`${href}?new=true`);
    };
    
    return (
        <Button onClick={handleClick} className={className}>
            <Icon className="mr-2 h-4 w-4" />
            {children}
        </Button>
    )
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f"];

const diagnosisChartConfig = {
  patients: {
    label: "Пациенты",
  },
} satisfies ChartConfig

const dispensationsChartConfig = {
  dispensations: {
    label: "Выдачи",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig


export default function DashboardPage() {
    const { patients, medicines, prescriptions, dispensations } = useAppContext();

    const totalPatients = patients.length;
    const activePrescriptions = prescriptions.length;
    const totalDispensationsThisMonth = dispensations.filter(d => {
        const date = new Date(d.dispensationDate);
        const today = new Date();
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }).length;

    const dispensationsByMonth = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => ({
            name: new Date(0, i).toLocaleString('ru-RU', { month: 'short' }),
            dispensations: 0
        }));

        dispensations.forEach(d => {
            const month = new Date(d.dispensationDate).getMonth();
            months[month].dispensations += d.quantity;
        });

        return months;
    }, [dispensations]);

    const patientsByDiagnosis = useMemo(() => {
        const diagnosisCount: { [key: string]: number } = {};
        patients.forEach(p => {
            const key = p.diagnosis.split('-')[0].trim();
            if (!diagnosisCount[key]) {
                diagnosisCount[key] = 0;
            }
            diagnosisCount[key]++;
        });

        return Object.entries(diagnosisCount).map(([name, value]) => ({ name, value, fill: COLORS[Math.floor(Math.random() * COLORS.length)] })).sort((a,b) => b.value - a.value).slice(0, 5);
    }, [patients]);
    
  return (
    <div className="flex flex-col gap-6">
       <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Панель управления
            </h1>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Всего пациентов" value={totalPatients} icon={Users} />
        <StatCard title="Активных препаратов" value={`${medicines.length}`} icon={Pill} />
        <StatCard title="Активных назначений" value={`${activePrescriptions}`} icon={ClipboardList} />
        <StatCard title="Выдач за месяц" value={totalDispensationsThisMonth} icon={PackageCheck} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5"/>
                      Выдачи по месяцам
                  </CardTitle>
                  <CardDescription>Количество выданных упаковок за текущий год.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={dispensationsChartConfig} className="h-[250px] w-full">
                      <BarChartComponent data={dispensationsByMonth}>
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                          <YAxis />
                          <Tooltip cursor={false} content={<ChartTooltipContent />} />
                          <Bar dataKey="dispensations" radius={4} />
                      </BarChartComponent>
                  </ChartContainer>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5"/>
                    Пациенты по диагнозам (ТОП-5)
                  </CardTitle>
                   <CardDescription>Распределение пациентов по коду диагноза (МКБ).</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={diagnosisChartConfig} className="h-[250px] w-full">
                      <PieChartComponent>
                            <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                            <Legend content={<ChartLegendContent nameKey="name" />} />
                           <Pie data={patientsByDiagnosis} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label>
                               {patientsByDiagnosis.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                           </Pie>
                      </PieChartComponent>
                  </ChartContainer>
              </CardContent>
          </Card>
      </div>

       <div>
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Быстрые действия
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton href="/patients" icon={PlusCircle} className="bg-blue-600 hover:bg-blue-700">Добавить пациента</QuickActionButton>
            <QuickActionButton href="/medications" icon={FilePlus} className="bg-green-600 hover:bg-green-700">Добавить препарат</QuickActionButton>
            <QuickActionButton href="/prescriptions" icon={Syringe} className="bg-cyan-500 hover:bg-cyan-600">Создать назначение</QuickActionButton>
            <QuickActionButton href="/dispensations" icon={PackageCheck} className="bg-yellow-500 hover:bg-yellow-600 text-black">Зарегистрировать выдачу</QuickActionButton>
        </div>
      </div>
      
    </div>
  );
}
