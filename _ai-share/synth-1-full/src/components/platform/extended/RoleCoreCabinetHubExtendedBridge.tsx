import {
  factoryMessagesB2bOrderContextHref,
  factorySupplierMessagesB2bOrderContextHref,
} from '@/lib/platform-core-extended-routes';
import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix.types';

export { SupplierDevPillarMaterialCatalogNavGate } from '@/components/platform/extended/SupplierDevPillarMaterialCatalogNavGate';

export function resolveExtendedOrderMessagesHref(
  roleId: CoreChainRoleId,
  orderId: string
): string | undefined {
  if (roleId === 'supplier') {
    return factorySupplierMessagesB2bOrderContextHref(orderId);
  }
  if (roleId === 'manufacturer') {
    return factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' });
  }
  return undefined;
}
