import { NextResponse } from 'next/server';
import { buildPlatformCorePlanner } from '@/lib/platform-core-planner';
import {
  analyzeProjectForPlanner,
  buildPlannerScanPrompt,
  exportReadinessMatrixBrief,
} from '@/lib/server/platform-core-planner-analyze.server';
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
  appendPlannerDiscoveredItems,
  isDevPlannerApiEnabled,
  readPlannerRuntimeState,
  runtimeToOverlay,
  setPlannerAgentDispatch,
} from '@/lib/server/platform-core-planner-runtime.server';

export async function POST(request: Request) {
  if (!isDevPlannerApiEnabled()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  await loadCursorApiKeyFromEnvFiles();

  const body = (await request.json().catch(() => ({}))) as {
    collection?: string;
    useAgent?: boolean;
  };
  const collectionId = body.collection ?? 'SS27';
  const useAgent = body.useAgent !== false;
  const runtime = await readPlannerRuntimeState();

  const analysis = await analyzeProjectForPlanner(collectionId, runtime);
  const localTotal = analysis.development.length + analysis.techDebt.length;

  if (localTotal > 0) {
    await appendPlannerDiscoveredItems({
      development: analysis.development,
      techDebt: analysis.techDebt,
    });
  }

  let sessionId: string | undefined;
  let spawnError: string | null = null;
  let runnerOk = false;
  let hasKey = false;

  if (useAgent) {
    sessionId = `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const matrix = exportReadinessMatrixBrief(collectionId);
    const promptText = buildPlannerScanPrompt({
      sessionId,
      collectionId,
      matrix,
      localAdded: localTotal,
    });

    const { promptPath } = await startPlannerAgentSession({
      sessionId,
      taskId: 'scan-project',
      taskTitle: 'Сканирование проекта (роли × столпы × разделы)',
      priority: 'P1',
      source: 'planner-analyze',
      by: 'ui-scan',
      promptText,
    });

    await setPlannerAgentDispatch({
      taskId: 'scan-project',
      taskTitle: 'Сканирование проекта',
      priority: 'P1',
      by: 'ui-scan',
      startedAt: new Date().toISOString(),
      prompt: promptText.slice(0, 500),
      sessionId,
    });

    runnerOk = await plannerAgentRunnerInstalled();
    hasKey = Boolean(process.env.CURSOR_API_KEY?.trim());

    if (!runnerOk) {
      spawnError = 'npm run planner:agent:install (корень Projects)';
    } else if (!hasKey) {
      spawnError = 'CURSOR_API_KEY в _ai-share/synth-1-full/.env.local';
    } else {
      try {
        await spawnPlannerCursorAgent(sessionId, promptPath);
        void openCursorIde(monorepoRootFromCwd());
      } catch (e) {
        spawnError = e instanceof Error ? e.message : 'spawn failed';
      }
    }
  }

  const runtimeAfter = await readPlannerRuntimeState();
  const snapshot = buildPlatformCorePlanner(collectionId, runtimeToOverlay(runtimeAfter));
  const meta = sessionId ? await readSessionMeta(sessionId) : null;

  const parts: string[] = [];
  if (localTotal > 0) {
    parts.push(
      `Локальный аудит: +${localTotal} (развитие ${analysis.development.length}, техдолг ${analysis.techDebt.length})`
    );
  } else {
    parts.push('Локальный аудит: новых пунктов нет');
  }
  if (useAgent) {
    parts.push(
      spawnError
        ? `Cursor-скан не запущен: ${spawnError}`
        : 'Cursor-агент сканирует репо — смотрите чат'
    );
  }

  return NextResponse.json({
    ok: true,
    added: {
      development: analysis.development.length,
      techDebt: analysis.techDebt.length,
      total: localTotal,
    },
    skippedDuplicates: analysis.skippedDuplicates,
    items:
      localTotal > 0
        ? { development: analysis.development, techDebt: analysis.techDebt }
        : undefined,
    counts: snapshot.counts,
    scan: useAgent
      ? {
          sessionId,
          pollUrl: sessionId ? `/api/dev/platform-core/planner/session/${sessionId}` : undefined,
          status: meta?.status ?? (spawnError ? 'error' : 'running'),
          spawn: { runnerOk, hasKey, error: spawnError },
        }
      : undefined,
    sessionId,
    openChat: Boolean(sessionId),
    message: parts.join(' · '),
  });
}
