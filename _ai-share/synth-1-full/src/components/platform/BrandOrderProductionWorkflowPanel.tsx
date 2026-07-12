'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileCheck2,
  PackageCheck,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { roleCoreCabinetHref } from '@/lib/platform-core-cabinet-workspace';
import { cn } from '@/lib/utils';

type ChainStep = {
  id: string;
  labelRu: string;
  done: boolean;
};

type Props = {
  collectionId: string;
  orderId: string;
  articleId?: string;
  productionOrderId?: string;
  chainSteps: readonly ChainStep[];
};

type WorkflowStage = {
  id: 'qc' | 'packing' | 'shipping' | 'closeout';
  title: string;
  description: string;
  sectionId: string;
  requiredDocuments: readonly string[];
  icon: typeof ShieldCheck;
  aliases: readonly string[];
};

const STAGES: readonly WorkflowStage[] = [
  {
    id: 'qc',
    title: 'QC',
    description: 'Проверка качества и разрешение на упаковку.',
    sectionId: 'brand-op-qc',
    requiredDocuments: ['QC report'],
    icon: ShieldCheck,
    aliases: ['qc', 'quality', 'quality_control', 'inspection'],
  },
  {
    id: 'packing',
    title: 'Packing',
    description: 'Комплектация заказа и выпуск упаковочного листа.',
    sectionId: 'brand-op-packing',
    requiredDocuments: ['Packing list', 'Invoice'],
    icon: PackageCheck,
    aliases: ['packing', 'packed', 'packing_list'],
  },
  {
    id: 'shipping',
    title: 'Shipping',
    description: 'Подготовка ASN, передача перевозчику и контроль ETA.',
    sectionId: 'brand-op-shipping',
    requiredDocuments: ['ASN', 'Shipment documents'],
    icon: Send,
    aliases: ['shipping', 'shipment', 'dispatched', 'delivery'],
  },
  {
    id: 'closeout',
    title: 'Closeout',
    description: 'Подтверждение приёмки, закрытие claims и заказа.',
    sectionId: 'brand-op-closeout',
    requiredDocuments: ['Acceptance report'],
    icon: FileCheck2,
    aliases: ['closeout', 'closed', 'accepted', 'acceptance'],
  },
] as const;

function stageState(stage: WorkflowStage, chainSteps: readonly ChainStep[]) {
  const matching = chainSteps.filter((step) => {
    const normalized = step.id.toLowerCase();
    return stage.aliases.some((alias) => normalized.includes(alias));
  });

  if (matching.some((step) => step.done)) return 'done' as const;
  if (matching.length > 0) return 'active' as const;
  return 'not_published' as const;
}

export function BrandOrderProductionWorkflowPanel({
  collectionId,
  orderId,
  articleId,
  productionOrderId,
  chainSteps,
}: Props) {
  const stages = STAGES.map((stage) => ({ ...stage, state: stageState(stage, chainSteps) }));
  const activeStage = stages.find((stage) => stage.state === 'active') ??
    stages.find((stage) => stage.state === 'not_published') ??
    stages[stages.length - 1];

  return (
    <section
      className="space-y-2"
      data-testid="brand-op-workflow-panel"
      aria-label="QC, упаковка, отгрузка и закрытие"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-text-primary">Исполнение заказа</p>
          <p className="text-[10px] text-text-muted">
            {productionOrderId ? `PO ${productionOrderId}` : 'Production Order ещё не опубликован'}
          </p>
        </div>
        <span className="text-[10px] text-text-muted">
          {stages.filter((stage) => stage.state === 'done').length} из {stages.length} завершено
        </span>
      </div>

      <ol className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const href = roleCoreCabinetHref({
            roleId: 'brand',
            pillarId: 'order_production',
            collectionId,
            sectionId: stage.sectionId,
            orderId,
            articleId,
          });

          return (
            <li key={stage.id}>
              <Link
                href={href}
                className={cn(
                  'group flex min-h-[7.25rem] flex-col rounded-md border p-2.5 transition-colors',
                  stage.state === 'done'
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : stage.state === 'active'
                      ? 'border-amber-200 bg-amber-50/60'
                      : 'border-border-subtle bg-bg-surface hover:bg-bg-surface2'
                )}
                data-testid={`brand-op-workflow-stage-${stage.id}`}
                data-stage-state={stage.state}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-text-primary">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {stage.title}
                  </span>
                  {stage.state === 'done' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  ) : (
                    <Circle
                      className={cn(
                        'h-3.5 w-3.5',
                        stage.state === 'active' ? 'text-amber-600' : 'text-text-muted'
                      )}
                      aria-hidden
                    />
                  )}
                </div>
                <p className="mt-1 text-[10px] leading-4 text-text-secondary">{stage.description}</p>
                <div className="mt-auto pt-2">
                  <p className="text-[9px] font-medium uppercase tracking-[0.06em] text-text-muted">
                    Документы
                  </p>
                  <p className="mt-0.5 text-[10px] text-text-secondary">
                    {stage.requiredDocuments.join(' · ')}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-text-primary group-hover:underline">
                    {stage.state === 'not_published' ? 'Открыть этап' : 'Продолжить'}
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      {activeStage ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-bg-surface2/50 px-2.5 py-2">
          <div className="min-w-0">
            <p className="text-[10px] text-text-muted">Следующий рабочий этап</p>
            <p className="truncate text-[11px] font-medium text-text-primary">{activeStage.title}</p>
          </div>
          <Link
            href={roleCoreCabinetHref({
              roleId: 'brand',
              pillarId: 'order_production',
              collectionId,
              sectionId: activeStage.sectionId,
              orderId,
              articleId,
            })}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md bg-accent-primary px-2.5 text-[11px] font-semibold text-accent-primary-foreground"
          >
            Открыть
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
