import { NextResponse } from 'next/server';

import { listCentricRfqRecords } from '@/lib/integrations/spine/centric-rfq-persistence.file';
import { mapCentricRfqRecordsToRegistryRows } from '@/lib/fashion/brand-centric-rfq-registry';

/** GET /api/integrations/v1/centric/rfq — RFQ registry for brand procurement workspace. */
export async function GET() {
  const records = listCentricRfqRecords();
  const rows = mapCentricRfqRecordsToRegistryRows(records);
  return NextResponse.json({
    ok: true,
    rows,
    count: rows.length,
    messageRu: rows.length
      ? `${rows.length} RFQ в реестре.`
      : 'RFQ пока нет — импортируйте из Centric.',
  });
}
