import { NextResponse } from 'next/server';
import { getCategoryHandbookSnapshot } from '@/lib/production/category-handbook-leaves';
import { readJsonBody } from '@/lib/http/read-json-body';
import { resolveOrRejectHandbookCatalogLeafId } from '@/lib/validation/handbook-leaf-id';
import {
  putSewingOrderIntentRecord,
  resolveLatestRecord,
} from '@/lib/server/sewing-order-intent-store';
import { forwardSewingIntentToWebhook } from '@/lib/server/sewing-intent-webhook';
import { appendSewingIntentInternalTask } from '@/lib/server/sewing-intent-internal-queue';
import { rateLimitAllow, requestClientKey } from '@/lib/server/simple-rate-limit';
import { publishStoreSewingIntentCommitted } from '@/lib/order/domain-event-factories';
import type { SewingOrderIntentServerRecordV1 } from '@/lib/client/sewing-order-intent';
import { sewingIntentSubjectKey } from '@/lib/client/sewing-order-intent';

export const dynamic = 'force-dynamic';

/**
 * GET — последний сохранённый снимок для `userId` (если есть) или `deviceId`.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId')?.trim() ?? '';
  const userId = searchParams.get('userId')?.trim();
  if (!deviceId || deviceId.length < 4) {
    return NextResponse.json({ ok: false as const, error: 'missing_deviceId' }, { status: 400 });
  }
  try {
    const record = await resolveLatestRecord({ userId: userId || null, deviceId });
    return NextResponse.json(
      { ok: true as const, record },
      {
        headers: {
          'Cache-Control': 'private, no-cache, max-age=0, stale-while-revalidate=60',
        },
      }
    );
  } catch {
    return NextResponse.json({ ok: false as const, error: 'read_failed' }, { status: 500 });
  }
}

/**
 * POST — валидация `handbookLeafId`, опционально персист + доменное событие + webhook.
 */
export async function POST(request: Request) {
  if (!rateLimitAllow(requestClientKey(request, 'sewing-intent'), 40, 60_000)) {
    return NextResponse.json({ ok: false as const, error: 'rate_limited' }, { status: 429 });
  }
  try {
    const body = await readJsonBody<{
      handbookLeafId?: string;
      measures?: Record<string, string>;
      deviceId?: string;
      userId?: string | null;
      /** default true: писать в `data/sewing-order-intents.json` */
      persist?: boolean;
    }>(request);

    const deviceId = String(body.deviceId ?? '').trim();
    if (deviceId.length < 4) {
      return NextResponse.json({ ok: false as const, error: 'missing_deviceId' }, { status: 400 });
    }

    const userId = body.userId?.trim() || null;
    const persist = body.persist !== false;

    const resolved = resolveOrRejectHandbookCatalogLeafId(String(body.handbookLeafId ?? ''));
    if (!resolved.ok) {
      return NextResponse.json(
        {
          ok: false as const,
          error: resolved.reason === 'empty' ? 'missing_handbookLeafId' : 'unknown_leaf',
        },
        { status: 400 }
      );
    }

    const leaf = resolved.leaf;
    const m = body.measures ?? {};
    const measures = {
      bust: String(m.bust ?? ''),
      waist: String(m.waist ?? ''),
      hip: String(m.hip ?? ''),
      shoulder: String(m.shoulder ?? ''),
      height: String(m.height ?? ''),
    };

    const snap = getCategoryHandbookSnapshot();
    const categoryHandbook = { schemaVersion: snap.schemaVersion, generatedAt: snap.generatedAt };
    const isApparelSewing = leaf.l1Name === 'Одежда';
    const now = new Date().toISOString();

    const subject = userId
      ? { kind: 'user' as const, id: userId }
      : { kind: 'device' as const, id: deviceId };

    const record: SewingOrderIntentServerRecordV1 = {
      v: 1,
      handbookLeafId: resolved.canonicalId,
      pathLabel: leaf.pathLabel,
      l1Name: leaf.l1Name,
      l2Name: leaf.l2Name,
      l3Name: leaf.l3Name,
      isApparelSewing,
      measures,
      subject,
      updatedAt: now,
      categoryHandbook,
      source: 'sewing-patterns',
    };

    if (persist) {
      await putSewingOrderIntentRecord(record);
      void appendSewingIntentInternalTask(record);
    }

    const aggregateId = sewingIntentSubjectKey(subject);
    void publishStoreSewingIntentCommitted({
      aggregateId,
      version: 1,
      payload: {
        handbookLeafId: record.handbookLeafId,
        pathLabel: record.pathLabel,
        l1Name: record.l1Name,
        l2Name: record.l2Name,
        l3Name: record.l3Name,
        isApparelSewing: record.isApparelSewing,
        subjectKind: subject.kind,
        subjectId: subject.id,
        measures,
        source: 'sewing-patterns',
        categoryHandbookSchemaVersion: snap.schemaVersion,
      },
    }).catch((e) => {
      console.error('[sewing-pattern-intent] publish failed', e);
    });

    if (persist) {
      forwardSewingIntentToWebhook(record);
    }

    return NextResponse.json({
      ok: true as const,
      handbookLeafId: resolved.canonicalId,
      pathLabel: leaf.pathLabel,
      l1Name: leaf.l1Name,
      l2Name: leaf.l2Name,
      l3Name: leaf.l3Name,
      hadMeasures: Object.values(measures).some((s) => s.length > 0),
      categoryHandbook,
      persisted: persist,
      record,
    });
  } catch (e) {
    console.error('[sewing-pattern-intent] POST', e);
    return NextResponse.json({ ok: false as const, error: 'bad_json' }, { status: 400 });
  }
}
