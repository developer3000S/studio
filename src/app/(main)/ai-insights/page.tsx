'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export default function AiInsightsPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">AI-аналитика</h1>
          <p className="text-muted-foreground">Автоматическая генерация аналитических отчетов.</p>
        </div>
      </div>
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot />
              Аналитический отчет
            </CardTitle>
            <CardDescription>
              Этот раздел находится в разработке.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">Функция AI-аналитики скоро появится</p>
                  <p className="text-sm text-muted-foreground mt-2">Мы работаем над внедрением этой возможности.</p>
              </div>
          </CardContent>
        </Card>
    </div>
  );
}
