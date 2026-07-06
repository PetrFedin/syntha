import 'server-only';

import {
  buildBrandCoCrmLinesheetVisibilityRows,
  summarizeBrandCoCrmLinesheetVisibility,
} from '@/lib/b2b/brand-co-crm-linesheet-visibility';
import { listBrandCrmSegmentsServer } from '@/lib/server/brand-crm-segments-repository';

export async function getBrandCoCrmLinesheetVisibilityServer(input?: {
  collectionId?: string;
  organizationId?: string;
}) {
  const collectionId = input?.collectionId?.trim() || 'SS27';
  const listed = await listBrandCrmSegmentsServer({
    organizationId: input?.organizationId,
  });
  const rows = buildBrandCoCrmLinesheetVisibilityRows({
    segments: listed.segments,
    collectionId,
  });

  return {
    collectionId,
    rows,
    summary: summarizeBrandCoCrmLinesheetVisibility(rows),
    storageMode: listed.storageMode,
  };
}
