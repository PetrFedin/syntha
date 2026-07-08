'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Image } from 'lucide-react';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { RegistryPageHeader } from '@/components/design-system';

import { ROUTES } from '@/lib/routes';
import { getRelatedLinks } from '@/lib/data/integration-modules';

/** Colect: AI Creator Studio — генерация описаний, lookbook, контент-планы. */
export default function BrandAiToolsPage() {
  const links = getRelatedLinks('ai-creator-studio').map((l) => ({ label: l.label, href: l.href }));

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-20">
      <RegistryPageHeader
        title="AI Creator Studio"
        leadPlain="Генерация описаний, lookbook и контент-планы по SKU и каналам (демо Colect)."
        actions={
          <Badge variant="outline" className="shrink-0 text-[9px]">
            Colect
          </Badge>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> Описания
            </CardTitle>
            <CardDescription>Генерация описаний товаров по фото и атрибутам.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm">
              Создать
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Image className="h-4 w-4" /> Lookbook / контент-планы
            </CardTitle>
            <CardDescription>Сценарии съёмок, планирование контента по сезонам.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm">
              Создать
            </Button>
          </CardContent>
        </Card>
        <Card className="border-accent-primary/25 bg-accent-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="text-accent-primary h-4 w-4" /> Копирайт под канал
            </CardTitle>
            <CardDescription>
              Один SKU → тексты для Wildberries, Ozon, Instagram (тон, ограничения длины, ключевые
              слова).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="default" size="sm" className="w-full sm:w-auto">
              Сгенерировать пакет
            </Button>
            <p className="text-[10px] text-muted-foreground">
              Демо: подключение к LLM и шаблонам каналов.
            </p>
          </CardContent>
        </Card>
      </div>
      <RelatedModulesBlock links={links} title="Связанные модули" />
    </CabinetPageContent>
  );
}
