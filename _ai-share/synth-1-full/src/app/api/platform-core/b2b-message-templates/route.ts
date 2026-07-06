import { NextResponse } from 'next/server';

import type { PlatformCoreB2bMessageTemplateContext } from '@/lib/communications/platform-core-b2b-message-templates';
import type { SavedPlatformCoreB2bMessageTemplate } from '@/lib/communications/platform-core-b2b-message-templates-storage';
import {
  deletePlatformCoreB2bMessageTemplateServer,
  getPlatformCoreB2bMessageTemplatesServer,
  platformCoreB2bMessageTemplatesStorageMode,
  savePlatformCoreB2bMessageTemplateServer,
} from '@/lib/server/platform-core-b2b-message-templates-repository';
import { toBffPgStorageMode } from '@/lib/server/bff-pg-storage-mode';

const DEFAULT_OWNER = 'platform-core';

function isValidContext(value: unknown): value is PlatformCoreB2bMessageTemplateContext {
  return value === 'b2b_order' || value === 'workshop2_article';
}

/** GET /api/platform-core/b2b-message-templates — file/memory SoT for custom templates. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ownerKey = url.searchParams.get('ownerKey')?.trim() || DEFAULT_OWNER;
  const config = await getPlatformCoreB2bMessageTemplatesServer(ownerKey);
  return NextResponse.json({
    ok: true,
    config,
    storageMode: toBffPgStorageMode(platformCoreB2bMessageTemplatesStorageMode()),
  });
}

/** POST /api/platform-core/b2b-message-templates — save custom template. */
export async function POST(req: Request) {
  const body = (await req.json()) as {
    ownerKey?: string;
    labelRu?: string;
    context?: PlatformCoreB2bMessageTemplateContext;
    bodyTemplate?: string;
  };
  const ownerKey = body.ownerKey?.trim() || DEFAULT_OWNER;
  const labelRu = body.labelRu?.trim() ?? '';
  const bodyTemplate = body.bodyTemplate?.trim() ?? '';
  if (!labelRu || !bodyTemplate || !isValidContext(body.context)) {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный шаблон' }, { status: 400 });
  }
  const template: SavedPlatformCoreB2bMessageTemplate = {
    id: `custom-${Date.now()}`,
    labelRu: labelRu.slice(0, 48),
    context: body.context,
    bodyTemplate: bodyTemplate.slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  const config = await savePlatformCoreB2bMessageTemplateServer({ ownerKey, template });
  return NextResponse.json({
    ok: true,
    config,
    storageMode: toBffPgStorageMode(platformCoreB2bMessageTemplatesStorageMode()),
  });
}

/** DELETE /api/platform-core/b2b-message-templates?id=… — remove custom template. */
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const ownerKey = url.searchParams.get('ownerKey')?.trim() || DEFAULT_OWNER;
  const id = url.searchParams.get('id')?.trim() ?? '';
  if (!id) {
    return NextResponse.json({ ok: false, messageRu: 'Не указан id' }, { status: 400 });
  }
  const config = await deletePlatformCoreB2bMessageTemplateServer({ ownerKey, id });
  return NextResponse.json({
    ok: true,
    config,
    storageMode: toBffPgStorageMode(platformCoreB2bMessageTemplatesStorageMode()),
  });
}
