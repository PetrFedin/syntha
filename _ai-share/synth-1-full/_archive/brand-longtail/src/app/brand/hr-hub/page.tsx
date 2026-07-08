'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, GraduationCap, UserPlus } from 'lucide-react';
import { getHRHubLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { RegistryPageHeader } from '@/components/design-system';

import { ROUTES } from '@/lib/routes';

const VacanciesContent = dynamic(
  () => import('@/app/brand/hr-hub/vacancies/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);

export default function HRHubPage() {
  const [tab, setTab] = useState('hr-hub');
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-20">
      <RegistryPageHeader
        title="HR-центр"
        leadPlain="Команда, вакансии, онбординг и связь с академией в одном хабе."
      />
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        {/* cabinetSurface v1 */}
        <TabsList className={cabinetSurface.tabsList}>
          <TabsTrigger value="hr-hub" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
            <Users className="h-3 w-3 shrink-0" /> HR Hub
          </TabsTrigger>
          <TabsTrigger value="vacancies" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
            <Briefcase className="h-3 w-3 shrink-0" /> Вакансии
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hr-hub" className={cabinetSurface.cabinetProfileTabPanel}>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href={ROUTES.brand.team}>
              <Card className="border-accent-primary/20 hover:border-accent-primary/30 h-full cursor-pointer rounded-xl border transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" /> Команда
                  </CardTitle>
                  <CardDescription>Управление сотрудниками, роли, доступы</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href={ROUTES.shop.career}>
              <Card className="border-border-subtle hover:border-accent-primary/30 h-full cursor-pointer rounded-xl border transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" /> Вакансии и резюме
                  </CardTitle>
                  <CardDescription>Размещение вакансий, поиск кандидатов</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href={ROUTES.brand.academy}>
              <Card className="border-border-subtle hover:border-accent-primary/30 h-full cursor-pointer rounded-xl border transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" /> Обучение
                  </CardTitle>
                  <CardDescription>Курсы бренда, академия платформы</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Card className="border-border-default bg-bg-surface2/80 rounded-xl border border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" /> Онбординг
                </CardTitle>
                <CardDescription>Чеклисты для новых сотрудников</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary text-[11px]">
                  Скоро: автоматизированные чеклисты онбординга
                </p>
              </CardContent>
            </Card>
          </div>
          <RelatedModulesBlock links={getHRHubLinks()} />
        </TabsContent>
        <TabsContent value="vacancies" className={cabinetSurface.cabinetProfileTabPanel}>
          {tab === 'vacancies' && <VacanciesContent />}
        </TabsContent>
      </Tabs>
    </CabinetPageContent>
  );
}
