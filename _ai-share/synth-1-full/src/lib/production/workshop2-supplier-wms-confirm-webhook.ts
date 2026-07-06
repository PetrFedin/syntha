/**
 * Wave TX · inbound WMS shipment confirm webhook (env-gated stub).
 */

export function isWorkshop2SupplierWmsConfirmWebhookEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  return (
    String(env.WORKSHOP2_SUPPLIER_WMS_CONFIRM_WEBHOOK_ENABLED ?? '')
      .trim()
      .toLowerCase() === 'true'
  );
}

export function verifyWorkshop2SupplierWmsConfirmWebhookSecret(input: {
  signatureHeader?: string | null;
  env?: Record<string, string | undefined>;
}): { ok: boolean; status?: 401; messageRu?: string } {
  const secret = String(
    input.env?.WORKSHOP2_SUPPLIER_WMS_CONFIRM_WEBHOOK_SECRET ??
      process.env.WORKSHOP2_SUPPLIER_WMS_CONFIRM_WEBHOOK_SECRET ??
      ''
  ).trim();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return {
        ok: false,
        status: 401,
        messageRu:
          'WMS confirm webhook: задайте WORKSHOP2_SUPPLIER_WMS_CONFIRM_WEBHOOK_SECRET (fail-closed).',
      };
    }
    return { ok: true };
  }
  const header = String(input.signatureHeader ?? '').trim();
  if (!header || header !== secret) {
    return {
      ok: false,
      status: 401,
      messageRu: 'WMS confirm webhook: неверный x-wms-confirm-secret.',
    };
  }
  return { ok: true };
}
