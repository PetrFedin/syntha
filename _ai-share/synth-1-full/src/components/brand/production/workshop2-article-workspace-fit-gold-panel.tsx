'use client';
import { formatWorkshop2PersistToastTitle } from '@/lib/production/workshop2-persist-toast-messages';
import { evaluateWorkshop2FitGoldApprovalGate } from '@/lib/production/workshop2-fit-gold-approval-gate';
import { Workshop2GateChecksBlock } from '@/components/brand/production/Workshop2GateChecksBlock';
import { Workshop2ArticleSamplePanel } from '@/components/brand/production/Workshop2ArticleSamplePanel';
import { summarizeWorkshop2FloorMesChip } from '@/lib/production/workshop2-floor-mes';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useArticleWorkspace } from '@/components/brand/production/article-workspace-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Fit3DViewer = dynamic(
  () =>
    import('@/components/brand/production/fit-3d-viewer').then((m) => ({
      default: m.Fit3DViewer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="text-text-secondary flex min-h-[200px] items-center justify-center text-xs">
        Загрузка 3D…
      </div>
    ),
  }
);
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { PanelShell } from '@/components/brand/production/workshop2-article-workspace-tab-panels-shell';
import { newW2ArticleTabPanelRowId as newRowId } from '@/components/brand/production/workshop2-article-workspace-tab-panels-shared';
import type { FitSession, FitGoldSnapshot } from '@/lib/production/article-workspace/types';

