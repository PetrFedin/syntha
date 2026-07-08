'use client';

import { useCallback, useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useArticleWorkspace } from '@/components/brand/production/article-workspace-context';
import {
  Workshop2OperationalPanelChrome,
  Workshop2OperationalPanelShell,
} from '@/components/brand/production/workshop2-operational-panel-chrome';
import { Workshop2B2BIntegrationPanel } from '@/components/brand/production/Workshop2B2BIntegrationPanel';
import { formatWorkshop2PersistToastTitle } from '@/lib/production/workshop2-persist-toast-messages';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

export function Workshop2ArticlePlanPoPanel({
  dossier = null,
  articleId,
}: {
  dossier?: Workshop2DossierPhase1 | null;
  articleId?: string;
} = {}) {
  const { bundle, loading } = useArticleWorkspace();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setBusy(false);
  }, []);
  const noop = useCallback(() => undefined, []);
  void noop;
  void formatWorkshop2PersistToastTitle;
  if (loading || !bundle) return <p className="text-text-secondary text-sm">Загрузка…</p>;
  return (
    <Workshop2OperationalPanelShell>
      <Workshop2OperationalPanelChrome
        icon={LucideIcons.CalendarRange}
        title="План · PO"
        description="Plan PO panel"
      />
      {dossier ? <Workshop2B2BIntegrationPanel dossier={dossier} articleId={articleId} /> : null}
    </Workshop2OperationalPanelShell>
  );
}
