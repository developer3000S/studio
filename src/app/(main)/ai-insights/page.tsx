'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Bot, Loader, CircleCheck, AlertTriangle, Workflow } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { meditrackRxInsights, MeditrackRxInsightsInput } from '@/ai/flows/meditrack-rx-insights';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


export default function AiInsightsPage() {
  const { patients, medicines, prescriptions, dispensations } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState('gemini-1.5-flash');
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setLogs([]);

    try {
        addLog('Начало генерации аналитики...');
        const inputData: MeditrackRxInsightsInput = {
            patients,
            medicines,
            prescriptions,
            dispensations,
            model
        };
        addLog('Подготовка данных для AI...');
        addLog(`Данные подготовлены. Вызов AI-потока с моделью ${model}...`);
        
        const response = await meditrackRxInsights(inputData);
        
        setResult(response.report);
        addLog('Процесс генерации завершен.');
    } catch (e: any) {
        console.error(e);
        const errorMessage = e.message || 'Произошла неизвестная ошибка.';
        addLog(`Произошла ошибка: ${errorMessage}`);
        setError('Не удалось получить AI-аналитику. Попробуйте позже.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-2">
       <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            AI-аналитика
          </h1>
          <p className="text-muted-foreground">Используйте ИИ для получения ценных сведений из данных.</p>
        </div>
         <div className="flex items-center gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="model">Модель</Label>
                <Select value={model} onValueChange={setModel} disabled={isLoading}>
                    <SelectTrigger id="model" className="w-[180px]">
                        <SelectValue placeholder="Выберите модель" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleGenerate} disabled={isLoading} className="self-end">
                {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                Сгенерировать
            </Button>
        </div>
      </div>
      
      <div className="grid gap-6 mt-6">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                {result || isLoading || error ? <CircleCheck className={cn("h-5 w-5", result && "text-green-500")} /> : <Workflow className="h-5 w-5" />}
                 Отчет
            </CardTitle>
            <CardDescription>
                {
                    isLoading ? "ИИ-ассистент анализирует данные... Это может занять некоторое время." :
                    error ? "Произошла ошибка при генерации отчета." :
                    result ? "Аналитический отчет, сгенерированный ИИ." :
                    "Нажмите 'Сгенерировать', чтобы получить аналитический отчет по вашим данным."
                }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
             {error && (
                <div className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <p>{error}</p>
                </div>
            )}
            {result && (
              <ScrollArea className="h-[500px] p-4 border rounded-md bg-secondary/20">
                <ReactMarkdown
                  className="prose prose-sm dark:prose-invert max-w-none"
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-6 mb-3 border-b pb-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-1" {...props} />,
                    p: ({node, ...props}) => <p className="leading-relaxed" {...props} />,
                  }}
                >
                    {result}
                </ReactMarkdown>
               </ScrollArea>
            )}
            {!isLoading && !result && !error && (
                <div className="text-center text-muted-foreground py-10">
                    <Bot className="mx-auto h-12 w-12" />
                    <p className="mt-4">Здесь появится результат анализа</p>
                </div>
            )}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Логи выполнения</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-40 w-full rounded-md border p-4 font-mono text-xs">
                    {logs.map((log, i) => <p key={i}>{log}</p>)}
                </ScrollArea>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
