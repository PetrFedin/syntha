'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { products } from '@/lib/products';
import { calculateStyleArchetype, ARCHETYPE_LABELS } from '@/lib/fashion/style-archetype';
import type { UserStyleProfileV1 } from '@/lib/fashion/types';
import { Sparkles, BarChart, Palette, LayoutGrid } from 'lucide-react';

export function UserStyleArchetypeBlock() {
  const [profile, setProfile] = useState<UserStyleProfileV1 | null>(null);

  useEffect(() => {
    // В демо считаем на основе всего каталога (как будто это история просмотров)
    // В проде — на основе реальной аналитики из localStorage/DB
    setProfile(calculateStyleArchetype(products.slice(0, 20)));
  }, []);

  if (!profile) return null;

  return (
    <Card className="border-accent-primary/20 bg-accent-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="text-accent-primary h-4 w-4" />
          Ваш Style Archetype
        </CardTitle>
        <CardDescription className="text-xs">
          Автоматический профиль на основе ваших предпочтений и поиска.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Основной стиль
            </p>
            <p className="text-accent-primary text-base font-bold">
              {ARCHETYPE_LABELS[profile.archetype]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Confidence</p>
            <p className="text-accent-primary font-mono text-lg font-bold">{profile.confidence}%</p>
          </div>
        </div>

        <div className="border-accent-primary/20 grid grid-cols-2 gap-3 border-t pt-2">
          <div className="space-y-1.5">
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Palette className="h-3 w-3" /> Любимые цвета
            </p>
            <div className="flex flex-wrap gap-1">
              {profile.colorPreferences.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="bg-accent-primary/15 text-accent-primary h-4 border-none px-1.5 text-[9px] font-normal"
                >
                  {c}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <LayoutGrid className="h-3 w-3" /> Топ категорий
            </p>
            <div className="flex flex-wrap gap-1">
              {profile.topCategories.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="bg-accent-primary/15 text-accent-primary h-4 border-none px-1.5 text-[9px] font-normal"
                >
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
