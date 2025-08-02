'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { generateInsights } from '@/lib/ai';
import ReactMarkdown from 'react-markdown';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AiInsightsPage() {
  const { patients, medicines, prescriptions, dispensations } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const result = await generateInsights({
        patients,
        medicines,
        prescriptions,
        dispensations,
      });
      setReport(result);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">AI-аналитика</h1>
          <p className="text-muted-foreground">Автоматическая генерация аналитических отчетов.</p>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Генерация...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Сгенерировать отчет
            </>
          )}
        </Button>
      </div>
      <Card className="min-h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot />
            Аналитический отчет
          </CardTitle>
          <CardDescription>
            Нажмите кнопку, чтобы сгенерировать отчет на основе текущих данных.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-lg font-semibold">AI анализирует данные...</p>
              <p className="text-sm text-muted-foreground mt-2">Это может занять некоторое время.</p>
            </div>
          )}
          {error && (
             <Alert variant="destructive">
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {report && (
             <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{report}</ReactMarkdown>
             </div>
          )}
           {!isLoading && !error && !report && (
               <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">Ваш отчет появится здесь</p>
                  <p className="text-sm text-muted-foreground mt-2">Нажмите "Сгенерировать отчет", чтобы начать.</p>
              </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
