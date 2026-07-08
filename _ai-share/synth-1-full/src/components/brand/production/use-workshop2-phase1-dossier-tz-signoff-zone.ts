'use client';

import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useWorkshop2Phase1DossierSectionSignoffCallbacks } from '@/components/brand/production/use-workshop2-phase1-dossier-section-signoff-callbacks';
import { useWorkshop2Phase1DossierTzDigitalSignCallbacks } from '@/components/brand/production/use-workshop2-phase1-dossier-tz-digital-sign-callbacks';
import { buildWorkshop2TzDigitalSignoffRows } from '@/components/brand/production/workshop2-phase1-dossier-panel-build-tz-digital-signoff-rows';
import {
  isWorkshop2TzSectionTabDoneForUi,
  W2_SECTION_SIGNOFF_PCT_THRESHOLD,
} from '@/components/brand/production/Workshop2TzSectionTabIndicator';
import { isWorkshop2TzSectionFullySigned } from '@/lib/production/workshop2-tz-signoff-complete';
import { workshop2TzSectionSignoffByLabelMeaningful } from '@/lib/production/workshop2-tz-signoff-actor';
import { W2_TZ_HINT_PRODUCTION_EDIT_SIGN_REVOKE } from '@/lib/production/workshop2-tz-rbac-hints';
import { WORKSHOP2_TZ_DIGITAL_SIGNOFF_DEFAULT_CAPABILITIES } from '@/lib/production/workshop2-tz-digital-signoff';
import { canRevokeTzSignoff } from '@/components/brand/production/workshop2-phase1-dossier-panel-tz-action-log';
import { SECTION_LABEL_BY_ID } from '@/components/brand/production/workshop2-phase1-dossier-panel-dossier-constants';
import type {
  Workshop2DossierPhase1,
  Workshop2TzSignoffSectionKey,
} from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2TzDigitalSignoffCapabilities } from '@/lib/production/workshop2-tz-digital-signoff';

type PersistFn = (dossier: Workshop2DossierPhase1, opts?: { freezeUpdatedAt?: boolean }) => void;

type SectionReadinessUi = Record<Workshop2TzSignoffSectionKey, { pct: number; label?: string }>;

