'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, FileStack, Calendar } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

export default function VacanciesPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <RegistryPageHeader
        title="Вакансии и резюме"
        leadPlain="Открытые позиции, отклики и этапы отбора кандидатов."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Briefcase className="text-accent-primary h-4 w-4" />
              Open positions
            </CardTitle>
            <CardDescription className="text-xs">Активных вакансий</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-2xl font-black">—</p>
          </CardContent>
        </Card>
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <FileStack className="h-4 w-4 text-emerald-600" />
              Applications received
            </CardTitle>
            <CardDescription className="text-xs">Получено резюме</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-2xl font-black">—</p>
          </CardContent>
        </Card>
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Calendar className="h-4 w-4 text-amber-600" />
              Interviews scheduled
            </CardTitle>
            <CardDescription className="text-xs">Запланировано интервью</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-2xl font-black">—</p>
          </CardContent>
        </Card>
      </div>
    </CabinetPageContent>
  );
}
