import 'server-only';

import {
  getWorkshop2ServerDossierRecord,
  getWorkshop2ServerDossierStoreMode,
} from '@/lib/platform-core-ports/dossier-store';

export type PlatformCoreDppGatewaySource =
  | 'workshop2_dossier_dpp'
  | 'workshop2_dossier_materials';

export type PlatformCoreAdapterIssue = {
  id: string;
  severity: 'blocker' | 'warning';
  message: string;
};

export type PlatformCoreDppSnapshot = {
  collectionId: string;
  articleId: string;
  version: number;
  updatedAt: string;
  source: PlatformCoreDppGatewaySource;
  passportId?: string;
  compositionText?: string;
  materialCount: number;
  certificateCount: number;
  validationReady?: boolean;
  validationHint?: string;
};

export type PlatformCoreDppEvaluation = {
  status: 'core_ready' | 'warning' | 'blocked';
  eventCreated: string;
  nextOwnerLabel: string;
  issues: PlatformCoreAdapterIssue[];
  ready: boolean;
  shipmentBlocked: boolean;
  handoffBlocked: boolean;
  completenessPct: number;
};

export type PlatformCoreDppArticleResult =
  | {
      ok: true;
      collectionId: string;
      articleId: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
      version: number;
      updatedAt: string;
      dpp: PlatformCoreDppSnapshot;
      evaluation: PlatformCoreDppEvaluation;
    }
  | {
      ok: false;
      reason: 'invalid_path' | 'not_found';
      collectionId?: string;
      articleId?: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
    };

type DossierDppShape = {
  productionModel?: {
    materialLines?: readonly {
      compositionText?: string;
      certificateId?: string;
      certificateRef?: string;
      complianceCertificateId?: string;
    }[];
  };
  dppExportValidation?: {
    state?: 'ready' | 'blocked';
    hintRu?: string;
    passportId?: string;
  };
  compositionLabelSpec?: {
    extraLegalLines?: string;
    technologistNotes?: string;
  };
  vaultDocuments?: readonly {
    type?: string;
    title?: string;
  }[];
};

function cleanString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t || undefined;
}

function adapterStatus(issues: PlatformCoreAdapterIssue[]): PlatformCoreDppEvaluation['status'] {
  if (issues.some((i) => i.severity === 'blocker')) return 'blocked';
  if (issues.some((i) => i.severity === 'warning')) return 'warning';
  return 'core_ready';
}

function firstCompositionText(dossier?: DossierDppShape | null): string | undefined {
  const fromMaterial = dossier?.productionModel?.materialLines?.find((line) =>
    cleanString(line.compositionText)
  )?.compositionText;
  return (
    cleanString(fromMaterial) ??
    cleanString(dossier?.compositionLabelSpec?.extraLegalLines) ??
    cleanString(dossier?.compositionLabelSpec?.technologistNotes)
  );
}

function certificateCount(dossier?: DossierDppShape | null): number {
  const vaultCertificates = (dossier?.vaultDocuments ?? []).filter((doc) =>
    /сертифик|certificate/i.test(`${doc.type ?? ''} ${doc.title ?? ''}`)
  ).length;
  const bomCertificates = (dossier?.productionModel?.materialLines ?? []).filter(
    (line) => line.certificateId || line.certificateRef || line.complianceCertificateId
  ).length;
  return vaultCertificates + bomCertificates;
}

function buildSnapshot(input: {
  collectionId: string;
  articleId: string;
  version: number;
  updatedAt: string;
  dossier: DossierDppShape;
}): PlatformCoreDppSnapshot {
  const validation = input.dossier.dppExportValidation;
  return {
    collectionId: input.collectionId,
    articleId: input.articleId,
    version: input.version,
    updatedAt: input.updatedAt,
    source: validation ? 'workshop2_dossier_dpp' : 'workshop2_dossier_materials',
    passportId: cleanString(validation?.passportId),
    compositionText: firstCompositionText(input.dossier),
    materialCount: input.dossier.productionModel?.materialLines?.length ?? 0,
    certificateCount: certificateCount(input.dossier),
    validationReady:
      validation?.state === 'ready' ? true : validation?.state === 'blocked' ? false : undefined,
    validationHint: cleanString(validation?.hintRu),
  };
}

function evaluateDpp(snapshot: PlatformCoreDppSnapshot): PlatformCoreDppEvaluation {
  const issues: PlatformCoreAdapterIssue[] = [];

  if (!snapshot.passportId) {
    issues.push({
      id: 'dpp.passport.missing',
      severity: 'blocker',
      message: 'Нет passportId.',
    });
  }
  if (!snapshot.compositionText && snapshot.materialCount === 0) {
    issues.push({
      id: 'dpp.composition.missing',
      severity: 'blocker',
      message: 'Нет состава или материалов.',
    });
  }
  if (snapshot.certificateCount === 0) {
    issues.push({
      id: 'dpp.certificates.missing',
      severity: 'warning',
      message: 'Нет сертификатов для паспорта.',
    });
  }
  if (snapshot.validationReady === false && snapshot.validationHint) {
    issues.push({
      id: 'dpp.validation.blocked',
      severity: 'warning',
      message: snapshot.validationHint,
    });
  }
  if (snapshot.validationReady === undefined) {
    issues.push({
      id: 'dpp.validation.missing',
      severity: 'warning',
      message:
        'DPP validation mirror не найден: passport проверяется только по материалам и сертификатам.',
    });
  }

  const ready = !issues.some((i) => i.severity === 'blocker');
  const checks = [
    Boolean(snapshot.passportId),
    Boolean(snapshot.compositionText || snapshot.materialCount > 0),
    snapshot.certificateCount > 0,
    snapshot.validationReady !== false,
    snapshot.validationReady === true,
  ];
  const completenessPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const handoffBlocked = !ready || snapshot.validationReady === false;
  const shipmentBlocked = handoffBlocked || snapshot.certificateCount === 0;

  return {
    status: adapterStatus(issues),
    eventCreated: 'dpp.passport_validated',
    nextOwnerLabel: 'Бренд',
    issues,
    ready,
    handoffBlocked,
    shipmentBlocked,
    completenessPct,
  };
}

export async function getPlatformCoreDppForArticle(input: {
  collectionId: string;
  articleId: string;
}): Promise<PlatformCoreDppArticleResult> {
  const collectionId = input.collectionId?.trim();
  const articleId = input.articleId?.trim();
  const storeMode = getWorkshop2ServerDossierStoreMode();

  if (!collectionId || !articleId) {
    return { ok: false, reason: 'invalid_path', collectionId, articleId, storeMode };
  }

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  if (!record?.dossier) {
    return { ok: false, reason: 'not_found', collectionId, articleId, storeMode };
  }

  const dpp = buildSnapshot({
    collectionId,
    articleId,
    version: record.version ?? 0,
    updatedAt: record.updatedAt ?? new Date().toISOString(),
    dossier: record.dossier as DossierDppShape,
  });

  return {
    ok: true,
    collectionId,
    articleId,
    storeMode,
    version: dpp.version,
    updatedAt: dpp.updatedAt,
    dpp,
    evaluation: evaluateDpp(dpp),
  };
}
