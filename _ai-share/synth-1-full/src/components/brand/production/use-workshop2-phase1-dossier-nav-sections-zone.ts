'use client';

import { useMemo } from 'react';
import { buildWorkshop2Phase1DossierNavSections } from '@/components/brand/production/workshop2-phase1-dossier-nav-sections';
import type { Workshop2DossierViewProfile } from '@/lib/production/workshop2-dossier-view-infrastructure';

/** Dossier TZ nav primary/secondary sections (navigation zone). */
export function useWorkshop2Phase1DossierNavSectionsZone(
  dossierViewProfile: Workshop2DossierViewProfile
) {
  return useMemo(
    () => buildWorkshop2Phase1DossierNavSections(dossierViewProfile),
    [dossierViewProfile]
  );
}
