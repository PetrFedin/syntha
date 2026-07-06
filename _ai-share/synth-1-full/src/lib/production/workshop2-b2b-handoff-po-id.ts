/** Deterministic production order id for B2B handoff (client + server safe). */
export function workshop2B2bProductionHandoffPoId(orderId: string): string {
  return `PO-B2B-${orderId.trim()}`;
}
