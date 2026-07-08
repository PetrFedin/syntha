'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Workshop2DossierPersistButton } from '@/components/brand/production/Workshop2DossierPersistButton';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  patchWorkshop2ChangeRequestDecision,
  postWorkshop2ChangeRequest,
} from '@/lib/production/workshop2-api-client';
import {
  applyWorkshop2ChangeRequestDecision,
  isWorkshop2ChangeRequestPending,
} from '@/lib/production/workshop2-change-request-workflow';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { persistWorkshop2ChangeRequestMirrorToDossier } from '@/lib/production/workshop2-change-request-dossier-persist';
import { putWorkshop2Wave25DossierPatch } from '@/lib/production/workshop2-wave25-persist-client';
import { summarizeWorkshop2ChangeRequestPgMirror } from '@/lib/production/workshop2-operational-pg-mirror-status';
import { Workshop2OperationalPgMirrorChip } from '@/components/brand/production/workshop2-operational-panel-chrome';
import {
  formatWorkshop2PersistToastDescription,
  formatWorkshop2PersistToastTitle,
} from '@/lib/production/workshop2-persist-toast-messages';

type Props = {
  collectionId: string;
  articleId: string;
  dossier: Workshop2DossierPhase1;
  setDossier: React.Dispatch<React.SetStateAction<Workshop2DossierPhase1>>;
  tzWriteDisabled?: boolean;
  actorLabel?: string;
  /** При true — PATCH на сервер после локального merge. */
  persistToServer?: boolean;
};

