'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, Loader2, Printer, Settings } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { generateInsightsAction } from './actions';
import ReactMarkdown from 'react-markdown';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';


export default function AiInsightsPage() {
  const { patients, medicines, prescriptions, dispensations } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  
  const [useProxy, setUseProxy] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const result = await generateInsightsAction({
        patients,
        medicines,
        prescriptions,
        dispensations,
        useProxy,
        proxyUrl,
      });
      setReport(result);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="container mx-auto py-2" id="ai-insights-page">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold font-headline">AI-аналитика</h1>
          <p className="text-muted-foreground">Автоматическая генерация аналитических отчетов.</p>
        </div>
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Settings className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Прокси-сервер</h4>
                        <p className="text-sm text-muted-foreground">
                        Настройте прокси-сервер для запросов.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center space-x-2">
                            <Switch id="use-proxy" checked={useProxy} onCheckedChange={setUseProxy} />
                            <Label htmlFor="use-proxy">Использовать прокси</Label>
                        </div>
                        {useProxy && (
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="proxy-url">URL</Label>
                                <Input
                                id="proxy-url"
                                value={proxyUrl}
                                onChange={(e) => setProxyUrl(e.target.value)}
                                placeholder="http://user:pass@host:port"
                                className="col-span-2 h-8"
                                />
                            </div>
                        )}
                    </div>
                    </div>
                </PopoverContent>
            </Popover>

           {report && !isLoading && (
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Печать
            </Button>
           )}
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {report ? 'Сгенерировать заново' : 'Сгенерировать отчет'}
                </>
              )}
            </Button>
        </div>
      </div>
      <Card className="min-h-[600px]" id="report-card">
        <CardHeader className="print:hidden">
          <CardTitle className="flex items-center gap-2">
            <Bot />
            Аналитический отчет
          </CardTitle>
          <CardDescription>
            {report ? 'Отчет сгенерирован ниже. Вы можете его распечатать или сохранить в PDF.' : 'Нажмите кнопку, чтобы сгенерировать отчет на основе текущих данных.'}
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
             <Alert variant="destructive" className="print:hidden">
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {report && (
             <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{report}</ReactMarkdown>
             </div>
          )}
           {!isLoading && !error && !report && (
               <div className="flex flex-col items-center justify-center h-[400px] text-center print:hidden">
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
