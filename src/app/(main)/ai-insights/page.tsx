// src/app/(main)/ai-insights/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function AiInsightsPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">AI-аналитика</h1>
          <p className="text-muted-foreground">Автоматическая генерация аналитических отчетов.</p>
        </div>
      </div>

      <Card className="h-full">
        <CardHeader>
          <CardTitle>Раздел в разработке</CardTitle>
          <CardDescription>Мы работаем над внедрением мощных AI-инструментов для анализа данных.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">Скоро здесь появится интеллектуальная аналитика!</p>
            <p className="text-sm text-muted-foreground mt-2">Следите за обновлениями.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
