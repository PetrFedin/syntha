import { NextRequest, NextResponse } from 'next/server';

import type { PlatformCoreEntityThreadKind } from '@/lib/communications/platform-core-entity-thread-templates';
import type { SavedPlatformCoreEntityThreadTemplate } from '@/lib/communications/platform-core-entity-thread-templates-storage';
import {
  deletePlatformCoreEntityThreadTemplateServer,
  getPlatformCoreEntityThreadTemplatesServer,
  platformCoreEntityThreadTemplatesStorageMode,
  platformCoreEntityThreadTemplatesStorageModeLabelRu,
  savePlatformCoreEntityThreadTemplateServer,
} from '@/lib/server/platform-core-entity-thread-templates-repository';
import { toBffPgStorageMode } from '@/lib/server/bff-pg-storage-mode';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

const THREAD_KINDS = new Set<PlatformCoreEntityThreadKind>([
  'bom',
  'sample',
  'qc',
  'rfq',
  'dossier',
  'handoff',
]);

function ownerKeyFromRequest(req: NextRequest): string {
  return (
    req.nextUrl.searchParams.get('ownerKey')?.trim() ||
    req.headers.get('x-w2-organization-id')?.trim() ||
    'platform-core'
  );
}

/** GET /api/platform-core/comms/entity-thread-templates — PG store шаблонов entity threads. */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const ownerKey = ownerKeyFromRequest(req);
  const threadKind = req.nextUrl.searchParams.get('threadKind')?.trim() as
    | PlatformCoreEntityThreadKind
    | undefined;
  const config = await getPlatformCoreEntityThreadTemplatesServer(ownerKey);
  const templates = threadKind
    ? config.templates.filter((t) => t.threadKind === threadKind)
    : config.templates;

  return NextResponse.json({
    ok: true,
    ownerKey,
    templates,
    storageMode: toBffPgStorageMode(platformCoreEntityThreadTemplatesStorageMode()),
    storageModeLabelRu: platformCoreEntityThreadTemplatesStorageModeLabelRu(),
    updatedAt: config.updatedAt,
  });
}

export async function POST(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const ownerKey = ownerKeyFromRequest(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;
  const labelRu = String(b.labelRu ?? '').trim();
  const bodyTemplate = String(b.bodyTemplate ?? '').trim();
  const threadKind = String(b.threadKind ?? '') as PlatformCoreEntityThreadKind;
  if (!labelRu || !bodyTemplate || !THREAD_KINDS.has(threadKind)) {
    return NextResponse.json(
      { ok: false, messageRu: 'Нужны labelRu, bodyTemplate, threadKind.' },
      { status: 400 }
    );
  }

  const template: SavedPlatformCoreEntityThreadTemplate = {
    id: String(b.id ?? `entity-${Date.now()}`),
    labelRu: labelRu.slice(0, 48),
    threadKind,
    bodyTemplate: bodyTemplate.slice(0, 2000),
    createdAt: new Date().toISOString(),
  };

  const saved = await savePlatformCoreEntityThreadTemplateServer({ ownerKey, template });
  return NextResponse.json({
    ok: true,
    template,
    templates: saved.templates,
    storageMode: toBffPgStorageMode(platformCoreEntityThreadTemplatesStorageMode()),
    storageModeLabelRu: platformCoreEntityThreadTemplatesStorageModeLabelRu(),
  });
}

export async function DELETE(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const ownerKey = ownerKeyFromRequest(req);
  const id = req.nextUrl.searchParams.get('id')?.trim();
  if (!id) {
    return NextResponse.json({ ok: false, messageRu: 'Укажите id.' }, { status: 400 });
  }
  const saved = await deletePlatformCoreEntityThreadTemplateServer({ ownerKey, id });
  return NextResponse.json({
    ok: true,
    templates: saved.templates,
    storageMode: toBffPgStorageMode(platformCoreEntityThreadTemplatesStorageMode()),
  });
}
