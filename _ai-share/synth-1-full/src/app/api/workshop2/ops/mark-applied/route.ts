import { NextResponse } from 'next/server';

import {
  appendWorkshop2OpsAppliedOrgJournal,
  readWorkshop2OpsAppliedOrgJournal,
} from '@/lib/production/workshop2-ops-applied-org-journal';
import { readWorkshop2OpsAppliedStatus } from '@/lib/production/workshop2-wave-ops-applied-status';

type MarkAppliedBody = {
  appliedBy?: string;
  pagerdutyApplied?: boolean;
  sentryApplied?: boolean;
  notesRu?: string;
};

/** POST — admin records PagerDuty+Sentry applied in org journal (Wave 57). */
export async function POST(req: Request) {
  let body: MarkAppliedBody = {};
  try {
    body = (await req.json()) as MarkAppliedBody;
  } catch {
    body = {};
  }

  const appliedBy = String(body.appliedBy ?? 'ops-admin').trim() || 'ops-admin';
  const pagerdutyApplied = body.pagerdutyApplied !== false;
  const sentryApplied = body.sentryApplied !== false;

  if (!pagerdutyApplied || !sentryApplied) {
    return NextResponse.json(
      {
        ok: false,
        messageRu: 'Ops checklist org-applied: нужны pagerdutyApplied и sentryApplied (оба true).',
      },
      { status: 400 }
    );
  }

  const journal = appendWorkshop2OpsAppliedOrgJournal({
    appliedBy,
    pagerdutyApplied,
    sentryApplied,
    notesRu: body.notesRu?.trim() || 'PagerDuty + Sentry применены в org (Wave 57 mark-applied).',
    source: 'admin_api',
  });

  return NextResponse.json({
    ok: true,
    orgApplied: journal.orgApplied,
    updatedAt: journal.updatedAt,
    entriesCount: journal.entries.length,
    statusFile: readWorkshop2OpsAppliedStatus(),
    messageRu:
      'Ops checklist зафиксирован в org journal — cutover opsAppliedChecklist учитывает journal OR env.',
  });
}

/** GET — read org-applied journal (ops audit). */
export async function GET() {
  const journal = readWorkshop2OpsAppliedOrgJournal();
  const status = readWorkshop2OpsAppliedStatus();
  return NextResponse.json({
    ok: true,
    journal,
    statusFile: status,
    orgApplied: Boolean(journal?.orgApplied || status?.opsChecklistApplied),
  });
}
