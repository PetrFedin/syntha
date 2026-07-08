'use client';

import { useEffect, useMemo } from 'react';
import {
  buildWorkshop2Phase1DossierFinalTzAssignmentChain,
  buildWorkshop2Phase1DossierFinalTzExportContext,
  buildWorkshop2Phase1DossierFinalTzSpecDocumentHtml,
  buildWorkshop2Phase1DossierLastProductionExportBadge,
  estimateWorkshop2Phase1DossierJsonUtf8Bytes,
  type BuildWorkshop2Phase1DossierFinalTzAssignmentChainInput,
  type BuildWorkshop2Phase1DossierFinalTzExportContextInput,
} from '@/components/brand/production/workshop2-phase1-dossier-final-tz-export';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2FinalTzSpecExportContext } from '@/lib/production/workshop2-final-tz-spec-export';
import { buildWorkshop2TechPackFactoryDocumentHtml } from '@/lib/production/workshop2-techpack-export-sheets';
import { buildWorkshop2TechPackExportOptions } from '@/lib/production/workshop2-techpack-export-options';
import { buildBrandTechPackExportSession } from '@/lib/production/workshop2-techpack-export-session';
import { assessWorkshop2TechPackReleaseGate } from '@/lib/production/workshop2-techpack-release-gate';
import type { Workshop2TechPackReleaseGate } from '@/lib/production/workshop2-techpack-release-gate';

export type UseWorkshop2Phase1DossierFinalTzExportZoneInput =
  BuildWorkshop2Phase1DossierFinalTzExportContextInput &
    BuildWorkshop2Phase1DossierFinalTzAssignmentChainInput & {
      dossier: Workshop2DossierPhase1;
      onTzSpecPreviewHtml?: (html: string) => void;
      articleId?: string;
      collectionId?: string;
      orderId?: string;
    };

/** Final TZ export context, HTML preview, assignment chain (sectionBodies). */
export function useWorkshop2Phase1DossierFinalTzExportZone({
  dossier,
  onTzSpecPreviewHtml,
  ...input
}: UseWorkshop2Phase1DossierFinalTzExportZoneInput): {
  finalTzExportContext: Workshop2FinalTzSpecExportContext;
  finalTzSpecDocumentHtml: string;
  factoryPackDocumentHtml: string;
  factoryPackReleaseGate: Workshop2TechPackReleaseGate;
  finalTzAssignmentChain: ReturnType<typeof buildWorkshop2Phase1DossierFinalTzAssignmentChain>;
  lastProductionExportBadge: ReturnType<
    typeof buildWorkshop2Phase1DossierLastProductionExportBadge
  >;
  phase1DossierJsonUtf8Bytes: number;
} {
  const finalTzExportContext = useMemo(
    () => buildWorkshop2Phase1DossierFinalTzExportContext(input),
    [
      input.skuDraft,
      input.nameDraft,
      input.currentLeaf,
      input.currentPhase,
      input.preflightOk,
      input.preflightIssueCount,
      input.sectionSignoffsFull,
      input.gateLifecycleState,
      input.exportLanguage,
    ]
  );

  const finalTzSpecDocumentHtml = useMemo(
    () => buildWorkshop2Phase1DossierFinalTzSpecDocumentHtml(dossier, finalTzExportContext),
    [dossier, finalTzExportContext]
  );

  const factoryPackDocumentHtml = useMemo(() => {
    const session = buildBrandTechPackExportSession({
      articleId: input.articleId ?? input.skuDraft,
      collectionId: input.collectionId,
      sku: input.skuDraft,
      orderId: input.orderId,
    });
    return buildWorkshop2TechPackFactoryDocumentHtml(
      dossier,
      finalTzExportContext,
      buildWorkshop2TechPackExportOptions({
        dossier,
        articleSku: input.skuDraft,
        articleId: input.articleId,
        collectionId: input.collectionId,
        matrixHref: session.matrixQtyHref,
      })
    );
  }, [
    dossier,
    finalTzExportContext,
    input.skuDraft,
    input.articleId,
    input.collectionId,
    input.orderId,
  ]);

  const factoryPackReleaseGate = useMemo(() => {
    const session = buildBrandTechPackExportSession({
      articleId: input.articleId ?? input.skuDraft,
      collectionId: input.collectionId,
      sku: input.skuDraft,
      orderId: input.orderId,
    });
    return assessWorkshop2TechPackReleaseGate({
      dossier,
      ctx: finalTzExportContext,
      exportOptions: buildWorkshop2TechPackExportOptions({
        dossier,
        articleSku: input.skuDraft,
        articleId: input.articleId,
        collectionId: input.collectionId,
        matrixHref: session.matrixQtyHref,
      }),
    });
  }, [
    dossier,
    finalTzExportContext,
    input.skuDraft,
    input.articleId,
    input.collectionId,
    input.orderId,
  ]);

  useEffect(() => {
    onTzSpecPreviewHtml?.(finalTzSpecDocumentHtml);
  }, [finalTzSpecDocumentHtml, onTzSpecPreviewHtml]);

  const finalTzAssignmentChain = useMemo(
    () =>
      buildWorkshop2Phase1DossierFinalTzAssignmentChain({
        dossier,
        skuDraft: input.skuDraft,
        nameDraft: input.nameDraft,
        pathLabel: input.pathLabel,
        preflightOk: input.preflightOk,
        factorySendHubPreview: input.factorySendHubPreview,
      }),
    [
      dossier,
      input.skuDraft,
      input.nameDraft,
      input.pathLabel,
      input.preflightOk,
      input.factorySendHubPreview,
    ]
  );

  const lastProductionExportBadge = useMemo(
    () => buildWorkshop2Phase1DossierLastProductionExportBadge(dossier.productionTzLastExport),
    [dossier.productionTzLastExport]
  );

  const phase1DossierJsonUtf8Bytes = useMemo(
    () => estimateWorkshop2Phase1DossierJsonUtf8Bytes(dossier),
    [dossier]
  );

  return {
    finalTzExportContext,
    finalTzSpecDocumentHtml,
    factoryPackDocumentHtml,
    factoryPackReleaseGate,
    finalTzAssignmentChain,
    lastProductionExportBadge,
    phase1DossierJsonUtf8Bytes,
  };
}
