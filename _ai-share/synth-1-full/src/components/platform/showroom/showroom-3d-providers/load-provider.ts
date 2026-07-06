import type { B2b3dProviderAdapter } from '@/components/platform/showroom/showroom-3d-providers/types';

/** Lazy provider adapter — optional mount hook for Matterport/generic SDK bridges. */
export async function loadShowroom3dProvider(
  providerId: 'matterport' | 'generic'
): Promise<B2b3dProviderAdapter | null> {
  void providerId;
  return null;
}
