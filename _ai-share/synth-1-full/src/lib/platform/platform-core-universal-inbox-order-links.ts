import {
  brandB2bOrderChainContextHref,
  brandCalendarB2bOrderContextHref,
  brandMessagesB2bOrderContextHref,
  factoryCalendarB2bOrderContextHref,
  factoryMessagesB2bOrderContextHref,
  factoryProductionOrdersOrderContextHref,
  factorySupplierCalendarB2bOrderContextHref,
  factorySupplierMessagesB2bOrderContextHref,
  shopB2bTrackingOrderHref,
  shopCalendarB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/routes';

export type PlatformCoreUniversalInboxVariant =
  | 'shop'
  | 'brand'
  | 'manufacturer'
  | 'supplier';

export type UniversalInboxOrderDeepLinks = {
  chatHref: string;
  trackingHref: string;
  calendarHref: string;
};

export function universalInboxOrderDeepLinks(
  variant: PlatformCoreUniversalInboxVariant,
  orderId: string,
  opts?: { factoryId?: string }
): UniversalInboxOrderDeepLinks {
  const id = orderId.trim();
  if (variant === 'shop') {
    return {
      chatHref: shopMessagesB2bOrderContextHref(id),
      trackingHref: shopB2bTrackingOrderHref(id),
      calendarHref: shopCalendarB2bOrderContextHref(id),
    };
  }
  if (variant === 'brand') {
    return {
      chatHref: brandMessagesB2bOrderContextHref(id),
      trackingHref: brandB2bOrderChainContextHref(id),
      calendarHref: brandCalendarB2bOrderContextHref(id),
    };
  }
  if (variant === 'supplier') {
    return {
      chatHref: factorySupplierMessagesB2bOrderContextHref(id),
      trackingHref: shopB2bTrackingOrderHref(id),
      calendarHref: factorySupplierCalendarB2bOrderContextHref(id),
    };
  }
  return {
    chatHref: factoryMessagesB2bOrderContextHref(id, { role: 'manufacturer' }),
    trackingHref: factoryProductionOrdersOrderContextHref(id, { factoryId: opts?.factoryId }),
    calendarHref: factoryCalendarB2bOrderContextHref(id),
  };
}

/** Короткая RU-подпись строки заказа в universal inbox. */
export function universalInboxOrderLabelRu(orderId: string): string {
  const id = orderId.trim();
  if (!id) return 'Заказ';
  const tail = id.length > 12 ? id.slice(-10) : id;
  return `Заказ · ${tail}`;
}
