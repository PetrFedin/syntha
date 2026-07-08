import type { B2b3dProviderAdapter } from '@/components/shop/b2b/b2b-3d-providers/types';

/** Lazy provider adapter — optional mount hook for Matterport/generic SDK bridges. */
export async function loadB2b3dProvider(
  providerId: 'matterport' | 'generic'
): Promise<B2b3dProviderAdapter | null> {
  void providerId;
  return null;
}
