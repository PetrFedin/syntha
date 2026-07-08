'use client';

/**
 * Карточка на экране создания заказа: что берём у JOOR/NuOrder и что добавляем для РФ и лидерства продукта.
 */
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';
import { operationalLayoutContract as o } from '@/lib/ui/operational-layout-contract';
import { cn } from '@/lib/utils';
import { getSynthaThreeCoresQuickLinksForBuyer } from '@/lib/syntha-priority-cores';

const BASELINE = [
  'Матрица заказа, лайншиты, окна доставки (JOOR / NuOrder)',
  'Working Order · экспорт во внешние системы',
  'Каталог, прайсы, переоформления (amendments)',
];

const RF = [
  'НДС, отсрочки и условия РФ — отдельный контур (`/brand/finance/rf-terms`, ЭДО)',
  'Документы, УПД, маркировка / КИЗ — связка с compliance и складом',
  'Календари поставок и задач — не оторваны от заказа и производства',
];

const EDGE = [
  'Один контур: оптовый заказ ↔ ТЗ ↔ цех ↔ заметки v1 API (не только «маркетплейс заказа»)',
  'Чат и календарь платформы — не отдельные приложения: переговоры и сроки привязаны к заказу и селекциям',
  'Видимость исполнения у бренда для ритейла + вертикальные ссылки на tech-pack',
  'Control Center и интеграции — точка входа в единую ОС, не разрозненные порталы',
];

export function B2bOrderFormationSynthaEdgeCard({ className }: { className?: string }) {
  return (
    <Card
      className={cn(o.panel, 'shadow-none', className)}
      data-testid="b2b-order-formation-edge-card"
    >
      <CardHeader className="border-border-default/60 border-b pb-3">
        <CardTitle className="text-text-primary text-[11px] font-black uppercase tracking-[0.2em]">
          JOOR / NuOrder и дальше
        </CardTitle>
        <CardDescription className="text-text-muted text-xs leading-relaxed">
          Базовые паттерны wholesale — плюс российская юрисдикация и то, чего типично нет у
          «чистого» западного B2B-портала: производство и документы в одной цепочке.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4 sm:grid-cols-3">
        <div>
          <p className="text-text-muted mb-2 text-[9px] font-black uppercase tracking-widest">
            Как у лидеров рынка
          </p>
          <ul className="space-y-1.5">
            {BASELINE.map((t) => (
              <li key={t} className="text-text-primary flex gap-2 text-[11px] leading-snug">
                <Check className="text-accent-primary mt-0.5 size-3.5 shrink-0" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-text-muted mb-2 text-[9px] font-black uppercase tracking-widest">
            Россия
          </p>
          <ul className="space-y-1.5">
            {RF.map((t) => (
              <li key={t} className="text-text-primary flex gap-2 text-[11px] leading-snug">
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-text-muted mb-2 text-[9px] font-black uppercase tracking-widest">
            Syntha
          </p>
          <ul className="space-y-1.5">
            {EDGE.map((t) => (
              <li key={t} className="text-text-primary flex gap-2 text-[11px] leading-snug">
                <Check className="mt-0.5 size-3.5 shrink-0 text-indigo-600" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="border-border-default/60 bg-bg-surface2/40 flex flex-wrap gap-2 border-t px-6 py-3">
        <span className="text-text-muted w-full text-[9px] font-black uppercase tracking-[0.18em]">
          Рабочие переходы по ядрам
        </span>
        {getSynthaThreeCoresQuickLinksForBuyer().map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-text-primary hover:bg-bg-surface2 border-border-subtle hover:text-accent-primary rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </CardFooter>
    </Card>
  );
}
