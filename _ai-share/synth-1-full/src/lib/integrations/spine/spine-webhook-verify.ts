/**
 * Wave H · verify spine integration webhooks (NuOrder/JOOR shipment inbound).
 */
export function verifyIntegrationsSpineWebhookSecret(input: {
  secretHeader?: string | null;
  env?: Record<string, string | undefined>;
}): { ok: boolean; status?: 401; messageRu?: string } {
  const expected = String(
    input.env?.INTEGRATIONS_SPINE_WEBHOOK_SECRET ??
      process.env.INTEGRATIONS_SPINE_WEBHOOK_SECRET ??
      ''
  ).trim();

  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      return {
        ok: false,
        status: 401,
        messageRu:
          'Inbound webhook: задайте INTEGRATIONS_SPINE_WEBHOOK_SECRET (fail-closed в production).',
      };
    }
    return { ok: true };
  }

  if (input.secretHeader?.trim() === expected) return { ok: true };
  return { ok: false, status: 401, messageRu: 'Inbound webhook: неверный секрет.' };
}
