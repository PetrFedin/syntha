'use client';

import Link from 'next/link';
import { ArrowUpRight, Network, Plug, ShieldCheck } from 'lucide-react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { INTEGRATION_MODULES, getModulesByPhase } from '@/lib/data/integration-modules';
import { ROUTES } from '@/lib/routes';

const PHASE_META = {
  1: { title: 'Операционный контур РФ', description: 'ERP, условия оплаты и закупочные сервисы.' },
  2: {
    title: 'Оптовая коммерция',
    description: 'Совместная закупка, маржа, события и условия заказа.',
  },
  3: {
    title: 'AI и контент',
    description: 'Прикладные AI-инструменты и формирование коммерческой селекции.',
  },
  4: {
    title: 'Рабочее место байера',
    description: 'Мобильные и кабинетные сценарии для закупки и партнёров.',
  },
} as const;

const relatedLinks = [
  { label: 'Заказы B2B', href: ROUTES.brand.b2bOrders },
  { label: 'Логистика и склад', href: ROUTES.brand.logistics },
  { label: 'Документы и ЭДО', href: ROUTES.brand.documents },
];

export default function BrandIntegrationsPage() {
  return (
    <CabinetPageContent
      maxWidth="6xl"
      className="space-y-6 pb-20"
      data-testid="brand-integrations-page"
    >
      <section className="border-border-subtle rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-accent-primary/10 text-accent-primary flex h-9 w-9 items-center justify-center rounded-xl">
                <Plug className="h-4 w-4" aria-hidden="true" />
              </span>
              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest">
                Integration control plane
              </Badge>
            </div>
            <div>
              <h1 className="text-text-primary text-2xl font-black tracking-tight sm:text-3xl">
                Интеграции
              </h1>
              <p className="text-text-secondary mt-2 max-w-3xl text-sm leading-6">
                Единая карта внешних и межмодульных интеграций Syntha. Здесь показывается
                продуктовый контракт и точки входа; статус фактического подключения не имитируется и
                должен поступать только из runtime health конкретного коннектора.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href={ROUTES.brand.b2bOrders} data-testid="brand-integrations-b2b-registry-card">
              Реестр B2B-заказов
              <ArrowUpRight className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border-subtle p-5 shadow-sm">
          <Network className="text-accent-primary h-5 w-5" aria-hidden="true" />
          <h2 className="text-text-primary mt-4 text-sm font-bold">Источник правды</h2>
          <p className="text-text-secondary mt-2 text-xs leading-5">
            Каталог ниже строится из текущего `INTEGRATION_MODULES`, а не из копии legacy-экрана.
          </p>
        </Card>
        <Card className="border-border-subtle p-5 shadow-sm">
          <ShieldCheck className="text-accent-primary h-5 w-5" aria-hidden="true" />
          <h2 className="text-text-primary mt-4 text-sm font-bold">Без фиктивного статуса</h2>
          <p className="text-text-secondary mt-2 text-xs leading-5">
            “Подключено” появляется только там, где есть подтверждённый runtime contract коннектора.
          </p>
        </Card>
        <Card className="border-border-subtle p-5 shadow-sm">
          <Plug className="text-accent-primary h-5 w-5" aria-hidden="true" />
          <h2 className="text-text-primary mt-4 text-sm font-bold">
            {INTEGRATION_MODULES.length} capability entries
          </h2>
          <p className="text-text-secondary mt-2 text-xs leading-5">
            Модули сгруппированы по назначению, чтобы не смешивать ERP, commerce, AI и buyer
            tooling.
          </p>
        </Card>
      </section>

      <section className="space-y-5">
        {[1, 2, 3, 4].map((phase) => {
          const typedPhase = phase as 1 | 2 | 3 | 4;
          const meta = PHASE_META[typedPhase];
          const modules = getModulesByPhase(typedPhase);
          return (
            <div key={phase} className="space-y-3">
              <div>
                <p className="text-accent-primary text-[9px] font-black uppercase tracking-[0.18em]">
                  Контур {phase}
                </p>
                <h2 className="text-text-primary mt-1 text-base font-bold">{meta.title}</h2>
                <p className="text-text-secondary mt-1 text-xs">{meta.description}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {modules.map((module) => (
                  <Card key={module.id} className="border-border-subtle p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-text-primary text-sm font-semibold">{module.label}</p>
                        <p className="text-text-secondary mt-2 text-xs leading-5">
                          {module.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[8px]">
                        P{module.phase}
                      </Badge>
                    </div>
                    <div className="border-border-subtle mt-4 border-t pt-3">
                      <p className="text-text-muted text-[9px] font-semibold uppercase tracking-wider">
                        Product reference
                      </p>
                      <p className="text-text-secondary mt-1 text-[10px]">{module.reference}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <RelatedModulesBlock
        title="Операционные контуры, связанные с интеграциями"
        links={relatedLinks}
      />
    </CabinetPageContent>
  );
}
