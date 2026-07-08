'use client';

import { Button } from '@/components/ui/button';

type Props = {
  show: boolean;
  lifecycleState: 'sent_to_production' | 'handoff_ready';
  onRollback: () => void;
};

/** Баннер «ТЗ заблокировано» + откат в разработку (вынесено из Workshop2Phase1DossierPanel). */
export function Workshop2Phase1DossierPanelRollbackBanner({
  show,
  lifecycleState,
  onRollback,
}: Props) {
  if (!show) return null;

  return (
    <div
      className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4"
      data-testid="workshop2-phase1-dossier-rollback-banner"
    >
      <div>
        <h3 className="text-sm font-semibold text-amber-900">
          Статус: {lifecycleState === 'sent_to_production' ? 'В производстве' : 'Готово к передаче'}
        </h3>
        <p className="text-xs text-amber-800">ТЗ заблокировано для изменений.</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRollback}
        data-testid="workshop2-phase1-dossier-rollback-button"
      >
        Откатить в разработку
      </Button>
    </div>
  );
}
