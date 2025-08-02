'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { meditrackRxInsights } from "@/ai/flows/meditrack-rx-insights";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function toCSV<T extends object>(data: T[]): string {
    if (data.length === 0) {
        return "";
    }
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');
    const dataRows = data.map(row => 
        headers.map(header => {
            const value = String(row[header as keyof T] ?? '');
            return `"${value.replace(/"/g, '""')}"`;
        }).join(',')
    );
    return [headerRow, ...dataRows].join('\n');
}


export default function AIInsightsPage() {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const { patients, medicines, prescriptions, dispensations } = useAppContext();
    const { toast } = useToast();

    const addLog = (message: string) => {
        setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${message}`]);
    }

    const getInsights = async () => {
        setIsLoading(true);
        setError('');
        setSummary('');
        setLogs([]);
        
        addLog('Начало генерации аналитики...');

        try {
            addLog('Подготовка данных для AI...');
            const patientData = toCSV(patients);
            const medicineData = toCSV(medicines);
            const prescriptionData = toCSV(prescriptions);
            const dispensationData = toCSV(dispensations);

            addLog('Данные подготовлены. Вызов AI-потока...');

            const result = await meditrackRxInsights({
                patientData,
                medicineData,
                prescriptionData,
                dispensationData,
            });

            addLog(`AI-поток успешно выполнен.`);
            setSummary(result.summary);

        } catch (e: any) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            addLog(`Произошла ошибка: ${errorMessage}`);
            setError('Не удалось получить AI-аналитику. Попробуйте позже.');
             toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Не удалось получить AI-аналитику. Попробуйте позже.",
            });
        } finally {
            addLog('Процесс генерации завершен.');
            setIsLoading(false);
        }
    };
    
    return (
        <div className="container mx-auto py-2">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Sparkles className="text-primary" />
                        AI-аналитика запасов
                    </CardTitle>
                    <CardDescription>
                        Получите сводную информацию о текущих запасах и потребностях в медикаментах, сгенерированную искусственным интеллектом.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && !summary && !error ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ) : error ? (
                         <Alert variant="destructive">
                            <AlertTitle>Ошибка</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : summary ? (
                        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                            {summary}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>Нажмите кнопку ниже, чтобы сгенерировать аналитику.</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={getInsights} disabled={isLoading} className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isLoading ? 'Генерация...' : 'Сгенерировать аналитику'}
                    </Button>
                </CardFooter>
            </Card>

            {logs.length > 0 && (
                <Card className="max-w-2xl mx-auto mt-4">
                    <CardHeader>
                        <CardTitle>Логи выполнения</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-md text-xs whitespace-pre-wrap break-all">
                            {logs.join('\n')}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}