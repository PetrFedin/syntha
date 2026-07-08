/**
 * Platform Core — единый PG-primary spine (одна БД для golden path).
 */
import 'server-only';

import { isSpineOperationalPgPrimary } from '@/lib/integrations/spine/spine-pg-hydrate-guards';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  isWorkshop2PgOnlyMode,
  shouldWorkshop2PgOnlySkipFileFallback,
} from '@/lib/production/workshop2-hub-pg-only-policy';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

/** Core dev (:3001) с PG — native данные только из PostgreSQL, JSON/file — fallback выкл. */
export function isPlatformCoreSpinePgPrimary(): boolean {
  if (!isWorkshop2PostgresEnabled()) return false;
  if (isWorkshop2PgOnlyMode()) return true;
  if (isPlatformCoreMode() && process.env.PLATFORM_CORE_SPINE_PG_PRIMARY !== '0') return true;
  if (isSpineOperationalPgPrimary()) return true;
  return false;
}

export function shouldSkipNativeJsonFileStores(): boolean {
  return shouldWorkshop2PgOnlySkipFileFallback() || isPlatformCoreSpinePgPrimary();
}

export type PlatformCoreSpineStoreId =
  | 'contextual_chat'
  | 'b2b_orders'
  | 'dossier'
  | 'brand_tasks'
  | 'brand_production_ops'
  | 'calendar_tasks'
  | 'greenfield_crm_segment'
  | 'b2b_invoice'
  | 'live_workflow';

export type PlatformCoreSpineStoreStatus = {
  id: PlatformCoreSpineStoreId;
  pgTable: string;
  mode: 'postgres' | 'file_fallback' | 'memory' | 'localStorage_client';
  pgPrimary: boolean;
};

export function buildPlatformCoreSpineStoreMatrix(): PlatformCoreSpineStoreStatus[] {
  const pgPrimary = isPlatformCoreSpinePgPrimary();
  const pg = isWorkshop2PostgresEnabled();
  const fileFallback = pg ? false : !pgPrimary;
  return [
    {
      id: 'contextual_chat',
      pgTable: 'workshop2_contextual_messages',
      mode: pg ? 'postgres' : fileFallback ? 'file_fallback' : 'memory',
      pgPrimary,
    },
    {
      id: 'b2b_orders',
      pgTable: 'workshop2_b2b_orders',
      mode: pg ? 'postgres' : 'file_fallback',
      pgPrimary,
    },
    {
      id: 'dossier',
      pgTable: 'workshop2_dossiers',
      mode: pg ? 'postgres' : 'file_fallback',
      pgPrimary,
    },
    {
      id: 'brand_tasks',
      pgTable: 'brand_tasks_kanban',
      mode: pg ? 'postgres' : 'localStorage_client',
      pgPrimary,
    },
    {
      id: 'brand_production_ops',
      pgTable: 'brand_production_ops_state',
      mode: pg ? 'postgres' : 'localStorage_client',
      pgPrimary,
    },
    {
      id: 'calendar_tasks',
      pgTable: 'platform_core_user_calendar_tasks',
      mode: pg ? 'postgres' : 'file_fallback',
      pgPrimary,
    },
    {
      id: 'greenfield_crm_segment',
      pgTable: 'shop_buyer_crm_profiles',
      mode: pg ? 'postgres' : 'file_fallback',
      pgPrimary,
    },
    {
      id: 'b2b_invoice',
      pgTable: 'workshop2_b2b_invoice',
      mode: pg ? 'postgres' : 'file_fallback',
      pgPrimary,
    },
    {
      id: 'live_workflow',
      pgTable: 'platform_core_live_workflow_store',
      mode: pg ? 'postgres' : 'file_fallback',
      pgPrimary,
    },
  ];
}
