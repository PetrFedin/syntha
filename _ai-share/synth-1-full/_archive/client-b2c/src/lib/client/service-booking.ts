/**
 * Service Booking Hub — заказ химчистки, ремонта, кастомизации.
 * Связи: заказы, клиент, магазины. Инфра под API.
 */

export type ServiceType = 'dry_cleaning' | 'repair' | 'customization' | 'other';

export type ServiceBookingStatus =
  | 'draft'
  | 'submitted'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ServiceOption {
  id: string;
  type: ServiceType;
  name: string;
  description?: string;
  priceFromRub?: number;
  /** ID магазина/точки, где оказывается услуга */
  storeId?: string;
}

export interface ServiceBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  status: ServiceBookingStatus;
  /** Привязка к вещи: orderId или wardrobeItemId */
  orderItemId?: string;
  productName?: string;
  storeId?: string;
  storeName?: string;
  createdAt: string;
  scheduledAt?: string;
}

export const SERVICE_BOOKING_API = {
  listServices: '/api/v1/client/services',
  listBookings: '/api/v1/client/service-bookings',
  createBooking: '/api/v1/client/service-bookings',
  cancelBooking: '/api/v1/client/service-bookings/:id/cancel',
} as const;
