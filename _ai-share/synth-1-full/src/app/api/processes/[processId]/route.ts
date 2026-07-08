/**
 * API процесса LIVE по ID (встроенный шаблон | шаблон из библиотеки | сохранённая схема в `.data/workflow-store.json`).
 */
import { NextResponse } from 'next/server';
import { readJsonBody } from '@/lib/http/read-json-body';
import { getLiveProcessDefinition } from '@/lib/live-process/process-definitions';
import { getTemplateById } from '@/lib/live-process/process-templates';
import {
  getStoredDefinitionAsync,
  upsertDefinitionAsync,
} from '@/lib/server/process-workflow-store';
import type { LiveProcessDefinition } from '@/lib/live-process/types';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ processId: string }> }
) {
  const { processId } = await params;

  try {
    const stored = await getStoredDefinitionAsync(processId);
    let process: LiveProcessDefinition | null = stored ?? null;
    if (!process) {
      process = getLiveProcessDefinition(processId);
    }
    if (!process) {
      process = getTemplateById(processId);
    }
    if (!process) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 });
    }
    return NextResponse.json(process);
  } catch (e) {
    console.error('GET /api/processes/[processId]:', e);
    return NextResponse.json({ error: 'Failed to fetch process' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ processId: string }> }
) {
  const { processId } = await params;

  try {
    const body = await readJsonBody<Partial<LiveProcessDefinition> & { id?: string }>(request);
    const existing =
      (await getStoredDefinitionAsync(processId)) ??
      getLiveProcessDefinition(processId) ??
      getTemplateById(processId);
    const merged: LiveProcessDefinition = {
      id: processId,
      name: body.name ?? existing?.name ?? processId,
      description: body.description ?? existing?.description ?? '',
      contextKey: body.contextKey ?? existing?.contextKey,
      stages: body.stages ?? existing?.stages ?? [],
      meta: { ...existing?.meta, ...body.meta },
      processLinks: body.processLinks ?? existing?.processLinks,
    };
    await upsertDefinitionAsync(merged);
    return NextResponse.json(merged);
  } catch (e) {
    console.error('PUT /api/processes/[processId]:', e);
    return NextResponse.json({ error: 'Failed to update process' }, { status: 500 });
  }
}