export function Workshop2ChangeRequestsPanel({
  collectionId,
  articleId,
  dossier,
  setDossier,
  tzWriteDisabled,
  actorLabel = 'Текущий пользователь',
  persistToServer = true,
}: Props) {
  const { toast } = useToast();
  const crs = dossier.changeRequests || [];
  const [busyId, setBusyId] = useState<string | null>(null);
  const [crMirrorBusy, setCrMirrorBusy] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [targetNode, setTargetNode] = useState('Material');

  const crPgMirror = useMemo(() => summarizeWorkshop2ChangeRequestPgMirror(dossier), [dossier]);

  const normalizePriority = (
    raw: 'Low' | 'Medium' | 'High'
  ): NonNullable<Workshop2DossierPhase1['changeRequests']>[number]['priority'] =>
    raw === 'High' ? 'high' : raw === 'Low' ? 'low' : 'medium';

  const handleCreateCr = async () => {
    if (!description.trim()) return;

    if (persistToServer) {
      const res = await postWorkshop2ChangeRequest({
        collectionId,
        articleId,
        description: description.trim(),
        priority,
        targetNode,
        requestedBy: actorLabel,
      });
      if (!res.ok) {
        toast({
          title: 'CR не создан',
          description: res.reason,
          variant: 'destructive',
        });
        return;
      }
      setDossier((prev) =>
        persistWorkshop2ChangeRequestMirrorToDossier({
          ...prev,
          changeRequests: [...(prev.changeRequests || []), res.changeRequest],
        })
      );
      toast({
        title: 'CR создан',
        description: persistToServer
          ? 'API ok · mirror в UI — «CR → PG» подтверждает запись в досье.'
          : 'Локально — без PG journal.',
      });
    } else {
      setDossier((prev) => ({
        ...prev,
        changeRequests: [
          ...(prev.changeRequests || []),
          {
            id: crypto.randomUUID(),
            description,
            priority: normalizePriority(priority),
            targetNode,
            status: 'pending',
            requestedBy: actorLabel,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    }

    setIsOpen(false);
    setDescription('');
    setPriority('Medium');
    setTargetNode('Material');
  };

  const applyDecision = async (crId: string, decision: 'approved' | 'rejected') => {
    setBusyId(crId);
    try {
      if (persistToServer) {
        const res = await patchWorkshop2ChangeRequestDecision({
          collectionId,
          articleId,
          changeRequestId: crId,
          decision,
          decidedBy: actorLabel,
        });
        if (!res.ok) {
          toast({
            title: 'CR не сохранён',
            description:
              res.reason === 'version_conflict'
                ? 'Конфликт версии досье — обновите страницу.'
                : res.reason,
            variant: 'destructive',
          });
          return;
        }
        setDossier((prev) => {
          const applied = applyWorkshop2ChangeRequestDecision({
            dossier: prev,
            changeRequestId: crId,
            decision,
            decidedBy: actorLabel,
          });
          return applied?.dossier ?? prev;
        });
      } else {
        setDossier((prev) => {
          const applied = applyWorkshop2ChangeRequestDecision({
            dossier: prev,
            changeRequestId: crId,
            decision,
            decidedBy: actorLabel,
          });
          return applied?.dossier ?? prev;
        });
      }
      toast({
        title: decision === 'approved' ? 'CR одобрен' : 'CR отклонён',
        description: 'Решение записано в досье и журнал ТЗ.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const persistCrMirror = async () => {
    setCrMirrorBusy(true);
    try {
      const res = await putWorkshop2Wave25DossierPatch({
        collectionId,
        articleId,
        base: dossier,
        apply: persistWorkshop2ChangeRequestMirrorToDossier,
        field: 'change_request_mirror',
        updatedByLabel: actorLabel,
      });
      if (res.ok) setDossier(res.dossier);
      toast({
        title: formatWorkshop2PersistToastTitle({ scopeLabelRu: 'CR mirror', ok: res.ok }),
        description: res.ok
          ? formatWorkshop2PersistToastDescription({
              mirrorField: 'changeRequestMirror',
              ok: true,
            })
          : `Mirror fail-closed — ${res.reason ?? 'offline'}`,
        variant: res.ok ? 'default' : 'destructive',
      });
    } finally {
      setCrMirrorBusy(false);
    }
  };

  return (
    <div className="border-border-subtle bg-bg-surface space-y-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-text-primary text-sm font-semibold">Запросы на изменение (CR)</h3>
        <div className="flex flex-wrap gap-2">
          <span data-testid="workshop2-cr-pg-chip">
            <Workshop2OperationalPgMirrorChip {...crPgMirror} />
          </span>
          <Workshop2DossierPersistButton
            busy={crMirrorBusy}
            className="h-7 text-[10px]"
            title="changeRequestMirror → PG"
            onClick={() => void persistCrMirror()}
          />
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="secondary" disabled={tzWriteDisabled}>
                Создать CR
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый запрос на изменение</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Описание</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Что нужно изменить?"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Приоритет</label>
                  <Select
                    value={priority}
                    onValueChange={(v: 'Low' | 'Medium' | 'High') => setPriority(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите приоритет" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low (Низкий)</SelectItem>
                      <SelectItem value="Medium">Medium (Средний)</SelectItem>
                      <SelectItem value="High">High (Высокий)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">
                    Узел (Target Node)
                  </label>
                  <Select value={targetNode} onValueChange={setTargetNode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите узел" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Material">Material (Материалы)</SelectItem>
                      <SelectItem value="Construction">Construction (Конструкция)</SelectItem>
                      <SelectItem value="Visual">Visual (Визуал)</SelectItem>
                      <SelectItem value="Measurements">Measurements (Измерения)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setIsOpen(false)}>
                  Отмена
                </Button>
                <Button
                  onClick={() => void handleCreateCr()}
                  disabled={!description.trim() || tzWriteDisabled}
                >
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {crs.length === 0 ? (
        <p className="text-text-muted text-xs">Нет активных запросов на изменение.</p>
      ) : (
        <div className="space-y-2">
          {crs.map((cr) => {
            const pending = isWorkshop2ChangeRequestPending(cr.status);
            return (
              <div
                key={cr.id}
                className="border-border-default flex flex-col gap-2 rounded-lg border p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-text-primary font-medium">{cr.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {cr.priority ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          cr.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : cr.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {cr.priority}
                      </span>
                    ) : null}
                    {cr.targetNode ? (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-800">
                        {cr.targetNode}
                      </span>
                    ) : null}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        cr.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cr.status === 'rejected'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cr.status}
                    </span>
                  </div>
                  <p className="text-text-muted">
                    От: {cr.requestedBy}
                    {cr.decidedBy ? ` · Решение: ${cr.decidedBy}` : ''}
                    {cr.createdAt ? ` · ${new Date(cr.createdAt).toLocaleString('ru-RU')}` : ''}
                  </p>
                </div>
                {pending && !tzWriteDisabled ? (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px]"
                      disabled={busyId === cr.id}
                      onClick={() => void applyDecision(cr.id, 'rejected')}
                    >
                      Отклонить
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 text-[10px]"
                      disabled={busyId === cr.id}
                      onClick={() => void applyDecision(cr.id, 'approved')}
                    >
                      Одобрить
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
