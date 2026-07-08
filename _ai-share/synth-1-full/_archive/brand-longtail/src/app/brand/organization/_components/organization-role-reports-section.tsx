'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useUIState } from '@/providers/ui-state';
import { CeoReportSheet, REPORT_DATA } from '@/components/brand/ceo-report-sheet';
import { registryFeedLayout } from '@/lib/ui/registry-feed-layout';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionBlock } from '@/components/brand/SectionBlock';
import type { RoleReport } from './organization-overview-lib';
import { ROLE_REPORTS } from './organization-overview-lib';
import { OrgHubRoleReportsSkeleton } from './organization-hub-skeletons';

export type OrganizationRoleReportsSectionProps = {
  /** Совместно с партнёрским блоком и модулями — без статики поверх неготовых данных */
  healthLoading?: boolean;
};

export function OrganizationRoleReportsSection({
  healthLoading = false,
}: OrganizationRoleReportsSectionProps) {
  const { profile } = useAuth();
  const { businessMode } = useUIState();
  const [activeReportRole, setActiveReportRole] = useState<RoleReport | null>(null);
  const canSeeRoleReports = !!profile;

  if (healthLoading) {
    return (
      <SectionBlock
        title="Результаты бренда по ролям"
        meta={{
          description: 'Краткое описание результатов бренда с позиции CEO, CFO, COO и др.',
          purpose: 'Для владельцев и пользователей, зарегистрированных под соответствующей ролью.',
          functionality: ['Отчёт CEO', 'Отчёт CFO', 'Отчёт COO', 'и др.'],
          importance: 7,
        }}
        accentColor="indigo"
        className="min-w-0"
      >
        <OrgHubRoleReportsSkeleton />
      </SectionBlock>
    );
  }

  if (!canSeeRoleReports) return null;

  return (
    <SectionBlock
      title="Результаты бренда по ролям"
      meta={{
        description: 'Краткое описание результатов бренда с позиции CEO, CFO, COO и др.',
        purpose: 'Для владельцев и пользователей, зарегистрированных под соответствующей ролью.',
        functionality: ['Отчёт CEO', 'Отчёт CFO', 'Отчёт COO', 'и др.'],
        importance: 7,
      }}
      accentColor="indigo"
      className="min-w-0"
    >
      <div className={cn(registryFeedLayout.panelCardSoft, 'p-4')}>
        <p className="text-text-secondary mb-3 text-xs">
          Выберите роль для просмотра сводки результатов бренда с её позиции:
        </p>
        <div className="flex flex-wrap gap-2">
          {ROLE_REPORTS.filter((r) => {
            const rd = (REPORT_DATA as Record<string, { scope?: string }>)[r.id];
            return !rd || rd.scope === 'shared' || rd.scope === businessMode;
          }).map((role) => (
            <Button
              key={role.id}
              variant="outline"
              size="sm"
              className="border-border-default hover:border-accent-primary/30 hover:bg-accent-primary/10 h-8 gap-1.5 px-3 text-[9px] font-bold uppercase"
              onClick={() => setActiveReportRole(role.id)}
            >
              <UserCircle className="size-3" /> {role.label}
            </Button>
          ))}
        </div>
      </div>
      <CeoReportSheet
        open={!!activeReportRole}
        onOpenChange={(open) => !open && setActiveReportRole(null)}
        role={activeReportRole || 'CEO'}
      />
    </SectionBlock>
  );
}
