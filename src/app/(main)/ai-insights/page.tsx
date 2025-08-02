'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import { meditrackRxInsights, type MeditrackRxInsightsInput } from '@/ai/flows/meditrack-rx-insights';
import { Loader, Sparkles, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';

export default function AiInsightsPage() {
  const { patients, medicines, prescriptions, dispensations } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const input: MeditrackRxInsightsInput = {
        patients,
        medicines,
        prescriptions,
        dispensations,
      };
      
      const result = await meditrackRxInsights(input);
      setAnalysis(result.analysis);
      toast({
        title: 'Анализ завершен',
        description: 'Отчет успешно сгенерирован.',
      });
    } catch (e: any) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Ошибка генерации',
        description: errorMessage,
      });
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
              <Loader className="mr-2 h-4 w-4 animate-spin" />
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
          <CardTitle>Сводный аналитический отчет</CardTitle>
          <CardDescription>
            Нажмите кнопку "Сгенерировать отчет", чтобы получить сводку по текущим данным.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <Loader className="h-16 w-16 animate-spin text-primary mb-4" />
              <p className="text-lg font-semibold">Анализируем данные...</p>
              <p className="text-sm text-muted-foreground mt-2">Это может занять некоторое время.</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-lg font-semibold">Произошла ошибка</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">{error}</p>
            </div>
          )}

          {analysis && !isLoading && (
            <ScrollArea className="h-[500px] rounded-md border p-4">
                <ReactMarkdown
                  className="prose prose-sm dark:prose-invert max-w-none"
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-6 mb-3 border-b pb-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                    li: ({node, ...props}) => <li className="mb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                  }}
                >
                  {analysis}
                </ReactMarkdown>
            </ScrollArea>
          )}

          {!analysis && !isLoading && !error && (
             <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">Готов к анализу</p>
                <p className="text-sm text-muted-foreground mt-2">Результаты появятся здесь.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
