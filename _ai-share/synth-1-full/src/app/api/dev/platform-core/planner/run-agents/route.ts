import { NextResponse } from 'next/server';
import { buildPlatformCorePlanner } from '@/lib/platform-core-planner';
import { buildAgentDispatchPrompt } from '@/lib/server/platform-core-planner-analyze.server';
import {
  loadCursorApiKeyFromEnvFiles,
  monorepoRootFromCwd,
  openCursorIde,
  plannerAgentRunnerInstalled,
  readSessionMeta,
  spawnPlannerCursorAgent,
  startPlannerAgentSession,
} from '@/lib/server/platform-core-planner-agent-session.server';
import {
  isDevPlannerApiEnabled,
  patchPlannerTaskStatus,
  readPlannerRuntimeState,
  runtimeToOverlay,
  setPlannerAgentDispatch,
} from '@/lib/server/platform-core-planner-runtime.server';
import {
  isRemotePlannerClient,
  plannerAgentRuntimeMode,
} from '@/lib/server/planner-remote-client.server';

function pickNextOpen(snapshot: ReturnType<typeof buildPlatformCorePlanner>) {
  return snapshot.queue.find((t) => t.status === 'open' || t.status === 'in_progress') ?? null;
}

function findPlannerTarget(snapshot: ReturnType<typeof buildPlatformCorePlanner>, id?: string) {
  if (id) {
    return snapshot.queue.find(
      (t) => t.id === id && (t.status === 'open' || t.status === 'in_progress')
    );
  }
  return pickNextOpen(snapshot);
}

export async function POST(request: Request) {
  if (!isDevPlannerApiEnabled()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  await loadCursorApiKeyFromEnvFiles();

  const body = (await request.json().catch(() => ({}))) as {
    by?: string;
    collection?: string;
    id?: string;
  };
  const by = body.by?.trim() || 'ui-agent';
  const collectionId = body.collection ?? 'SS27';

  const runtime = await readPlannerRuntimeState();
  const snapshot = buildPlatformCorePlanner(collectionId, runtimeToOverlay(runtime));

  const target = findPlannerTarget(snapshot, body.id);

  if (!target) {
    return NextResponse.json(
      { ok: false, reason: 'no_open_tasks', message: 'Нет открытых задач в очереди' },
      { status: 404 }
    );
  }

  await patchPlannerTaskStatus(target.id, 'in_progress', by);
  const prompt = buildAgentDispatchPrompt({
    id: target.id,
    title: target.title,
    priority: target.priority,
    source: target.source,
    href: target.href,
    pillarId: target.pillarId,
    roleId: target.roleId,
  });

  const { sessionId, promptPath } = await startPlannerAgentSession({
    taskId: target.id,
    taskTitle: target.title,
    priority: target.priority,
    source: target.source,
    href: target.href,
    by,
  });

  const dispatch = {
    taskId: target.id,
    taskTitle: target.title,
    priority: target.priority,
    by,
    startedAt: new Date().toISOString(),
    prompt,
    sessionId,
  };
  await setPlannerAgentDispatch(dispatch);

  const runnerOk = await plannerAgentRunnerInstalled();
  const hasKey = Boolean(process.env.CURSOR_API_KEY?.trim());
  let spawnError: string | null = null;
  let pid = 0;

  const remoteClient = isRemotePlannerClient(request);
  const runtimeMode = plannerAgentRuntimeMode(request);

  if (!runnerOk) {
    spawnError = 'Установите runner: npm run planner:agent:install (из корня Projects)';
  } else if (!hasKey) {
    spawnError =
      'Задайте CURSOR_API_KEY в .env.local (cursor.com/dashboard/integrations) — без ключа агент не стартует';
  } else {
    try {
      pid = await spawnPlannerCursorAgent(sessionId, promptPath, { runtime: runtimeMode });
      if (!remoteClient) {
        void openCursorIde(monorepoRootFromCwd());
      }
    } catch (e) {
      spawnError = e instanceof Error ? e.message : 'spawn failed';
    }
  }

  const runtimeAfter = await readPlannerRuntimeState();
  const refreshed = buildPlatformCorePlanner(collectionId, runtimeToOverlay(runtimeAfter));
  const task = refreshed.queue.find((t) => t.id === target.id) ?? target;
  const meta = await readSessionMeta(sessionId);

  return NextResponse.json({
    ok: true,
    task,
    dispatch,
    sessionId,
    session: {
      id: sessionId,
      status: meta?.status ?? (spawnError ? 'error' : 'running'),
      pollUrl: `/api/dev/platform-core/planner/session/${sessionId}`,
    },
    spawn: { pid, runnerOk, hasKey, error: spawnError, runtimeMode, remoteClient },
    message: spawnError
      ? `Чат открыт, но агент не запущен: ${spawnError}`
      : remoteClient
        ? `Агент на сервере (${runtimeMode}) — «${target.title.slice(0, 80)}». iPhone: dev:core на Mac + CURSOR_API_KEY.`
        : `Агент работает над «${target.title.slice(0, 80)}» — смотрите чат`,
    openChat: true,
  });
}
