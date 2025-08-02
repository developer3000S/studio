// src/app/(main)/dashboard/page.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Users, Pill, ClipboardList, PackageCheck, PlusCircle, Syringe, FilePlus, AlertTriangle, Clock } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function DashboardPage() {
    const { patients, medicines, prescriptions, dispensations } = useAppContext();

    const totalPatients = patients.length;
    const activePrescriptions = prescriptions.length;
    const totalDispensationsThisMonth = dispensations.filter(d => {
        const date = new Date(d.dispensationDate);
        const today = new Date();
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }).length;

    const recentPrescriptions = [...prescriptions].sort((a, b) => b.id - a.id).slice(0, 5).map(p => {
        const patient = patients.find(pat => pat.id === p.patientId);
        const medicine = medicines.find(med => med.id === p.medicineId);
        return { ...p, patientName: patient?.fio, medicineName: `${medicine?.standardizedMnn} ${medicine?.standardizedDosage}` }
    });
    
  return (
    <div className="flex flex-col gap-6">
       <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Панель управления
            </h1>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Всего пациентов" value={totalPatients} change="+12 в этом месяце" icon={Users} />
        <StatCard title="Активных препаратов" value={`${medicines.length}`} icon={Pill} />
        <StatCard title="Активных назначений" value={`${activePrescriptions}`} icon={ClipboardList} />
        <StatCard title="Выдач за месяц" value={totalDispensationsThisMonth} change="+13 к прошлому месяцу" icon={PackageCheck} />
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
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Последние назначения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {recentPrescriptions.map((p, index) => (
                 <div key={p.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                        <p className="font-semibold">{p.patientName || "Пациент не найден"}</p>
                        <p className="text-sm text-muted-foreground">{p.medicineName || "Препарат не найден"}</p>
                    </div>
                    <div className="text-left sm:text-right">
                         <span className={`px-2 py-1 text-xs rounded-full ${index % 3 === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {index % 3 === 0 ? 'Активно' : 'Завершено'}
                         </span>
                         <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString('ru-RU')} - {p.dailyDose} уп.</p>
                    </div>
                 </div>
             ))}
             {recentPrescriptions.length === 0 && (
                <p className="text-sm text-muted-foreground">Нет недавних назначений.</p>
             )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Предупреждения о сроках годности</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Просроченные препараты (1)</AlertTitle>
                <AlertDescription>
                    <b>Омез 20 мг</b><br/>
                    Серия: LOT123456 | Срок: 15.01.2024 | Пациент: Лебедев Сергей Викторович
                </AlertDescription>
            </Alert>
             <Alert className="bg-yellow-100 border-yellow-300">
                <AlertTriangle className="h-4 w-4 text-yellow-700" />
                <AlertTitle className="text-yellow-800">Истекают в ближайшее время (2)</AlertTitle>
                <AlertDescription className="text-yellow-700">
                    <b>Имигран 50 мг</b><br/>
                    Серия: LOT789012 | Срок: 15.03.2024 | Пациент: Новикова Ольга Петровна
                     <hr className="my-2 border-yellow-300" />
                    <b>Вольтарен 50 мг</b><br/>
                    Серия: LOT345678 | Срок: 20.04.2024 | Пациент: Федоров Николай Иванович
                </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
