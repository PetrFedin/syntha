'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { BookOpen, Plus, ArrowLeft } from 'lucide-react';
import { WidgetCard } from '@/components/ui/widget-card';
import { getAcademyLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import { RegistryPageHeader } from '@/components/design-system';

export default function CreateBrandCoursePage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Создание курса бренда"
        leadPlain="Собственные курсы и обучающие материалы: ДНК бренда, продукты, процессы. Связь с Академией, Team."
        eyebrow={
          <Breadcrumb
            items={[
              { label: 'Бренд', href: ROUTES.brand.home },
              { label: 'Академия', href: ROUTES.brand.academy },
              { label: 'Создать курс' },
            ]}
          />
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.academy}>Академия бренда</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.academyPlatform}>Академия платформы</Link>
            </Button>
          </>
        }
      />
      <WidgetCard
        title="Конструктор курса"
        description="Модули, уроки, тесты, сертификация. Скоро: полный редактор курсов."
      >
        <Card className="border-accent-primary/30 bg-accent-primary/10 rounded-xl border border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Конструктор курса
            </CardTitle>
            <CardDescription>
              Модули, уроки, тесты, сертификация. Скоро: полный редактор курсов.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Plus className="text-accent-primary mb-4 h-12 w-12" />
              <p className="text-text-secondary mb-2 text-sm font-medium">
                Редактор курсов в разработке
              </p>
              <p className="text-text-secondary mb-4 text-[11px]">
                Модули, видео, тесты, сертификаты
              </p>
              <Button variant="outline" asChild>
                <Link href={ROUTES.brand.academy}>← Назад в Академию</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </WidgetCard>
      <RelatedModulesBlock links={getAcademyLinks()} />
    </CabinetPageContent>
  );
}
