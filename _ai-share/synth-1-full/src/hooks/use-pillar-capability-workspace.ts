'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  getPillarCapabilityWorkspace,
  getPillarWorkspaceFeature,
  PILLAR_CAPABILITY_FEATURE_PARAM,
  resolvePillarWorkspaceFeatureId,
  type PillarCapabilityFeature,
  type PillarCapabilityWorkspace,
} from '@/lib/platform/pillar-capability-workspaces';

export function usePillarCapabilityWorkspace(workspaceId: string): {
  workspace: PillarCapabilityWorkspace | undefined;
  activeFeatureId: string;
  activeFeature: PillarCapabilityFeature | undefined;
  setActiveFeatureId: (featureId: string) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const workspace = useMemo(() => getPillarCapabilityWorkspace(workspaceId), [workspaceId]);

  const activeFeatureId = useMemo(() => {
    if (!workspace) return '';
    return resolvePillarWorkspaceFeatureId(
      workspace,
      searchParams.get(PILLAR_CAPABILITY_FEATURE_PARAM)
    );
  }, [workspace, searchParams]);

  const activeFeature = useMemo(() => {
    if (!workspace || !activeFeatureId) return undefined;
    return getPillarWorkspaceFeature(workspace, activeFeatureId);
  }, [workspace, activeFeatureId]);

  const setActiveFeatureId = useCallback(
    (featureId: string) => {
      if (!workspace) return;
      const nextId = resolvePillarWorkspaceFeatureId(workspace, featureId);
      const sp = new URLSearchParams(searchParams.toString());
      sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, nextId);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [workspace, pathname, router, searchParams]
  );

  return { workspace, activeFeatureId, activeFeature, setActiveFeatureId };
}
