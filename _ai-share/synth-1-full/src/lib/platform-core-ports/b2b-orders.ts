import 'server-only';

/** Platform Core → B2B order read boundary (shipment/documents gateways). */
export { getWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';
export type { Workshop2B2bOrderRecord } from '@/lib/production/workshop2-b2b-order-lifecycle';
