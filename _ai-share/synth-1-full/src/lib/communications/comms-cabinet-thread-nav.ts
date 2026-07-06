import {
  brandMessagesB2bOrderContextHref,
  brandMessagesWorkshop2ArticleContextHref,
  factoryMessagesB2bOrderContextHref,
  factoryMessagesRoleHref,
  factoryMessagesWorkshop2ArticleContextHref,
  factorySupplierMessagesB2bOrderContextHref,
  factorySupplierMessagesWorkshop2ArticleContextHref,
  ROUTES,
  shopMessagesB2bOrderContextHref,
  shopMessagesWorkshop2ArticleContextHref,
} from '@/lib/routes';
import type { BrandPgThreadRow } from '@/lib/brand/brand-messages-pg-threads';
import { WORKSHOP2_B2B_ORDER_CONTEXT_TYPE } from '@/lib/production/workshop2-b2b-order-lifecycle';

export type CommsCabinetVariant = 'brand' | 'shop' | 'manufacturer' | 'supplier';

export function commsCabinetRolePrefix(variant: CommsCabinetVariant): string {
  if (variant === 'shop') return 'shop-cm-cabinet';
  if (variant === 'manufacturer') return 'mfr-cm-cabinet';
  if (variant === 'supplier') return 'sup-cm-cabinet';
  return 'brand-cm-cabinet';
}

export function commsCabinetThreadWorkspaceHref(
  variant: CommsCabinetVariant,
  thread: BrandPgThreadRow
): string | null {
  if (thread.contextType === WORKSHOP2_B2B_ORDER_CONTEXT_TYPE) {
    const id = thread.contextId?.trim();
    if (!id) return null;
    if (variant === 'shop') return shopMessagesB2bOrderContextHref(id);
    if (variant === 'brand') return brandMessagesB2bOrderContextHref(id);
    if (variant === 'supplier') {
      return factorySupplierMessagesB2bOrderContextHref(id);
    }
    return factoryMessagesB2bOrderContextHref(id, { role: 'manufacturer' });
  }
  if (thread.workspaceHref?.trim()) return thread.workspaceHref.trim();
  const cid = thread.collectionId?.trim();
  const aid = thread.articleId?.trim();
  if (!cid || !aid) return null;
  if (variant === 'shop') return shopMessagesWorkshop2ArticleContextHref(cid, aid);
  if (variant === 'brand') return brandMessagesWorkshop2ArticleContextHref(cid, aid);
  if (variant === 'supplier') {
    return factorySupplierMessagesWorkshop2ArticleContextHref(cid, aid);
  }
  return factoryMessagesWorkshop2ArticleContextHref(cid, aid, { role: 'manufacturer' });
}

export function commsCabinetInboxAllHref(variant: CommsCabinetVariant): string {
  if (variant === 'shop') return ROUTES.shop.messages;
  if (variant === 'brand') return ROUTES.brand.messages;
  return factoryMessagesRoleHref(variant === 'supplier' ? 'supplier' : 'manufacturer');
}
