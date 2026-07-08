'use client';

import {
  useCallback,
  useMemo,
  useState,
  type ComponentProps,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { ResolvedPhase1AttributeRow } from '@/lib/production/attribute-catalog';
import type { Workshop2AssignmentHandoffBundle } from '@/components/brand/production/workshop2-phase1-dossier-panel-assignment-body-bundles';
import { Workshop2DossierAssignmentSendPanel } from '@/components/brand/production/workshop2-phase1-dossier-panel-assignment-send-panel';
import { Workshop2DossierAssignmentStatusBanner } from '@/components/brand/production/workshop2-phase1-dossier-panel-assignment-status-banner';
import type {
  Workshop2DossierSectionRowsExtra,
  Workshop2DossierSectionRowsSharedBundle,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-section-rows';
import { Workshop2VendorBiddingPanel } from '@/components/brand/production/Workshop2VendorBiddingPanel';
import { Workshop2TechPackHandoffBlock } from '@/components/brand/production/Workshop2TechPackHandoffBlock';
import type {
  Workshop2DossierPhase1,
  Workshop2VendorBid,
} from '@/lib/production/workshop2-dossier-phase1.types';
import { Workshop2AssignmentHandoffStatusCollapsible } from '@/components/brand/production/workshop2-handoff-status-banners';
import { summarizeWorkshop2AssignmentSignoffChecklist } from '@/lib/production/workshop2-assignment-signoff-checklist';
import { summarizeWorkshop2FactoryHandoffBundleStatus } from '@/lib/production/workshop2-factory-handoff-bundle-status';
import { evaluateWorkshop2FactoryHandoffCommitGate } from '@/lib/production/workshop2-factory-handoff-commit-gate';
import { persistWorkshop2FactoryHandoffBundleMirrorToDossier } from '@/lib/production/workshop2-factory-handoff-bundle-dossier-persist';
import { buildWorkshop2FinalTzExportContextFromDossier } from '@/lib/production/workshop2-final-tz-spec-export';
import { BrandWorkshop2FactoryPackPreviewPanel } from '@/components/brand/production/BrandWorkshop2FactoryPackPreviewPanel';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  formatWorkshop2PersistToastDescription,
  formatWorkshop2PersistToastTitle,
} from '@/lib/production/workshop2-persist-toast-messages';
import { Workshop2GateChecksBlock } from '@/components/brand/production/Workshop2GateChecksBlock';
import { Workshop2OperationalPgMirrorChip } from '@/components/brand/production/workshop2-operational-panel-chrome';
import { summarizeWorkshop2TzAssignmentPgMirror } from '@/lib/production/workshop2-operational-pg-mirror-status';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';

type AssignmentSendPanelProps = ComponentProps<typeof Workshop2DossierAssignmentSendPanel>;
type HandoffBlockProps = Workshop2AssignmentHandoffBundle;

export function Workshop2DossierSectionBodyAssignment({
  onOpenProblemBlock,
  sampleIntakeCatalogRows,
  sampleIntakeCatalogExtras,
  sectionRowsShared,
  currentPhase,
  sendPanelProps,
  handoffBlockProps,
  articleId,
  collectionId,
  dossier,
  setDossier,
  onOpenPulse,
  tzBlockersFooter,
}: {
  onOpenProblemBlock: () => void;
  sampleIntakeCatalogRows: ResolvedPhase1AttributeRow[];
  sampleIntakeCatalogExtras: Workshop2DossierSectionRowsExtra[];
  sectionRowsShared: Workshop2DossierSectionRowsSharedBundle;
  currentPhase: '1' | '2' | '3';
  sendPanelProps: Omit<AssignmentSendPanelProps, 'children'>;
  handoffBlockProps: HandoffBlockProps;
  articleId: string;
  collectionId?: string;
  dossier: Workshop2DossierPhase1;
  setDossier: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
  onOpenPulse?: () => void;
  tzBlockersFooter: ReactNode;
}) {
  const { toast } = useToast();
  const [handoffMirrorBusy, setHandoffMirrorBusy] = useState(false);

  const assignmentHubReady =
    !sendPanelProps.factorySendHubPreview.firstUnmet && sendPanelProps.tzPreflight.ok;
  const statusText = assignmentHubReady
    ? 'Шаг готов к передаче в цех.'
    : `Дальше: ${sendPanelProps.factorySendHubPreview.firstUnmet?.label ?? sendPanelProps.tzPreflight.issues[0]?.title ?? 'закройте блокеры передачи'}.`;

  const assignmentPgMirror = useMemo(
    () => summarizeWorkshop2TzAssignmentPgMirror(dossier),
    [dossier]
  );
  const assignmentSummary = useMemo(
    () => summarizeWorkshop2AssignmentSignoffChecklist(dossier),
    [dossier]
  );
  const handoffStatus = useMemo(
    () => summarizeWorkshop2FactoryHandoffBundleStatus(dossier),
    [dossier]
  );
  const handoffGate = useMemo(
    () =>
      evaluateWorkshop2FactoryHandoffCommitGate({
        dossier,
        categoryLeafId: dossier.categoryLeafId,
        vaultFileCount: dossier.vaultDocuments?.length ?? 0,
      }),
    [dossier]
  );

  const persistHandoffMirror = useCallback(() => {
    setHandoffMirrorBusy(true);
    const next = persistWorkshop2FactoryHandoffBundleMirrorToDossier(dossier);
    setDossier(next);
    setHandoffMirrorBusy(false);
    toast({
      title: formatWorkshop2PersistToastTitle({ scopeLabelRu: 'Пакет передачи', ok: true }),
      description: formatWorkshop2PersistToastDescription({
        mirrorField: 'factoryHandoffBundleMirror',
        ok: true,
        okHintRu: workshop2PgMirrorStr(next.factoryHandoffBundleMirror, 'hintRu'),
      }),
    });
  }, [dossier, setDossier, toast]);

  const handleBidsUpdate = (updatedBids: Workshop2VendorBid[]) => {
    setDossier((prev) => ({
      ...prev,
      bids: updatedBids,
    }));
  };

  const searchParams = useSearchParams();
  const factoryPackTab = searchParams.get(PILLAR_CAPABILITY_FEATURE_PARAM) === 'factory-pack';
  const factoryPackExportContext = useMemo(
    () =>
      buildWorkshop2FinalTzExportContextFromDossier(dossier, {
        articleId,
        exportLanguage: 'ru_en',
      }),
    [dossier, articleId]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span data-testid="workshop2-tz-assignment-pg-chip">
          <Workshop2OperationalPgMirrorChip {...assignmentPgMirror} />
        </span>
      </div>

      <Workshop2DossierAssignmentStatusBanner
        hubReady={assignmentHubReady}
        statusText={statusText}
        onOpenProblemBlock={onOpenProblemBlock}
        onOpenPulse={onOpenPulse}
      />

      <Workshop2AssignmentHandoffStatusCollapsible
        assignmentSummary={assignmentSummary}
        handoffStatus={handoffStatus}
        onPersistHandoff={persistHandoffMirror}
        handoffMirrorBusy={handoffMirrorBusy}
        techPackReady={handoffBlockProps.techPackReady}
      />

      <div data-testid="workshop2-factory-handoff-probe-gate">
        <Workshop2GateChecksBlock
          checks={handoffGate.readiness.checks}
          testId="workshop2-factory-handoff-gate-checks"
          title="Ворота передачи в цех"
          collectionId={collectionId}
          articleUrlSegment={articleId}
        />
      </div>

      <Workshop2DossierAssignmentSendPanel {...sendPanelProps}>
        <Workshop2TechPackHandoffBlock {...handoffBlockProps} />
      </Workshop2DossierAssignmentSendPanel>

      {factoryPackTab ? (
        <BrandWorkshop2FactoryPackPreviewPanel
          dossier={dossier}
          exportContext={factoryPackExportContext}
          articleId={articleId}
          collectionId={collectionId}
          setDossier={setDossier}
          updatedByLabel={handoffBlockProps.updatedByLabel}
          tzWriteDisabled={handoffBlockProps.tzWriteDisabled}
          onExportNotice={(message) => toast({ title: 'Фабричный пакет', description: message })}
        />
      ) : null}

      <Workshop2VendorBiddingPanel
        collectionId={collectionId}
        articleId={articleId}
        bids={dossier.bids}
        onBidsUpdate={handleBidsUpdate}
      />
      {tzBlockersFooter}
    </div>
  );
}
