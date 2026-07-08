'use client';

import { useCallback, useMemo, useState } from 'react';
import { useWorkshop2Phase1DossierAttrCommentsOpenBridge } from '@/components/brand/production/use-workshop2-phase1-dossier-attr-comments-open-bridge';
import { useWorkshop2Phase1DossierTzBlockCommentMetricsEffect } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-block-comment-metrics-effect';
import type { Workshop2DossierPanelPostMainTrailProps } from '@/components/brand/production/workshop2-phase1-dossier-panel-post-main-trail';
import type { Workshop2AttrComment } from '@/components/brand/production/workshop2-phase1-dossier-panel-attr-comments-dialog';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { W2TzBlockCommentMetrics } from '@/lib/production/workshop2-article-tz-block-comments';
import type { MutableRefObject } from 'react';

type SetDossier = (
  u: Workshop2DossierPhase1 | ((prev: Workshop2DossierPhase1) => Workshop2DossierPhase1)
) => void;

export type UseWorkshop2Phase1DossierAttrCommentsControllerInput = {
  dossier: Workshop2DossierPhase1;
  setDossier: SetDossier;
  updatedByLabel: string;
  dossierCommentsBridgeRef?: MutableRefObject<{ open: (attributeId: string) => void } | null>;
  tzBlockCommentMetricKeys?: readonly string[];
  onTzBlockCommentMetrics?: (metrics: Record<string, W2TzBlockCommentMetrics>) => void;
};

/** Attr comments dialog state + persist handlers (sectionBodies zone). */
export function useWorkshop2Phase1DossierAttrCommentsController({
  dossier,
  setDossier,
  updatedByLabel,
  dossierCommentsBridgeRef,
  tzBlockCommentMetricKeys,
  onTzBlockCommentMetrics,
}: UseWorkshop2Phase1DossierAttrCommentsControllerInput) {
  const [attrCommentDialogAttrId, setAttrCommentDialogAttrId] = useState<string | null>(null);
  const [attrCommentDraft, setAttrCommentDraft] = useState('');
  const [attrCommentDraftSeverity, setAttrCommentDraftSeverity] = useState<'normal' | 'critical'>(
    'normal'
  );
  const [attrCommentDraftAssignee, setAttrCommentDraftAssignee] = useState('');
  const [attrCommentDraftDueAt, setAttrCommentDraftDueAt] = useState('');
  const [attrCommentDraftVisibility, setAttrCommentDraftVisibility] = useState<
    'internal' | 'factory'
  >('internal');
  const [attrCommentOnlyOpen, setAttrCommentOnlyOpen] = useState(true);

  const attrCommentsById = dossier.attrComments ?? {};

  const { openAttrComments } = useWorkshop2Phase1DossierAttrCommentsOpenBridge(
    dossierCommentsBridgeRef,
    setAttrCommentDialogAttrId,
    setAttrCommentDraft,
    setAttrCommentDraftSeverity,
    setAttrCommentDraftAssignee,
    setAttrCommentDraftDueAt,
    setAttrCommentDraftVisibility,
    setAttrCommentOnlyOpen
  );

  useWorkshop2Phase1DossierTzBlockCommentMetricsEffect({
    attrCommentsById,
    tzBlockCommentMetricKeys,
    onTzBlockCommentMetrics,
  });

  const saveAttrComment = useCallback(() => {
    const attrId = attrCommentDialogAttrId;
    const text = attrCommentDraft.trim();
    if (!attrId || !text) return;
    setDossier((prev) => {
      const prevComments = prev.attrComments ?? {};
      const nextRow: Workshop2AttrComment = {
        id: globalThis.crypto.randomUUID(),
        text,
        by: updatedByLabel.slice(0, 120),
        at: new Date().toISOString(),
        severity: attrCommentDraftSeverity,
        status: 'open',
        assignee: attrCommentDraftAssignee.trim() || undefined,
        dueAt: attrCommentDraftDueAt || undefined,
        visibility: attrCommentDraftVisibility,
      };
      const next = {
        ...prevComments,
        [attrId]: [...(prevComments[attrId] ?? []), nextRow],
      };
      return { ...prev, attrComments: next };
    });
    setAttrCommentDraft('');
    setAttrCommentDraftAssignee('');
    setAttrCommentDraftDueAt('');
    setAttrCommentDraftSeverity('normal');
  }, [
    attrCommentDialogAttrId,
    attrCommentDraft,
    attrCommentDraftAssignee,
    attrCommentDraftDueAt,
    attrCommentDraftSeverity,
    attrCommentDraftVisibility,
    updatedByLabel,
    setDossier,
  ]);

  const toggleAttrCommentStatus = useCallback(
    (commentId: string) => {
      if (!attrCommentDialogAttrId) return;
      setDossier((prev) => {
        const prevComments = prev.attrComments ?? {};
        const rows = prevComments[attrCommentDialogAttrId] ?? [];
        const nextRows = rows.map((row) =>
          row.id !== commentId
            ? row
            : {
                ...row,
                status:
                  (row.status ?? 'open') === 'resolved' ? ('open' as const) : ('resolved' as const),
              }
        );
        const next = { ...prevComments, [attrCommentDialogAttrId]: nextRows };
        return { ...prev, attrComments: next };
      });
    },
    [attrCommentDialogAttrId, setDossier]
  );

  const postMainTrailAttrComments = useMemo(
    (): Workshop2DossierPanelPostMainTrailProps['attrComments'] => ({
      openAttrId: attrCommentDialogAttrId,
      onOpenChange: (open) => {
        if (!open) {
          setAttrCommentDialogAttrId(null);
          setAttrCommentDraft('');
        }
      },
      commentsById: attrCommentsById,
      draft: attrCommentDraft,
      draftSeverity: attrCommentDraftSeverity,
      draftAssignee: attrCommentDraftAssignee,
      draftDueAt: attrCommentDraftDueAt,
      draftVisibility: attrCommentDraftVisibility,
      onlyOpen: attrCommentOnlyOpen,
      onDraftChange: setAttrCommentDraft,
      onDraftSeverityChange: setAttrCommentDraftSeverity,
      onDraftAssigneeChange: setAttrCommentDraftAssignee,
      onDraftDueAtChange: setAttrCommentDraftDueAt,
      onDraftVisibilityChange: setAttrCommentDraftVisibility,
      onOnlyOpenChange: setAttrCommentOnlyOpen,
      onToggleCommentStatus: toggleAttrCommentStatus,
      onSend: saveAttrComment,
    }),
    [
      attrCommentDialogAttrId,
      attrCommentDraft,
      attrCommentDraftAssignee,
      attrCommentDraftDueAt,
      attrCommentDraftSeverity,
      attrCommentDraftVisibility,
      attrCommentOnlyOpen,
      attrCommentsById,
      saveAttrComment,
      toggleAttrCommentStatus,
    ]
  );

  return {
    attrCommentsById,
    openAttrComments,
    postMainTrailAttrComments,
    setAttrCommentOnlyOpen,
  };
}
