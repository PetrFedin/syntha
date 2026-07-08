/**
 * B2B Workplace Matrix Data
 * Оформлено в стиле ПРОИЗВОДСТВЕННОЙ МАТРИЦЫ
 * Синхронизировано с WorkplaceSection.tsx
 * Все пути через ROUTES для связности с платформой.
 */
import type {
  B2BUserRole,
  WorkspaceItem,
  WorkspaceTab,
  WorkspaceTabId,
} from '@/lib/data/b2b-workspace-matrix.types';
export type {
  B2BUserRole,
  DigitalFlowId,
  WorkspaceItem,
  WorkspaceTab,
  WorkspaceTabId,
} from '@/lib/data/b2b-workspace-matrix.types';
export { WORKSPACE_ITEMS } from '@/lib/data/b2b-workspace-matrix-items';
export { WORKSPACE_TABS, WORKSPACE_ITEM_PATHS } from '@/lib/data/b2b-workspace-matrix-tabs';
export { DIGITAL_WORKSPACE_CONNECTIONS, FLOW_CONFIG } from '@/lib/data/b2b-workspace-matrix-flow';
export { ROLE_CONFIG, ROLE_PERMISSIONS } from '@/lib/data/b2b-workspace-matrix-roles';
