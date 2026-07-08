'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Lightbulb, Upload } from 'lucide-react';
import type { Product } from '@/lib/types';
import ProductCard from '../product-card';
import { Separator } from '../ui/separator';

interface AiWardrobeAssistantProps {
  wardrobe: Product[];
}

type AnalysisResult = {
  summary: string;
  gaps: string[];
  recommendations: string[];
};

export default function AiWardrobeAssistant({ wardrobe }: AiWardrobeAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysis(null);
    setMatchedProducts([]);

    try {
      const res = await fetch('/api/ai/wardrobe-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: wardrobe.map((p) => ({
            title: p.name,
            category: p.category,
            color: p.color,
            tags: p.tags ?? [],
          })),
        }),
      });
      const data = (await res.json()) as Partial<AnalysisResult> & {
        recommendations?: string[];
      };
      if (data.summary) setAnalysis(data as AnalysisResult);

      if (data.recommendations?.length) {
        const productsRes = await fetch('/data/products.json');
        const allProducts = (await productsRes.json()) as Product[];
        const q = data.recommendations[0]?.toLowerCase().split(/\s+/)[0] ?? '';
        const matched = allProducts
          .filter(
            (p) =>
              q &&
              (p.name.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q)))
          )
          .slice(0, 4);
        setMatchedProducts(matched.length ? matched : allProducts.slice(0, 3));
      }
    } catch (e) {
      console.error('Wardrobe analysis failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-accent/50 bg-accent/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot /> AI-ассистент
        </CardTitle>
        <CardDescription>
          Проанализируйте свой гардероб, чтобы получить персональные рекомендации.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analysis ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-md bg-accent/20 p-3 text-sm text-accent-foreground/80">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="mb-1 font-semibold">Анализ:</p>
                <p>{analysis.summary}</p>
                {analysis.gaps?.length > 0 && (
                  <p className="mt-2 text-xs opacity-80">Не хватает: {analysis.gaps.join(', ')}</p>
                )}
                {analysis.recommendations?.length > 0 && (
                  <p className="mt-1 text-xs opacity-80">
                    Рекомендуем: {analysis.recommendations.join(', ')}
                  </p>
                )}
              </div>
            </div>
            {matchedProducts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Подходящие товары:</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {matchedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
            <Separator />
            <Button onClick={handleAnalyze} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              Проанализировать снова
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Нажмите, чтобы AI подобрал вещи, которые идеально дополнят ваш стиль.
            </p>
            <Button onClick={handleAnalyze} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              Анализировать весь гардероб
            </Button>
            <div className="relative">
              <Separator />
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent/10 px-2 text-xs text-muted-foreground">
                ИЛИ
              </span>
            </div>
            <Button variant="secondary" className="w-full" disabled={isLoading}>
              <Upload className="mr-2 h-4 w-4" />
              Загрузить фото вещи
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
