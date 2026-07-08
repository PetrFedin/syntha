import { useCallback, useMemo } from 'react';
import {
  commitSectionSignoffAction,
  type CommitSectionSignoffDeps,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-commit-section-signoff';
import {
  revokeSectionSignoffAction,
  type RevokeSectionSignoffDeps,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-revoke-section-signoff';
import {
  buildSectionSignoffPassportPreviews,
  type SectionSignoffPassportPreviews,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-section-signoff-passport-previews';
import { workshopTzSignerAllowed } from '@/lib/production/workshop2-tz-signatory-options';
import type { Workshop2TzSignoffSectionKey } from '@/lib/production/workshop2-dossier-phase1.types';

type Params = CommitSectionSignoffDeps &
  Pick<RevokeSectionSignoffDeps, 'tzRevokersEffective' | 'onTzRevokeDenied'> & {
    updatedByLabel: string;
  };

/** Подтверждение секций ТЗ + passport previews + session gate для панели досье. */
export function useWorkshop2Phase1DossierSectionSignoffCallbacks(params: Params) {
  const {
    tzWriteDisabled,
    toast,
    sectionReadinessUi,
    sectionGateErrorsById,
    sectionSignoffOrganizationLabel,
    updatedByLabel,
    tzSignatoryBindings,
    collectionId,
    articleId,
    articleSku,
    setDossier,
    persist,
    tzRevokersEffective,
    onTzRevokeDenied,
  } = params;

  const sectionSignoffPassportPreviews = useMemo(
    (): SectionSignoffPassportPreviews =>
      buildSectionSignoffPassportPreviews(tzSignatoryBindings, sectionSignoffOrganizationLabel),
    [tzSignatoryBindings, sectionSignoffOrganizationLabel]
  );

  const sectionSignoffSessionBrandOk = useMemo(() => {
    if (sectionSignoffPassportPreviews.brandPassportMissing) return false;
    return workshopTzSignerAllowed(
      updatedByLabel,
      sectionSignoffPassportPreviews.brandPassportName
    );
  }, [sectionSignoffPassportPreviews, updatedByLabel]);

  const sectionSignoffSessionTechOk = useMemo(() => {
    if (sectionSignoffPassportPreviews.techPassportMissing) return false;
    return workshopTzSignerAllowed(updatedByLabel, sectionSignoffPassportPreviews.techPassportName);
  }, [sectionSignoffPassportPreviews, updatedByLabel]);

  const commitSectionSignoff = useCallback(
    (section: Workshop2TzSignoffSectionKey, role: 'brand' | 'tech') =>
      commitSectionSignoffAction(
        {
          tzWriteDisabled,
          toast,
          sectionReadinessUi,
          sectionGateErrorsById,
          sectionSignoffOrganizationLabel,
          updatedByLabel,
          tzSignatoryBindings,
          collectionId,
          articleId,
          articleSku,
          setDossier,
          persist,
        },
        section,
        role
      ),
    [
      articleId,
      articleSku,
      collectionId,
      tzSignatoryBindings,
      sectionReadinessUi,
      sectionGateErrorsById,
      sectionSignoffOrganizationLabel,
      toast,
      updatedByLabel,
      tzWriteDisabled,
      setDossier,
      persist,
    ]
  );

  const revokeSectionSignoff = useCallback(
    (section: Workshop2TzSignoffSectionKey, role: 'brand' | 'tech') =>
      revokeSectionSignoffAction(
        {
          tzWriteDisabled,
          toast,
          sectionReadinessUi,
          updatedByLabel,
          tzRevokersEffective,
          onTzRevokeDenied,
          setDossier,
          persist,
        },
        section,
        role
      ),
    [
      onTzRevokeDenied,
      updatedByLabel,
      tzRevokersEffective,
      tzWriteDisabled,
      toast,
      sectionReadinessUi,
      setDossier,
      persist,
    ]
  );

  return {
    sectionSignoffPassportPreviews,
    sectionSignoffSessionBrandOk,
    sectionSignoffSessionTechOk,
    commitSectionSignoff,
    revokeSectionSignoff,
  };
}
