import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  appendWorkshop2Ss27UatSignoff,
  summarizeWorkshop2Ss27UatHumanSignoff,
  summarizeWorkshop2Wave55InvestorFreezeSignoff,
  type Workshop2Ss27UatSignoffRole,
} from '@/lib/production/workshop2-ss27-uat-signoff-journal';

function parseRole(value: unknown): Workshop2Ss27UatSignoffRole | null {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'ops' || raw === 'staging' || raw === 'product') return raw;
  return null;
}

async function postSs27Signoff(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }

  const role = parseRole(body.role);
  if (!role) {
    return jsonWorkshop2ErrorRu(400, 'invalid_role', {
      messageRu: 'role должен быть ops, staging или product.',
    });
  }

  const signedBy = String(body.signedBy ?? '').trim();
  if (!signedBy) {
    return jsonWorkshop2ErrorRu(400, 'signed_by_required', {
      messageRu: 'Укажите signedBy (email или ФИО).',
    });
  }

  try {
    const journal = appendWorkshop2Ss27UatSignoff({
      role,
      signedBy,
      notes: body.notes != null ? String(body.notes) : undefined,
    });
    const human = summarizeWorkshop2Ss27UatHumanSignoff(journal);
    const wave55Freeze = summarizeWorkshop2Wave55InvestorFreezeSignoff(journal);
    return NextResponse.json({
      ok: true,
      collectionId: journal.collectionId,
      role,
      signedBy,
      signedAt: journal.entries.find((e) => e.role === role)?.signedAt ?? journal.updatedAt,
      humanSignoffComplete: human.humanSignoffComplete,
      humanSignoffAt: human.humanSignoffAt,
      humanSignoffs: human.humanSignoffs,
      wave55FreezeReady: wave55Freeze.wave55FreezeComplete,
      wave55FreezeAt: wave55Freeze.wave55FreezeAt,
      wave55FreezeSignoffs: wave55Freeze.wave55FreezeSignoffs,
      messageRu: human.humanSignoffComplete
        ? 'Human UAT signoff завершён (ops + staging).'
        : wave55Freeze.wave55FreezeComplete
          ? 'Wave 55 investor freeze signoff завершён (ops + product).'
          : `Подпись ${role} сохранена — ожидаются остальные роли.`,
    });
  } catch (err) {
    return jsonWorkshop2ErrorRu(400, 'signoff_failed', {
      messageRu: err instanceof Error ? err.message : 'signoff_failed',
    });
  }
}

export const POST = withWorkshop2ApiErrorRu(postSs27Signoff);