export type UseWorkshop2Phase1DossierTzSignoffZoneInput = {
  dossier: Workshop2DossierPhase1;
  setDossier: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
  persist: PersistFn;
  toast: (p: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
  tzWriteDisabled: boolean;
  updatedByLabel: string;
  sectionSignoffOrganizationLabel: string;
  tzSignoffRevokerLabels?: readonly string[];
  tzDigitalSignoffCapabilities?: Workshop2TzDigitalSignoffCapabilities;
  activeSection: Workshop2TzSignoffSectionKey;
  setActiveSection: Dispatch<SetStateAction<Workshop2TzSignoffSectionKey>>;
  sectionReadinessUi: SectionReadinessUi;
  sectionWarningsById: Partial<Record<Workshop2TzSignoffSectionKey, unknown[]>>;
  sectionGateErrorsById: Record<Workshop2TzSignoffSectionKey, string[]>;
  tzGateSnapshot: {
    sectionMinimumErrors: { material: string[]; construction: string[] };
  };
  collectionId: string;
  articleId: string;
  articleSku: string;
};

/** TZ signoff zone: digital rows, section signoff, gated UI (sectionBodies). */
export function useWorkshop2Phase1DossierTzSignoffZone({
  dossier,
  setDossier,
  persist,
  toast,
  tzWriteDisabled,
  updatedByLabel,
  sectionSignoffOrganizationLabel,
  tzSignoffRevokerLabels,
  tzDigitalSignoffCapabilities,
  activeSection,
  setActiveSection,
  sectionReadinessUi,
  sectionWarningsById,
  sectionGateErrorsById,
  tzGateSnapshot,
  collectionId,
  articleId,
  articleSku,
}: UseWorkshop2Phase1DossierTzSignoffZoneInput) {
  const [tzRevokeDeniedHint, setTzRevokeDeniedHint] = useState<string | null>(null);

  const tzRevokersEffective = tzSignoffRevokerLabels ?? [];
  const tzSignCaps =
    tzDigitalSignoffCapabilities ?? WORKSHOP2_TZ_DIGITAL_SIGNOFF_DEFAULT_CAPABILITIES;

  const tzDigitalSignoffRows = useMemo(
    () =>
      buildWorkshop2TzDigitalSignoffRows(
        {
          tzSignatoryBindings: dossier.tzSignatoryBindings,
          designerSignoff: dossier.designerSignoff,
          technologistSignoff: dossier.technologistSignoff,
          managerSignoff: dossier.managerSignoff,
          extraTzSignoffsByRowId: dossier.extraTzSignoffsByRowId,
        },
        tzSignCaps,
        updatedByLabel,
        sectionSignoffOrganizationLabel
      ),
    [
      dossier.tzSignatoryBindings,
      dossier.designerSignoff,
      dossier.technologistSignoff,
      dossier.managerSignoff,
      dossier.extraTzSignoffsByRowId,
      tzSignCaps.designer,
      tzSignCaps.technologist,
      tzSignCaps.manager,
      updatedByLabel,
      sectionSignoffOrganizationLabel,
    ]
  );

  const onTzRevokeDenied = useCallback(() => {
    setTzRevokeDeniedHint(
      'Снять цифровую подпись могут только пользователи из списка руководителей (гендиректор, руководитель бренда, зам и т.п.). Обратитесь к администратору.'
    );
    window.setTimeout(() => setTzRevokeDeniedHint(null), 7000);
  }, []);

  const activeSectionPctForSignHint = sectionReadinessUi[activeSection]?.pct ?? 0;
  const activeSectionFillPctMin = W2_SECTION_SIGNOFF_PCT_THRESHOLD[activeSection];
  const activeSectionSignGateMeets = activeSectionPctForSignHint >= activeSectionFillPctMin;
  const tzSignoffBlockHint = `Сначала доведите заполнение раздела «${SECTION_LABEL_BY_ID[activeSection]}» до не менее ${activeSectionFillPctMin}% (сейчас ${activeSectionPctForSignHint}%).`;

  const fourTzLevelsFullySignedByAll = useMemo(() => {
    const keys: Workshop2TzSignoffSectionKey[] = ['general', 'visuals', 'material', 'construction'];
    return keys.every((k) => {
      const pct = sectionReadinessUi[k]?.pct ?? 0;
      const hasWarnings = (sectionWarningsById[k]?.length ?? 0) > 0;
      return (
        isWorkshop2TzSectionFullySigned(k, dossier.sectionSignoffs) && !hasWarnings && pct >= 100
      );
    });
  }, [dossier.sectionSignoffs, sectionReadinessUi, sectionWarningsById]);

  const tzDigitalSignoffRowsGated = useMemo(() => {
    return tzDigitalSignoffRows.map((r) => {
      const base = r.canSign;
      const gated = base && activeSectionSignGateMeets && !tzWriteDisabled;
      return {
        ...r,
        signoff: activeSectionSignGateMeets ? r.signoff : undefined,
        canSign: gated,
        signBlockHint: tzWriteDisabled
          ? base
            ? W2_TZ_HINT_PRODUCTION_EDIT_SIGN_REVOKE
            : undefined
          : !activeSectionSignGateMeets && base
            ? tzSignoffBlockHint
            : undefined,
      };
    });
  }, [tzDigitalSignoffRows, activeSectionSignGateMeets, tzSignoffBlockHint, tzWriteDisabled]);

  const allSectionSignoffPairsDone = useMemo(
    () =>
      (['general', 'material', 'construction'] as const).every((k) =>
        isWorkshop2TzSectionTabDoneForUi(
          k,
          dossier.sectionSignoffs,
          sectionReadinessUi[k]?.pct ?? 0,
          dossier
        )
      ),
    [dossier, dossier.sectionSignoffs, sectionReadinessUi]
  );

  const { signTzDigitalRow, revokeTzDigitalRow } = useWorkshop2Phase1DossierTzDigitalSignCallbacks({
    tzWriteDisabled,
    toast,
    activeSectionSignGateMeets,
    sectionSignGateBlockedDescription: tzSignoffBlockHint,
    technologistSignStages: dossier.tzSignatoryBindings?.technologistSignStages,
    materialSectionMinimumErrors: tzGateSnapshot.sectionMinimumErrors.material,
    constructionSectionMinimumErrors: tzGateSnapshot.sectionMinimumErrors.construction,
    setActiveSection,
    updatedByLabel,
    sectionSignoffOrganizationLabel,
    collectionId,
    articleId,
    articleSku,
    setDossier,
    tzRevokersEffective,
    onTzRevokeDenied,
  });

  const tzSectionSignoffRevokeAllowed = useMemo(
    () => canRevokeTzSignoff(updatedByLabel, tzRevokersEffective),
    [updatedByLabel, tzRevokersEffective]
  );

  const sectionSignoffProfileGateOk = useMemo(
    () =>
      workshop2TzSectionSignoffByLabelMeaningful(updatedByLabel) &&
      sectionSignoffOrganizationLabel.trim().length > 0,
    [updatedByLabel, sectionSignoffOrganizationLabel]
  );

  const {
    sectionSignoffPassportPreviews,
    sectionSignoffSessionBrandOk,
    sectionSignoffSessionTechOk,
    commitSectionSignoff,
    revokeSectionSignoff,
  } = useWorkshop2Phase1DossierSectionSignoffCallbacks({
    tzWriteDisabled,
    toast,
    sectionReadinessUi,
    sectionGateErrorsById,
    sectionSignoffOrganizationLabel,
    updatedByLabel,
    tzSignatoryBindings: dossier.tzSignatoryBindings,
    collectionId,
    articleId,
    articleSku,
    setDossier,
    persist,
    tzRevokersEffective,
    onTzRevokeDenied,
  });

  return {
    tzRevokeDeniedHint,
    tzRevokersEffective,
    onTzRevokeDenied,
    tzDigitalSignoffRows,
    tzDigitalSignoffRowsGated,
    tzSignoffBlockHint,
    activeSectionSignGateMeets,
    fourTzLevelsFullySignedByAll,
    allSectionSignoffPairsDone,
    signTzDigitalRow,
    revokeTzDigitalRow,
    tzSectionSignoffRevokeAllowed,
    sectionSignoffProfileGateOk,
    sectionSignoffPassportPreviews,
    sectionSignoffSessionBrandOk,
    sectionSignoffSessionTechOk,
    commitSectionSignoff,
    revokeSectionSignoff,
  };
}
