'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { WidgetCard } from '@/components/ui/widget-card';
import { EmptyStateB2B } from '@/components/ui/empty-state-b2b';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getAcademyLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import { GraduationCap, Users, Award, UserPlus } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

const MOCK_TEAM_PROGRESS = [
  {
    name: 'Анна К.',
    role: 'Байер',
    course: 'Экономика Fashion-ритейла',
    progress: 85,
    status: 'В процессе',
  },
  {
    name: 'Дмитрий С.',
    role: 'Менеджер закупок',
    course: 'B2B Fashion Economics',
    progress: 100,
    status: 'Завершён',
  },
  {
    name: 'Елена М.',
    role: 'Дизайнер',
    course: 'AI в дизайне одежды',
    progress: 30,
    status: 'В процессе',
  },
];

const MOCK_CERTIFICATES = [
  {
    id: 'cert-1',
    name: 'Syntha B2B Professional',
    holder: 'Дмитрий С.',
    date: '2026-02-15',
    valid: true,
  },
  { id: 'cert-2', name: 'Экономика ритейла', holder: 'Анна К.', date: '2026-01-20', valid: true },
];

export default function AcademyTeamPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Повышение квалификации команды"
        leadPlain="Прогресс команды по курсам платформы и бренда. Сертификаты и достижения."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
              <Link href={ROUTES.brand.academy} className="gap-1.5">
                <GraduationCap className="h-4 w-4" /> Назначить обучение
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
              <Link href={ROUTES.brand.team}>
                <Users className="mr-2 h-4 w-4" /> Команда
              </Link>
            </Button>
          </div>
        }
      />
      <section className="space-y-6">
        <WidgetCard title="Прогресс и сертификаты" description="Курсы и достижения участников">
          <div className="space-y-8">
            <div>
              <p className="text-text-secondary mb-4 text-xs font-bold uppercase tracking-widest">
                Прогресс по курсам
              </p>
              {MOCK_TEAM_PROGRESS.length === 0 ? (
                <EmptyStateB2B
                  icon={UserPlus}
                  title="Нет данных о прогрессе"
                  description="Назначьте курсы команде и отслеживайте прогресс."
                  action={
                    <Button variant="outline" size="sm" asChild>
                      <Link href={ROUTES.brand.academy}>Курсы бренда</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {MOCK_TEAM_PROGRESS.map((m) => (
                    <div
                      key={m.name}
                      className="border-border-default/80 hover:bg-bg-surface2/80 flex items-center justify-between rounded-xl border p-5 transition-colors"
                    >
                      <div>
                        <p className="text-text-primary font-semibold">{m.name}</p>
                        <p className="text-text-secondary text-sm">
                          {m.role} · {m.course}
                        </p>
                        <div className="mt-3 w-64">
                          <Progress value={m.progress} className="h-2 rounded-full" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-text-primary text-lg font-bold">{m.progress}%</p>
                        <p className="text-text-secondary text-xs">{m.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-text-secondary mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                <Award className="h-4 w-4 text-amber-500" /> Сертификаты
              </p>
              {MOCK_CERTIFICATES.length === 0 ? (
                <EmptyStateB2B
                  icon={Award}
                  title="Нет сертификатов"
                  description="Сертификаты появятся после завершения курсов."
                  action={
                    <Button variant="outline" size="sm" asChild>
                      <Link href={ROUTES.brand.academyPlatform}>Курсы платформы</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {MOCK_CERTIFICATES.map((cert) => (
                    <div
                      key={cert.id}
                      className="border-border-default/80 flex items-center justify-between rounded-xl border bg-white p-4"
                    >
                      <div>
                        <p className="text-text-primary font-medium">{cert.name}</p>
                        <p className="text-text-secondary text-sm">
                          {cert.holder} · {cert.date}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-xs text-emerald-600"
                      >
                        Действует
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </WidgetCard>
      </section>

      <RelatedModulesBlock links={getAcademyLinks()} />
    </CabinetPageContent>
  );
}
