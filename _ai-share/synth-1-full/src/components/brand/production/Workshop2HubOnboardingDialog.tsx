'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  markWorkshop2HubOnboardingDone,
  isWorkshop2HubOnboardingDone,
  loadWorkshop2HubOnboardingRole,
  saveWorkshop2HubOnboardingRole,
  isWorkshop2HubWorkspaceOpened,
  type StoredWorkshop2HubOnboardingRole,
} from '@/lib/production/workshop2-hub-onboarding-storage';
import { fetchWorkshop2ReferencesStatus } from '@/lib/production/workshop2-references-client';
import { COLLECTION_DEV_HUB_TITLE_RU } from '@/lib/production/collection-development-labels';
import {
  buildWorkshop2HubOnboardingChecklist,
  computeWorkshop2HubOnboardingProgressPct,
  workshop2HubOnboardingRoleHint,
} from '@/lib/production/workshop2-hub-onboarding-progress';
import {
  evaluateWorkshop2HubOnboardingBrowserFinish,
  evaluateWorkshop2HubOnboardingPgGate,
} from '@/lib/production/workshop2-hub-onboarding-fail-closed';
import { WORKSHOP2_SURFACE_BANNER_INLINE_WARN_CLASS } from '@/lib/production/workshop2-surface-banner-tokens';

const STEPS = [
  {
    title: 'Статус PostgreSQL',
    body: 'Справочники и досье надёжнее, когда API читает данные из PG. Проверьте статус и при необходимости выполните миграции и seed на странице настройки.',
  },
  {
    title: 'Создайте артикул',
    body: 'Нажмите «Создать артикул» в хабе: пол и категория L1–L3 соберут каркас досье, шкалу размеров и подсказки ТН ВЭД. Карточка появится в сетке ниже.',
  },
  {
    title: 'Откройте техническое задание',
    body: 'Клик по карточке артикула откроет workspace: паспорт, ТЗ, снабжение и пульс готовности. Сохранение уходит на сервер с debounce ~400 мс.',
  },
] as const;

