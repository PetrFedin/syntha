/**
 * POST Wave VA: sample state-change webhook stub — journal + development-status bump.
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  isWorkshop2SampleStateChangeWebhookEnabled,
  validateWorkshop2SampleStateChangeWebhookPayload,
  verifyWorkshop2SampleStateChangeWebhookSecret,
} from '@/lib/production/workshop2-sample-state-change-webhook';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';
import { handleWorkshop2SampleStateChangeWebhook } from '@/lib/server/workshop2-sample-state-change-webhook-handler';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withWorkshop2ApiErrorRu(async function postSampleStateChangeWebhook(
  req: NextRequest
) {
  if (!isWorkshop2SampleStateChangeWebhookEnabled()) {
    return jsonWorkshop2ErrorRu(503, 'webhook_disabled', {
      messageRu:
        'Sample state-change webhook отключён (WORKSHOP2_SAMPLE_STATE_CHANGE_WEBHOOK_ENABLED=false).',
    });
  }

  const verify = verifyWorkshop2SampleStateChangeWebhookSecret({
    signatureHeader: req.headers.get('x-sample-state-secret'),
  });
  if (!verify.ok) {
    return jsonWorkshop2ErrorRu(verify.status ?? 401, 'webhook_unauthorized', {
      messageRu: verify.messageRu ?? 'Sample webhook: отказ авторизации.',
    });
  }

  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }

  const validated = validateWorkshop2SampleStateChangeWebhookPayload(body);
  if (!validated.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: validated.error,
        messageRu: validated.messageRu,
        fieldErrors: validated.fieldErrors,
      },
      { status: 400 }
    );
  }

  const actor =
    resolveWorkshop2UpdatedBy(req, validated.data.actor ?? '', auth.actor) ??
    'sample-state-webhook';

  const result = await handleWorkshop2SampleStateChangeWebhook({
    ...validated.data,
    actorLabel: actor,
  });

  if (!result.ok) {
    return jsonWorkshop2ErrorRu(400, 'sample_webhook_failed', { messageRu: result.messageRu });
  }

  return NextResponse.json({
    ok: true,
    idempotent: result.idempotent ?? false,
    journalRecorded: result.journalRecorded,
    partnerDispatch: 'stub',
    messageRu: result.messageRu,
  });
});
