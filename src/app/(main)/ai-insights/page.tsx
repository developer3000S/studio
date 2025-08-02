'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { meditrackRxInsights } from "@/ai/flows/meditrack-rx-insights";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState('');

    const { patients, medicines, prescriptions, dispensations } = useAppContext();
    const { toast } = useToast();

    useEffect(() => {
        const hardcodedModels = [
            'gemini-1.5-pro',
            'gemini-1.5-flash',
        ];
        setAvailableModels(hardcodedModels);
        setSelectedModel(hardcodedModels[1]); 
    }, []);

     const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const getInsights = async () => {
        addLog('Начало генерации аналитики...');
        setIsLoading(true);
        setError('');
        setSummary('');

        try {
            addLog('Подготовка данных для AI...');
            const patientData = toCSV(patients);
            const medicineData = toCSV(medicines);
            const prescriptionData = toCSV(prescriptions);
            const dispensationData = toCSV(dispensations);

            addLog(`Данные подготовлены. Вызов AI-потока с моделью ${selectedModel}...`);

            const result = await meditrackRxInsights({
                model: selectedModel,
                patientData,
                medicineData,
                prescriptionData,
                dispensationData,
            });

            setSummary(result.summary);
            addLog('AI-аналитика успешно получена.');

        } catch (e: any) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            setError('Не удалось получить AI-аналитику. Попробуйте позже.');
            addLog(`Произошла ошибка: ${errorMessage}`);
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
        <div className="container mx-auto py-2 grid grid-cols-1 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Sparkles className="text-primary" />
                        AI-аналитика запасов
                    </CardTitle>
                    <CardDescription>
                        Получите сводную информацию о текущих запасах и потребностях в медикаментах, сгенерированную искусственным интеллектом.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="model-select">Выберите модель</Label>
                        <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isLoading}>
                            <SelectTrigger id="model-select">
                                <SelectValue placeholder="Выберите модель..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableModels.map(model => (
                                    <SelectItem key={model} value={model}>{model}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {isLoading && !summary && !error ? (
                        <div className="space-y-2 pt-4">
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
                    <Button onClick={getInsights} disabled={isLoading || !selectedModel} className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isLoading ? 'Генерация...' : 'Сгенерировать аналитику'}
                    </Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Логи выполнения</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs h-96 overflow-auto">
                        {logs.join('\n')}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