/** Компактный онбординг при первом визите на /brand/production/workshop2. */
export function Workshop2HubOnboardingDialog({ hasArticle = false }: { hasArticle?: boolean }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [pgHint, setPgHint] = useState<string | null>(null);
  const [pgStatus, setPgStatus] = useState<'ok' | 'disabled' | 'fallback' | 'unknown'>('unknown');
  const [role, setRole] = useState<StoredWorkshop2HubOnboardingRole>(() =>
    loadWorkshop2HubOnboardingRole()
  );

  useEffect(() => {
    if (isWorkshop2HubOnboardingDone()) return;
    setOpen(true);
    void fetchWorkshop2ReferencesStatus().then((st) => {
      if (!st) {
        setPgHint('API справочников недоступен — проверьте dev-сервер.');
        setPgStatus('unknown');
        return;
      }
      if (st.postgres === 'ok') {
        setPgHint('PostgreSQL: подключён · справочники из PG.');
        setPgStatus('ok');
      } else if (st.postgres === 'disabled') {
        setPgHint('PostgreSQL не настроен (WORKSHOP2_DATABASE_URL) · режим статики.');
        setPgStatus('disabled');
      } else {
        setPgHint('PostgreSQL недоступен · используется fallback на seeds.');
        setPgStatus('fallback');
      }
    });
  }, []);

  const checklist = useMemo(
    () =>
      buildWorkshop2HubOnboardingChecklist({
        role,
        pgStatus,
        hasArticle,
        openedWorkspace: isWorkshop2HubWorkspaceOpened(),
      }),
    [role, pgStatus, hasArticle]
  );
  const progressPct = computeWorkshop2HubOnboardingProgressPct(checklist);

  const finishPolicy = useMemo(
    () =>
      evaluateWorkshop2HubOnboardingBrowserFinish({
        backendStatus:
          pgStatus === 'ok' ? 'server' : pgStatus === 'disabled' ? 'local_only' : 'offline',
        pgReferencesOk: pgStatus === 'ok',
      }),
    [pgStatus]
  );

  const pgGate = useMemo(() => evaluateWorkshop2HubOnboardingPgGate({ pgStatus }), [pgStatus]);

  const finish = useCallback(() => {
    // LS cache only — PG persist через workspace «hub_onboarding_mirror» PUT.
    if (finishPolicy.allowBrowserCache) {
      markWorkshop2HubOnboardingDone();
    }
    setOpen(false);
  }, [finishPolicy.allowBrowserCache]);

  const onSkip = () => finish();

  const onNext = () => {
    if (step >= STEPS.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  };

  const onRoleChange = (next: StoredWorkshop2HubOnboardingRole) => {
    setRole(next);
    saveWorkshop2HubOnboardingRole(next);
  };

  const current = STEPS[step]!;

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? finish() : setOpen(v))}>
      <DialogContent
        ariaTitle="Онбординг Workshop2"
        className="max-w-md gap-0 p-0 sm:max-w-md"
        data-testid="workshop2-hub-onboarding"
      >
        <DialogHeader className="border-border-subtle space-y-1 border-b px-4 py-3">
          <DialogTitle className="text-base">
            {COLLECTION_DEV_HUB_TITLE_RU} · быстрый старт
          </DialogTitle>
          <DialogDescription className="text-xs">
            Шаг {step + 1} из {STEPS.length} · прогресс {progressPct}% · можно пропустить
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 px-4 py-4 text-sm text-slate-700">
          <div className="grid gap-1.5">
            <Label htmlFor="w2-onboard-role" className="text-[11px] font-semibold text-slate-600">
              Ваша роль
            </Label>
            <select
              id="w2-onboard-role"
              value={role}
              onChange={(e) => onRoleChange(e.target.value as StoredWorkshop2HubOnboardingRole)}
              className="border-border-default h-8 rounded-md border bg-white px-2 text-xs"
            >
              <option value="designer">Дизайнер</option>
              <option value="technologist">Технолог</option>
              <option value="manager">Менеджер коллекции</option>
            </select>
            <p className="text-[10px] text-slate-500">{workshop2HubOnboardingRoleHint(role)}</p>
          </div>
          <p className="font-semibold text-slate-900">{current.title}</p>
          <p className="text-xs leading-relaxed">{current.body}</p>
          {step === 0 && pgHint ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-600">
              {pgHint}
            </p>
          ) : null}
          {step === 1 && pgGate.blocksSampleCreation ? (
            <p
              className={WORKSHOP2_SURFACE_BANNER_INLINE_WARN_CLASS}
              role="alert"
              data-testid="workshop2-hub-onboarding-pg-gate"
            >
              {pgGate.gateCopyRu}
            </p>
          ) : null}
          {finishPolicy.warningRu ? (
            <p className={WORKSHOP2_SURFACE_BANNER_INLINE_WARN_CLASS} role="status">
              {finishPolicy.warningRu}
            </p>
          ) : null}
          {step === 0 ? (
            <Link
              href="/brand/production/workshop2/setup"
              className="text-accent-primary text-xs font-medium underline-offset-2 hover:underline"
            >
              Страница настройки →
            </Link>
          ) : null}
          <ul className="space-y-1 rounded-md border border-slate-200 bg-slate-50/80 px-2.5 py-2 text-[10px]">
            {checklist.map((item) => (
              <li
                key={item.id}
                className={item.done ? 'text-emerald-800' : 'text-slate-600'}
                title={item.hintRu}
              >
                {item.done ? '✓' : '○'} {item.labelRu}
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter className="border-border-subtle flex flex-row justify-between gap-2 border-t px-4 py-3">
          <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
            Пропустить
          </Button>
          <Button type="button" size="sm" onClick={onNext}>
            {step >= STEPS.length - 1 ? 'Готово' : 'Далее'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
