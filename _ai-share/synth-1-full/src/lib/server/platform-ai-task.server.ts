import 'server-only';

import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix.types';

export type PlatformAiTaskContext = {
  pillar?: CoreHubPillarId;
  role?: CoreChainRoleId;
  section_id?: string;
  collectionId?: string;
  articleId?: string;
  orderId?: string;
  orders?: Array<Record<string, unknown>>;
};

export type PlatformAiTaskResult = {
  agent: string;
  task_type: string;
  code_changes?: string | null;
  next_step?: string | null;
  changes_proposed?: string[];
};

function fastApiBase(): string {
  return (
    process.env.SYNTHA_FASTAPI_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    'http://127.0.0.1:8000/api/v1'
  ).replace(/\/$/, '');
}

/** Dev Platform Core → FastAPI orchestrator (no JWT). */
export async function runPlatformAiTaskDev(
  task: string,
  context?: PlatformAiTaskContext
): Promise<{ ok: true; data: PlatformAiTaskResult } | { ok: false; error: string; status?: number }> {
  const url = `${fastApiBase()}/ai/task/dev`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ task, context: context ?? {} }),
      cache: 'no-store',
      signal: AbortSignal.timeout(120_000),
    });
    const json = (await res.json()) as {
      data?: PlatformAiTaskResult;
      detail?: string;
      message?: string;
    };
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: json.detail || json.message || `FastAPI ${res.status}`,
      };
    }
    const data = json.data;
    if (!data?.agent) {
      return { ok: false, error: 'empty agent response' };
    }
    return { ok: true, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'network error';
    return {
      ok: false,
      error: `${msg} — запустите FastAPI (uvicorn) на :8000`,
    };
  }
}