function FitSessionCard({
  session,
  idx,
  fg,
  mergeBundle,
  toast,
  createdByLabel,
}: {
  session: FitSession;
  idx: number;
  fg: FitGoldSnapshot;
  mergeBundle: (patch: any) => void;
  toast: any;
  createdByLabel?: string;
}) {
  const [isAddingDelta, setIsAddingDelta] = useState(false);
  const [deltaName, setDeltaName] = useState('');
  const [deltaVal, setDeltaVal] = useState('');

  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentAnchor, setCommentAnchor] = useState('');
  const [commentText, setCommentText] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeFit = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/brand/workshop2/fit-sessions/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Mock photo URL for now since we don't have real photos in FitSession yet
          photoUrls: [
            'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAGBAQABPxA=',
          ],
        }),
      });

      if (!res.ok) throw new Error('Failed to analyze fit');

      const data = (await res.json()) as { aiFitAnalysis?: FitSession['aiFitAnalysis'] };
      if (data.aiFitAnalysis) {
        void mergeBundle({
          fitGold: {
            ...fg,
            sessions: fg.sessions?.map((s) =>
              s.id === session.id
                ? {
                    ...s,
                    aiFitAnalysis: data.aiFitAnalysis,
                  }
                : s
            ),
          },
        });
        toast({
          title: 'Анализ завершен',
          description: 'AI успешно проанализировал посадку.',
          className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        });
      }
    } catch (error) {
      console.warn(error);
      toast({
        title: 'Ошибка анализа',
        description: 'Не удалось выполнить AI анализ посадки.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddDelta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deltaName || !deltaVal || isNaN(Number(deltaVal))) return;
    void mergeBundle({
      fitGold: {
        ...fg,
        sessions: fg.sessions?.map((s) =>
          s.id === session.id
            ? {
                ...s,
                measurementsDelta: { ...s.measurementsDelta, [deltaName]: Number(deltaVal) },
              }
            : s
        ),
      },
    });
    setIsAddingDelta(false);
    setDeltaName('');
    setDeltaVal('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAnchor || !commentText) return;
    void mergeBundle({
      fitGold: {
        ...fg,
        sessions: fg.sessions?.map((s) =>
          s.id === session.id
            ? {
                ...s,
                comments: [
                  ...s.comments,
                  {
                    id: newRowId(),
                    targetAnchor: commentAnchor,
                    text: commentText,
                    photoUrls: [],
                    by: createdByLabel || 'Конструктор',
                    at: new Date().toISOString(),
                  },
                ],
              }
            : s
        ),
      },
    });
    setIsAddingComment(false);
    setCommentAnchor('');
    setCommentText('');
  };

  const handleStatusChange = () => {
    const statuses = ['pending', 'approved', 'rework', 'approved_with_comments'];
    const nextStatus = statuses[(statuses.indexOf(session.status) + 1) % statuses.length]!;
    void mergeBundle({
      fitGold: {
        ...fg,
        sessions: fg.sessions?.map((s) => (s.id === session.id ? { ...s, status: nextStatus } : s)),
      },
    });
  };

  const handleTypeChange = () => {
    const types = ['proto', 'sms', 'pps', 'top'];
    const nextType = types[(types.indexOf(session.sampleType) + 1) % types.length]!;
    void mergeBundle({
      fitGold: {
        ...fg,
        sessions: fg.sessions?.map((s) =>
          s.id === session.id ? { ...s, sampleType: nextType } : s
        ),
      },
    });
  };

  const hasDeltas = Object.keys(session.measurementsDelta).length > 0;
  const isApplied = fg.baseSpecUpdatedFromDeltasAt != null;

  return (
    <div className="border-border-default rounded-xl border bg-white p-4 shadow-sm">
      <div className="border-border-subtle mb-4 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-bg-surface2 text-text-primary text-[10px] font-bold tracking-wide"
          >
            {session.sampleType}
          </Badge>
          <span className="text-text-primary text-[12px] font-semibold">Сессия #{idx + 1}</span>
          <span className="text-text-muted text-[11px]">{session.dateStr}</span>
          {session.cadVersionId && (
            <Badge
              variant="outline"
              className="ml-2 border-blue-200 bg-blue-50 text-[10px] text-blue-700"
            >
              <LucideIcons.FileCode2 className="mr-1 h-3 w-3" />
              CAD: {session.cadVersionId}
            </Badge>
          )}
        </div>
        <Badge
          variant="outline"
          className={
            session.status === 'approved'
              ? 'border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700'
              : session.status === 'rework'
                ? 'border-rose-200 bg-rose-50 text-[10px] text-rose-700'
                : session.status === 'approved_with_comments'
                  ? 'border-blue-200 bg-blue-50 text-[10px] text-blue-700'
                  : 'border-amber-200 bg-amber-50 text-[10px] text-amber-700'
          }
        >
          {session.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="bg-bg-surface2 border-border-subtle rounded-lg border p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-text-primary text-[11px] font-semibold tracking-wider">
              Отклонения мерок
            </p>
          </div>
          {!hasDeltas ? (
            <p className="text-text-secondary mb-2 text-[11px]">Отклонений не зафиксировано.</p>
          ) : (
            <ul className="mb-3 space-y-1.5">
              {Object.entries(session.measurementsDelta).map(([k, v]) => (
                <li
                  key={k}
                  className="border-border-subtle flex items-center justify-between rounded-md border bg-white px-2 py-1.5 text-[11px]"
                >
                  <span className="text-text-primary font-medium">{k}</span>
                  <span
                    className={
                      v > 0
                        ? 'font-mono font-medium text-rose-600'
                        : v < 0
                          ? 'font-mono font-medium text-emerald-600'
                          : 'text-text-secondary font-mono'
                    }
                  >
                    {v > 0 ? `+${v}` : v} см
                  </span>
                </li>
              ))}
            </ul>
          )}

          {isAddingDelta ? (
            <form
              onSubmit={handleAddDelta}
              className="border-border-subtle mt-2 flex items-center gap-1.5 rounded-md border bg-white p-1.5"
            >
              <Input
                className="h-7 w-full px-2 text-[11px]"
                placeholder="Мерка (chest)"
                value={deltaName}
                onChange={(e) => setDeltaName(e.target.value)}
                autoFocus
              />
              <Input
                className="h-7 w-16 px-2 text-[11px]"
                placeholder="± см"
                value={deltaVal}
                onChange={(e) => setDeltaVal(e.target.value)}
              />
              <div className="flex gap-1">
                <Button type="submit" size="sm" variant="default" className="h-7 px-2 text-[10px]">
                  ОК
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[10px]"
                  onClick={() => setIsAddingDelta(false)}
                >
                  ✕
                </Button>
              </div>
            </form>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-accent-primary hover:bg-accent-soft h-7 w-full border-dashed bg-white text-[10px]"
              onClick={() => setIsAddingDelta(true)}
            >
              <LucideIcons.Plus className="mr-1 h-3 w-3" /> Добавить дельту
            </Button>
          )}
        </div>

        <div className="bg-bg-surface2 border-border-subtle rounded-lg border p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-text-primary text-[11px] font-semibold tracking-wider">
              Замечания к посадке
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 border-purple-200 bg-purple-50 text-[10px] text-purple-700 hover:bg-purple-100"
              onClick={handleAnalyzeFit}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <LucideIcons.Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <LucideIcons.Sparkles className="mr-1 h-3 w-3" />
              )}
              Авто-анализ (AI)
            </Button>
          </div>

          {session.aiFitAnalysis && (
            <div className="mb-3 rounded-md border border-purple-100 bg-purple-50 p-2.5">
              <div className="mb-2 flex items-center gap-1.5">
                <LucideIcons.Sparkles className="h-3.5 w-3.5 text-purple-600" />
                <span className="text-[11px] font-semibold text-purple-900">AI Анализ посадки</span>
              </div>

              {session.aiFitAnalysis.wrinklesDetected &&
                session.aiFitAnalysis.wrinklesDetected.length > 0 && (
                  <div className="mb-2">
                    <span className="mb-1 block text-[10px] font-medium text-purple-800">
                      Обнаруженные заломы:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {session.aiFitAnalysis.wrinklesDetected.map((wrinkle, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="border-purple-200 bg-white text-[9px] text-purple-700"
                        >
                          {wrinkle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {session.aiFitAnalysis.recommendations &&
                session.aiFitAnalysis.recommendations.length > 0 && (
                  <div>
                    <span className="mb-1 block text-[10px] font-medium text-purple-800">
                      Рекомендации конструктору:
                    </span>
                    <ul className="list-disc space-y-0.5 pl-3">
                      {session.aiFitAnalysis.recommendations.map((rec, i) => (
                        <li key={i} className="text-[10px] text-purple-800">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {session.comments.length === 0 ? (
            <p className="text-text-secondary mb-2 text-[11px]">Замечаний нет.</p>
          ) : (
            <ul className="mb-3 space-y-2">
              {session.comments.map((c) => (
                <li
                  key={c.id}
                  className="border-border-subtle rounded-md border bg-white p-2.5 text-[11px]"
                >
                  <div className="text-text-primary mb-1 font-semibold">{c.targetAnchor}</div>
                  <p className="text-text-secondary leading-relaxed">{c.text}</p>
                  <div className="text-text-muted mt-2 flex items-center justify-between text-[9px] font-medium">
                    <span>{c.by || 'Бренд'}</span>
                    <span>{c.at?.split('T')[0]}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {isAddingComment ? (
            <form
              onSubmit={handleAddComment}
              className="border-border-subtle mt-2 flex flex-col gap-1.5 rounded-md border bg-white p-1.5"
            >
              <Input
                className="h-7 px-2 text-[11px]"
                placeholder="Привязка (например, Плечо)"
                value={commentAnchor}
                onChange={(e) => setCommentAnchor(e.target.value)}
                autoFocus
              />
              <Input
                className="h-7 px-2 text-[11px]"
                placeholder="Комментарий (увеличить посадку)"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="mt-1 flex justify-end gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[10px]"
                  onClick={() => setIsAddingComment(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" size="sm" variant="default" className="h-7 px-3 text-[10px]">
                  Сохранить
                </Button>
              </div>
            </form>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-accent-primary hover:bg-accent-soft h-7 w-full border-dashed bg-white text-[10px]"
              onClick={() => setIsAddingComment(true)}
            >
              <LucideIcons.Plus className="mr-1 h-3 w-3" /> Добавить комментарий
            </Button>
          )}
        </div>
      </div>

      <div className="border-border-subtle mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-bg-surface2 h-8 text-[11px]"
          onClick={handleStatusChange}
        >
          <LucideIcons.RefreshCcw className="text-text-muted mr-1.5 h-3 w-3" />
          Сменить статус
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-bg-surface2 h-8 text-[11px]"
          onClick={handleTypeChange}
        >
          <LucideIcons.Tag className="text-text-muted mr-1.5 h-3 w-3" />
          Сменить тип
        </Button>

        {session.cadVersionId && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 border-blue-200 bg-blue-50 text-[11px] text-blue-700 hover:bg-blue-100"
              >
                <LucideIcons.Box className="mr-1.5 h-3 w-3" />
                Посмотреть 3D
              </Button>
            </DialogTrigger>
            <DialogContent className="flex h-[80vh] w-full max-w-4xl flex-col">
              <DialogHeader>
                <DialogTitle>3D Примерка — Сессия #{idx + 1}</DialogTitle>
              </DialogHeader>
              <div className="border-border-subtle min-h-0 flex-1 overflow-hidden rounded-md border bg-slate-50">
                <Fit3DViewer modelUrl="/models/placeholder.glb" />
              </div>
            </DialogContent>
          </Dialog>
        )}

        {session.status === 'approved' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant={isApplied ? 'outline' : 'default'}
                size="sm"
                disabled={!hasDeltas || isApplied}
                className={`ml-auto h-8 text-[11px] ${isApplied ? 'border-emerald-200 bg-emerald-50 text-emerald-700 opacity-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
              >
                {isApplied ? (
                  <>
                    <LucideIcons.CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Дельты применены к ТЗ
                  </>
                ) : (
                  <>Применить дельты к базовой спецификации ТЗ</>
                )}
              </Button>
            </AlertDialogTrigger>
            {!isApplied && hasDeltas && (
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Применить изменения к спецификации?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="mt-2 space-y-4">
                      <p>
                        Внимание: это действие обновит базовую Таблицу измерений в утвержденном ТЗ
                        на основе фактических отклонений этого сэмпла ({session.sampleType}).
                      </p>
                      <div className="bg-bg-surface2 border-border-subtle rounded-md border p-3">
                        <p className="text-text-primary mb-2 text-[12px] font-semibold">
                          Будут применены следующие дельты:
                        </p>
                        <ul className="space-y-1">
                          {Object.entries(session.measurementsDelta).map(([k, v]) => (
                            <li key={k} className="flex justify-between text-[12px]">
                              <span className="text-text-secondary">{k}</span>
                              <span className="text-text-primary font-mono font-medium">
                                {v > 0 ? `+${v}` : v} см
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      void mergeBundle({
                        fitGold: {
                          ...fg,
                          baseSpecUpdatedFromDeltasAt: new Date().toISOString(),
                        },
                      });
                      toast({
                        title: 'Спецификация обновлена',
                        description: 'Таблица мерок артикула обновлена с учетом дельт примерки.',
                        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                      });
                    }}
                  >
                    Применить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            )}
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

export function Workshop2ArticleFitGoldPanel({
  dossier = null,
  createdByLabel,
  categoryLeafId,
  articleUrlSegment,
}: {
  dossier?: Workshop2DossierPhase1 | null;
  createdByLabel?: string;
  categoryLeafId?: string;
  articleUrlSegment?: string;
} = {}) {
  const { bundle, loading, mergeBundle, dataMode, ref, setDossier } = useArticleWorkspace();
  const { toast } = useToast();
  const [newSessionCadVersion, setNewSessionCadVersion] = useState<string>('');

  if (loading || !bundle) return <p className="text-text-secondary text-[12px]">Загрузка…</p>;
  const fg = bundle.fitGold!;
  const sessions = fg.sessions ?? [];

  return (
    <div className="space-y-4">
      {dossier && categoryLeafId && articleUrlSegment ? (
        <Workshop2ArticleSamplePanel
          dossier={dossier}
          collectionId={ref.collectionId}
          categoryLeafId={categoryLeafId}
          articleUrlSegment={articleUrlSegment}
          onDossierPatch={(patch) => setDossier((prev) => (prev ? { ...prev, ...patch } : prev))}
        />
      ) : null}
      <div className="border-border-default rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="bg-accent-primary/10 text-accent-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <LucideIcons.Scissors className="h-4 w-4 shrink-0" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-text-primary text-base font-semibold">
                  Эталон и посадка (Fit)
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  Ответственный: Конструктор
                </span>
              </div>
              <p className="text-text-secondary text-xs leading-snug">
                Сессии примерки образцов, фиксация дельт по меркам и комментарии. Когда посадка
                утверждена, дельты переносятся в базовый табель мер.
              </p>
            </div>
          </div>
          <span
            className="border-border-default bg-bg-surface2 text-text-secondary shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px]"
            title={dataMode === 'http' ? 'Данные с API' : 'Локальные данные в браузере'}
          >
            {dataMode === 'http' ? 'API' : 'local'}
          </span>
        </div>

        <div className="border-border-subtle mt-4 flex flex-col gap-1.5 border-t border-dotted pt-2.5">
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-bg-surface2/70 text-text-primary border-border-subtle max-w-full rounded border px-2 py-1 text-[10px] leading-snug">
              <span className="text-text-muted font-bold">Суть</span> · Примерок (сессий):{' '}
              {sessions.length}
            </span>
            <span className="text-text-primary border-border-subtle max-w-full rounded border bg-white px-2 py-1 text-[10px] font-semibold leading-snug">
              <span className="text-text-muted font-bold">Гот.</span> ·{' '}
              {fg.goldApproved
                ? 'Сэмпл принят в коллекцию'
                : sessions.length === 0
                  ? 'Нет сессий'
                  : sessions.some((s) => s.status.includes('approved'))
                    ? 'Эталон утвержден'
                    : 'Идет примерка'}
            </span>
            <span className="text-accent-primary border-accent-primary/25 bg-accent-primary/8 max-w-full rounded border px-2 py-1 text-[10px] font-semibold leading-snug">
              <span className="font-bold opacity-80">Далее</span> ·{' '}
              {fg.goldApproved
                ? 'Переходите к плану PO и запуску.'
                : 'Создайте сессию примерки, внесите дельты.'}
            </span>
          </div>
        </div>

        <div className="mt-4 min-w-0 space-y-4">
          <div className="border-border-subtle mb-4 flex flex-wrap items-center gap-3 border-b pb-4">
            {fg.virtualFitScore != null ? (
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-[10px] font-bold tracking-wider">
                  Оценка виртуальной примерки:
                </span>
                <Badge className="h-5 border-emerald-100 bg-emerald-50 text-[10px] text-emerald-700">
                  {fg.virtualFitScore}%
                </Badge>
              </div>
            ) : (
              <p className="text-text-secondary text-[11px]">
                Оценка виртуальной примерки ещё не рассчитана.
              </p>
            )}
            {fg.baseSpecUpdatedFromDeltasAt && (
              <div className="ml-auto flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                <LucideIcons.CheckCircle2 className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium">
                  Базовая спецификация синхронизирована
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <p className="text-text-primary flex items-center gap-1.5 text-sm font-semibold">
                <LucideIcons.Ruler className="h-4 w-4 text-slate-400" />
                История примерок
              </p>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="ID лекал (CAD)"
                  value={newSessionCadVersion}
                  onChange={(e) => setNewSessionCadVersion(e.target.value)}
                  className="h-8 w-32 text-[11px]"
                />
                {dossier?.sampleBasePerSizeDimensions ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 border-indigo-200 text-[11px] text-indigo-600 hover:bg-indigo-50"
                    onClick={() => {
                      const baseDims = dossier.sampleBasePerSizeDimensions;
                      const keys = new Set<string>();
                      if (baseDims) {
                        for (const row of Object.values(baseDims)) {
                          if (row) {
                            for (const k of Object.keys(row)) {
                              if (String(row[k] ?? '').trim() !== '') keys.add(k);
                            }
                          }
                        }
                      }
                      const initialDeltas: Record<string, number> = {};
                      for (const k of keys) initialDeltas[k] = 0;

                      void mergeBundle({
                        fitGold: {
                          ...fg,
                          sessions: [
                            ...sessions,
                            {
                              id: newRowId(),
                              sampleType: 'proto',
                              status: 'pending',
                              dateStr: new Date().toISOString().split('T')[0]!,
                              measurementsDelta: initialDeltas,
                              comments: [],
                              cadVersionId: newSessionCadVersion || null,
                            },
                          ],
                        },
                      });
                      setNewSessionCadVersion('');
                      toast({
                        title: 'Сессия создана',
                        description: `Создана сессия с ${keys.size} базовыми мерками из ТЗ.`,
                      });
                    }}
                  >
                    <LucideIcons.Download className="h-3.5 w-3.5" /> Загрузить мерки ТЗ
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-[11px]"
                  onClick={() => {
                    void mergeBundle({
                      fitGold: {
                        ...fg,
                        sessions: [
                          ...sessions,
                          {
                            id: newRowId(),
                            sampleType: 'proto',
                            status: 'pending',
                            dateStr: new Date().toISOString().split('T')[0]!,
                            measurementsDelta: {},
                            comments: [],
                            cadVersionId: newSessionCadVersion || null,
                          },
                        ],
                      },
                    });
                    setNewSessionCadVersion('');
                  }}
                >
                  <LucideIcons.Plus className="h-3.5 w-3.5" /> Добавить примерку
                </Button>
                <Button
                  type="button"
                  variant={fg.goldApproved ? 'outline' : 'default'}
                  size="sm"
                  className={`h-8 gap-1.5 text-[11px] ${fg.goldApproved ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                  onClick={() => {
                    void mergeBundle({
                      fitGold: {
                        ...fg,
                        goldApproved: !fg.goldApproved,
                        approvedAt: !fg.goldApproved ? new Date().toISOString() : undefined,
                      },
                    });
                    toast({
                      title: !fg.goldApproved ? 'Сэмпл утверждён' : 'Утверждение снято',
                      description: !fg.goldApproved
                        ? 'Эталон принят в коллекцию.'
                        : 'Статус эталона сброшен.',
                      className: !fg.goldApproved
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : '',
                    });
                  }}
                >
                  {fg.goldApproved ? (
                    <>
                      <LucideIcons.CheckCircle2 className="h-3.5 w-3.5" /> Сэмпл утверждён
                    </>
                  ) : (
                    <>
                      <LucideIcons.Check className="h-3.5 w-3.5" /> Утвердить сэмпл
                    </>
                  )}
                </Button>
              </div>
            </div>

            {sessions.length === 0 ? (
              <p className="text-text-secondary text-[11px]">
                Сессий примерок пока нет — добавьте первую.
              </p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session, idx) => (
                  <FitSessionCard
                    key={session.id}
                    session={session}
                    idx={idx}
                    fg={fg}
                    mergeBundle={mergeBundle}
                    toast={toast}
                    createdByLabel={createdByLabel}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// workshop2-fit-gold-gate-checks

// floorChipLabelRu

void formatWorkshop2PersistToastTitle;
