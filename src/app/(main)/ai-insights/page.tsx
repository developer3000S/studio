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

function toCSV<T>(data: T[], headers: (keyof T)[]): string {
    const headerRow = headers.join(',');
    const dataRows = data.map(row => 
        headers.map(header => {
            const value = String(row[header] ?? '');
            return `"${value.replace(/"/g, '""')}"`;
        }).join(',')
    );
    return [headerRow, ...dataRows].join('\n');
}


export default function AIInsightsPage() {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { patients, medicines, prescriptions, dispensations } = useAppContext();
    const { toast } = useToast();

    const getInsights = async () => {
        setIsLoading(true);
        setError('');
        setSummary('');

        try {
            const patientData = toCSV(patients, ['id', 'fio', 'birthYear', 'diagnosis', 'attendingDoctor']);
            const medicineData = toCSV(medicines, ['id', 'smmnNodeCode', 'section', 'standardizedMnn', 'tradeNameVk', 'standardizedDosageForm', 'standardizedDosage', 'characteristic', 'packaging', 'price']);
            const prescriptionData = toCSV(prescriptions, ['id', 'patientId', 'medicineId', 'dailyDose', 'annualRequirement']);
            const dispensationData = toCSV(dispensations, ['id', 'patientId', 'medicineId', 'dispensationDate', 'quantity']);

            const result = await meditrackRxInsights({
                patientData,
                medicineData,
                prescriptionData,
                dispensationData,
            });

            setSummary(result.summary);
        } catch (e) {
            console.error(e);
            setError('Не удалось получить AI-аналитику. Попробуйте позже.');
             toast({
                variant: "destructive",
                title: "Ошибка",
                description: "Не удалось получить AI-аналитику. Попробуйте позже.",
            });
        } finally {
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
                    {isLoading ? (
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
        </div>
    );
}
