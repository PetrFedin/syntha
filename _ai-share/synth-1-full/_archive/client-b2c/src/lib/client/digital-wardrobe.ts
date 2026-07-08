/**
 * Digital Wardrobe — виртуальный шкаф купленного + конструктор луков.
 * Связи: Заказы, Body Scan, каталог. Инфра под API.
 */

export interface WardrobeItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  imageUrl?: string;
  /** Из какого заказа */
  orderId?: string;
  purchasedAt: string;
  category?: string;
}

export interface WardrobeLook {
  id: string;
  name?: string;
  itemIds: string[];
  imageUrl?: string;
  createdAt: string;
}

export const DIGITAL_WARDROBE_API = {
  listItems: '/api/v1/client/wardrobe/items',
  createLook: '/api/v1/client/wardrobe/looks',
  listLooks: '/api/v1/client/wardrobe/looks',
  syncFromOrders: '/api/v1/client/wardrobe/sync',
  recommendLooks: '/api/v1/client/wardrobe/recommend',
} as const;
