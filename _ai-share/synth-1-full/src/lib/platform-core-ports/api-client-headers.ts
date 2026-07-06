'use client';

/**
 * Клиентская граница Platform Core → actor/RBAC заголовки для API.
 * UI в components/platform импортирует отсюда, не из lib/production.
 */
export {
  buildWorkshop2ApiRequestHeaders,
  buildWorkshop2ApiRequestHeaders as buildPlatformCoreApiRequestHeaders,
  getWorkshop2ApiClientContext,
  setWorkshop2ApiClientContext,
  type Workshop2ApiClientContext,
} from '@/lib/production/workshop2-api-client-headers';
