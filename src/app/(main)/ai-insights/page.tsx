// src/app/(main)/ai-insights/page.tsx
'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from '@/context/AppContext';
import { meditrackRxInsights, type MeditrackRxInsightsInput } from '@/ai/flows/meditrack-rx-insights';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';

export default function AiInsightsPage() {
  const { patients, medicines, prescriptions, dispensations } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const addLog = (message: string) => {
    setLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${message}`]);
    setTimeout(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, 0);
  };
  
  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    setLogs([]);

    try {
        addLog("Начало генерации аналитики...");
        addLog("Подготовка данных для AI...");
        const input: MeditrackRxInsightsInput = {
            patients,
            medicines,
            prescriptions,
            dispensations
        };
        addLog("Данные подготовлены. Вызов AI-потока...");
        
        const result = await meditrackRxInsights(input);

        if (result && result.analysis) {
             setAnalysisResult(result.analysis);
             addLog("Аналитика успешно сгенерирована.");
             toast({
                title: "Успех",
                description: "Аналитический отчет успешно сгенерирован.",
             });
        } else {
            throw new Error('AI did not return a valid analysis.');
        }

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Произошла неизвестная ошибка';
        addLog(`Произошла ошибка: ${errorMessage}`);
        toast({
            title: "Ошибка",
            description: `Не удалось сгенерировать аналитику: ${errorMessage}`,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
        addLog("Процесс генерации завершен.");
    }
  };

  return (
    <div className="container mx-auto py-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">AI-аналитика</h1>
          <p className="text-muted-foreground">Автоматическая генерация аналитических отчетов.</p>
        </div>
        <Button onClick={handleGenerateAnalysis} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Генерация...
            </>
          ) : (
            'Сгенерировать отчет'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Аналитический отчет</CardTitle>
                    <CardDescription>Результат анализа данных о пациентах и медикаментах.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[500px] w-full pr-4">
                        {isLoading && !analysisResult && (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {analysisResult && (
                             <ReactMarkdown className="prose dark:prose-invert max-w-none">
                                {analysisResult}
                            </ReactMarkdown>
                        )}
                         {!isLoading && !analysisResult && (
                             <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">Нажмите "Сгенерировать отчет", чтобы начать.</p>
                            </div>
                         )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Логи выполнения</CardTitle>
                    <CardDescription>Отслеживание процесса генерации.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96 w-full bg-muted rounded-md p-2" ref={logsContainerRef}>
                        <pre className="text-xs whitespace-pre-wrap">
                            {logs.join('\n')}
                        </pre>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
