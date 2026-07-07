'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle, Package } from 'lucide-react';
import {
  getMockOrderRecommendations,
  getMockOrderAnomalies,
  type OrderRecommendation,
  type OrderAnomaly,
} from '@/lib/ai/order-recommendations';

interface OrderRecommendationsBlockProps {
  orderLineCount?: number;
}

export function OrderRecommendationsBlock({ orderLineCount = 0 }: OrderRecommendationsBlockProps) {
  const recommendations = getMockOrderRecommendations(orderLineCount);
  const anomalies = getMockOrderAnomalies();

  return (
    <div className="space-y-4">
      {recommendations.length > 0 && (
        <Card className="border-accent-primary/20 bg-accent-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="text-accent-primary h-4 w-4" />
              AI-рекомендации
            </CardTitle>
            <CardDescription>
              WizCommerce / RepSpark: часто заказывают вместе, дополнения к заказу
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.map((r) => (
              <RecommendationRow key={r.id} rec={r} />
            ))}
          </CardContent>
        </Card>
      )}
      {anomalies.length > 0 && (
        <Card className="border-amber-100 bg-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Аномалии и подсказки
            </CardTitle>
            <CardDescription>Нестандартные qty, перекос по размерам, MOQ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {anomalies.map((a) => (
              <AnomalyRow key={a.id} anomaly={a} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RecommendationRow({ rec }: { rec: OrderRecommendation }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-lg bg-white/60 p-2">
      <div>
        <p className="text-sm font-medium">{rec.title}</p>
        <p className="text-text-secondary text-xs">{rec.description}</p>
        {rec.productName && (
          <p className="text-text-secondary mt-0.5 flex items-center gap-1 text-xs">
            <Package className="h-3 w-3" /> {rec.productName}
            {rec.suggestedQty != null && ` · +${rec.suggestedQty} шт.`}
          </p>
        )}
      </div>
      <Button size="sm" variant="outline" className="shrink-0 text-[10px]">
        Добавить
      </Button>
    </div>
  );
}

function AnomalyRow({ anomaly }: { anomaly: OrderAnomaly }) {
  const severityColor =
    anomaly.severity === 'high'
      ? 'destructive'
      : anomaly.severity === 'medium'
        ? 'default'
        : 'secondary';
  return (
    <div className="rounded-lg bg-white/60 p-2">
      <div className="mb-0.5 flex items-center gap-2">
        <Badge variant={severityColor} className="text-[9px]">
          {anomaly.severity}
        </Badge>
        <span className="text-sm font-medium">{anomaly.title}</span>
      </div>
      <p className="text-text-secondary text-xs">{anomaly.description}</p>
      {anomaly.suggestedAction && (
        <p className="text-accent-primary mt-1 text-xs">{anomaly.suggestedAction}</p>
      )}
    </div>
  );
}
