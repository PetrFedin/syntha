import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

/** Wave UW · canonical invite BFF with PG journal. */
export const SHOP_PARTNERSHIP_INVITE_API_PATH = '/api/shop/b2b/partnerships/invite' as const;

export type ShopPartnershipInviteAction = 'request' | 'connect';

export type ShopPartnershipInviteResult = {
  ok: boolean;
  action?: ShopPartnershipInviteAction;
  messageRu: string;
  storageMode?: string;
  partnership?: {
    brandId: string;
    name: string;
    status: string;
  };
};

/** POST /api/shop/b2b/partnerships/invite — PG onboarding invite + journal (Wave UW). */
export async function postShopPartnershipInvite(input: {
  brandId: string;
  action?: ShopPartnershipInviteAction;
  buyerId?: string;
  collectionId?: string;
}): Promise<ShopPartnershipInviteResult> {
  const res = await fetch(SHOP_PARTNERSHIP_INVITE_API_PATH, {
    method: 'POST',
    headers: buildWorkshop2ApiRequestHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    body: JSON.stringify(input),
  });
  return (await res.json()) as ShopPartnershipInviteResult;
}
