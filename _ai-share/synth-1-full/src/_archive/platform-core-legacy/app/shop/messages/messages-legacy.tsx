'use client';

import { Suspense } from 'react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import MessagesOS from '@/components/user/messages-os';
import { CommunicationsOperationalStrip } from '@/components/brand/communications/CommunicationsOperationalStrip';
import { B2bPriorityWorkflowPanel } from '@/components/b2b/B2bPriorityWorkflowPanel';
import { getSynthaThreeCoresFullMatrixGroups } from '@/lib/syntha-priority-cores';
import { B2bOrderUrlContextBanner } from '@/components/b2b/B2bOrderUrlContextBanner';

export function ShopMessagesLegacyPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-6 pb-24 sm:px-6">
      <div className="border-border-subtle bg-bg-surface2/80 sticky top-0 z-10 -mx-4 space-y-2 border-b px-4 py-3 sm:-mx-6 sm:px-6">
        <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
          Сообщения · операционный контур
        </p>
        <p className="text-text-secondary text-xs leading-snug">
          Переговоры с брендом — здесь; календари поставок и закупок, матрица и подборки заказа — в
          одном процессе (см. блок ниже после чата).
        </p>
        <CommunicationsOperationalStrip variant="shop" />
        <Suspense fallback={null}>
          <B2bOrderUrlContextBanner variant="shop" className="rounded-lg" />
        </Suspense>
      </div>
      <MessagesOS />
      <B2bPriorityWorkflowPanel
        title="Три ядра платформы — рядом с перепиской"
        lead="Та же полная матрица, что на реестре заказов: цех у бренда, ваш оптовый контур, коммуникации и горизонталь ролей."
        groups={getSynthaThreeCoresFullMatrixGroups()}
      />
    </CabinetPageContent>
  );
}
