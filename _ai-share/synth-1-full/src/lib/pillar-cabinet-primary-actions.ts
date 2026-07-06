import type {
  CoreChainRoleId,
  CoreHubPillarId,
  PlatformCoreDemoContext,
} from '@/lib/platform-core-hub-matrix';
import {
  getHubCellActionsForDemo,
  getRolePillarWorkspaceHref,
} from '@/lib/platform-core-hub-matrix';

export type PillarCabinetAction = {
  label: string;
  href: string;
  testId?: string;
};

export type PillarCabinetActions = {
  primary: PillarCabinetAction;
  secondary?: PillarCabinetAction;
  /** Workspace fallback — показывается только если отличается от primary. */
  workspace?: PillarCabinetAction;
};

function samePath(a: string, b: string): boolean {
  try {
    const pa = new URL(a, 'http://local');
    const pb = new URL(b, 'http://local');
    return pa.pathname === pb.pathname;
  } catch {
    return a.split('?')[0] === b.split('?')[0];
  }
}

/** Primary + secondary CTA кабинета из hub actions (канон SECTION_AUDIT / матрица). */
export function buildPillarCabinetActions(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext
): PillarCabinetActions {
  const actions = getHubCellActionsForDemo(roleId, pillarId, demo);
  const workspaceHref = getRolePillarWorkspaceHref(roleId, pillarId, demo);
  const workspace: PillarCabinetAction = {
    label: 'Рабочий экран',
    href: workspaceHref,
    testId: 'role-pillar-workspace-cta',
  };

  if (actions.length === 0) {
    return { primary: { ...workspace, testId: 'role-pillar-primary-cta' } };
  }

  const primary: PillarCabinetAction = {
    label: actions[0].label,
    href: actions[0].href,
    testId: 'role-pillar-primary-cta',
  };

  const secondary = actions[1]
    ? { label: actions[1].label, href: actions[1].href, testId: 'role-pillar-secondary-cta' }
    : undefined;

  const workspaceDiffers = !samePath(primary.href, workspaceHref);

  return {
    primary,
    secondary,
    workspace: workspaceDiffers ? workspace : undefined,
  };
}

/** Прогресс цепочки роли: выполненные столпы / активные. */
export function countRoleChainProgress(
  navPillarIds: readonly CoreHubPillarId[],
  pillarDone: (pillarId: CoreHubPillarId) => boolean | null
): { done: number; total: number } {
  const total = navPillarIds.length;
  const done = navPillarIds.filter((id) => pillarDone(id) === true).length;
  return { done, total };
}
