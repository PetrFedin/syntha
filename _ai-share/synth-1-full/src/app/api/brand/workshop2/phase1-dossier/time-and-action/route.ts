import { NextResponse } from 'next/server';
import type { Workshop2TaMilestone } from '@/lib/production/workshop2-dossier-phase1.types';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';

function dossierParamsMissing(req: Request): boolean {
  const { searchParams } = new URL(req.url);
  const collectionId = searchParams.get('collectionId')?.trim();
  const articleId = searchParams.get('articleId')?.trim();
  return !collectionId || !articleId;
}

function readTaMilestonesFromDossier(
  collectionId: string,
  articleId: string
): Promise<Workshop2TaMilestone[]> {
  return getWorkshop2ServerDossierRecord(collectionId, articleId).then(
    (record) => record?.dossier?.taMilestones ?? []
  );
}

export async function GET(req: Request) {
  if (dossierParamsMissing(req)) {
    return NextResponse.json({ error: 'dossier_required' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const collectionId = searchParams.get('collectionId')!.trim();
  const articleId = searchParams.get('articleId')!.trim();
  const milestones = await readTaMilestonesFromDossier(collectionId, articleId);

  return NextResponse.json({ milestones });
}

export async function PATCH(req: Request) {
  if (dossierParamsMissing(req)) {
    return NextResponse.json({ error: 'dossier_required' }, { status: 503 });
  }

  void req;
  return NextResponse.json(
    { error: 'T&A updates require dossier PG mirror (not legacy mock).' },
    { status: 503 }
  );
}
