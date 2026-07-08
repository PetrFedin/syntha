'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { LayoutPanelLeft, UserCircle } from 'lucide-react';
import type { MatrixStepStatus } from '@/lib/production/unified-sku-flow-store';
import {
  BRAND_COLLECTION_STAGE_MODULES_SAVED,
  getStepModule,
  loadCollectionStageModulesWithMode,
  patchStepModuleFields,
  saveCollectionStageModules,
  type CollectionStageModulesDoc,
} from '@/lib/production/collection-stage-modules-store';
import {
  BRAND_COLLECTION_STAGE_MODULES_ACTOR_LABEL_RU,
  BRAND_COLLECTION_STAGE_MODULES_ACTOR_PLACEHOLDER_RU,
  BRAND_COLLECTION_STAGE_MODULES_ATTACHMENTS_BTN_RU,
  BRAND_COLLECTION_STAGE_MODULES_DRAFT_FILLED_RU,
  BRAND_COLLECTION_STAGE_MODULES_LOADING_RU,
  BRAND_COLLECTION_STAGE_MODULES_PG_BADGE_RU,
  BRAND_COLLECTION_STAGE_MODULES_PG_BADGE_TESTID,
  BRAND_COLLECTION_STAGE_MODULES_PG_UNAVAILABLE_RU,
  BRAND_COLLECTION_STAGE_MODULES_PG_UNAVAILABLE_TESTID,
  BRAND_COLLECTION_STAGE_MODULES_SYNC_RU,
} from '@/lib/platform/wave-xj-collection-stage-modules-pg';
import {
  getFormFieldsForStep,
  hasSubstantiveModuleContent,
} from '@/lib/production/collection-step-form-fields';
import type { CollectionModuleSaveEvent } from '@/components/brand/production/CollectionStepModuleDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const GENERIC_FIELD_KEYS = new Set(['objectives', 'keyDecisions', 'risksBlockers', 'linksRefs']);

const STATUS_RU: Record<MatrixStepStatus, string> = {
  not_started: 'матрица: не начато',
  in_progress: 'матрица: в работе',
  done: 'матрица: готово',
};

const VARIANT_STYLES = {
  emerald: 'border-emerald-200/90 bg-gradient-to-r from-emerald-50/35 via-white to-teal-50/20',
  rose: 'border-rose-200/85 bg-gradient-to-r from-rose-50/30 via-white to-amber-50/15',
  violet:
    'border-accent-primary/30 bg-gradient-to-r from-accent-primary/10 via-white to-accent-primary/10',
  sky: 'border-sky-200/90 bg-gradient-to-r from-sky-50/40 via-white to-cyan-50/15',
  indigo:
    'border-accent-primary/30 bg-gradient-to-r from-accent-primary/10 via-white to-bg-surface2/25',
  amber: 'border-amber-200/90 bg-gradient-to-r from-amber-50/40 via-white to-orange-50/15',
  orange: 'border-orange-200/85 bg-gradient-to-r from-orange-50/35 via-white to-amber-50/18',
  teal: 'border-teal-200/90 bg-gradient-to-r from-teal-50/35 via-white to-cyan-50/18',
} as const;

type Variant = keyof typeof VARIANT_STYLES;

export type HubModuleLink = { href: string; label: string };

type Props = {
  stepId: string;
  collectionFlowKey: string;
  collectionLabel: string;
  matrixStatus?: MatrixStepStatus;
  onAfterModuleSave?: (e: CollectionModuleSaveEvent) => void;
  onOpenFullDialog: () => void;
  cardTitle: string;
  Icon: LucideIcon;
  iconClassName: string;
  /** Пояснение под заголовком (HTML не используется) */
  cardHint: string;
  /** Ключи полей для одной строки превью (по порядку, обрезка) */
  previewFieldKeys: string[];
  variant: Variant;
  saveLabel: string;
  moduleLink?: HubModuleLink;
  /** Одна или несколько дополнительных ссылок (outline) */
  moduleLinkExtra?: HubModuleLink | HubModuleLink[];
};

/**
 * Универсальная карточка хаба для этапа с полями в `collection-stage-modules-store`
 * (как бриф / ассортимент, без дублирования логики).
 */
export function CollectionStageModuleHubCard({
  stepId,
  collectionFlowKey,
  collectionLabel,
  matrixStatus,
  onAfterModuleSave,
  onOpenFullDialog,
  cardTitle,
  Icon,
  iconClassName,
  cardHint,
  previewFieldKeys,
  variant,
  saveLabel,
  moduleLink,
  moduleLinkExtra,
}: Props) {
  const fieldDefs = useMemo(() => getFormFieldsForStep(stepId), [stepId]);
  const [doc, setDoc] = useState<CollectionStageModulesDoc>(() => ({ v: 1, steps: {} }));
  const [draftFields, setDraftFields] = useState<Record<string, string>>({});
  const [actorLabel, setActorLabel] = useState('Демо-пользователь');
  const [modulesLoading, setModulesLoading] = useState(true);
  const [modulesStoragePg, setModulesStoragePg] = useState(false);
  const [modulesPgUnavailable, setModulesPgUnavailable] = useState(false);

  const applyDocToDraft = useCallback(
    (d: CollectionStageModulesDoc) => {
      setDoc(d);
      const m = getStepModule(d, stepId);
      const merged: Record<string, string> = {};
      for (const def of fieldDefs) merged[def.key] = m.fields[def.key] ?? '';
      setDraftFields(merged);
    },
    [fieldDefs, stepId]
  );

  const refresh = useCallback(async () => {
    setModulesLoading(true);
    const {
      doc: d,
      persistMode,
      pgUnavailable,
    } = await loadCollectionStageModulesWithMode(collectionFlowKey);
    setModulesStoragePg(persistMode === 'postgres' && !pgUnavailable);
    setModulesPgUnavailable(persistMode === 'postgres' && pgUnavailable);
    applyDocToDraft(d);
    setModulesLoading(false);
  }, [applyDocToDraft, collectionFlowKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const h = (e: Event) => {
      const k = (e as CustomEvent<{ collectionKey?: string }>).detail?.collectionKey;
      if (k === collectionFlowKey) void refresh();
    };
    window.addEventListener(BRAND_COLLECTION_STAGE_MODULES_SAVED, h as EventListener);
    return () =>
      window.removeEventListener(BRAND_COLLECTION_STAGE_MODULES_SAVED, h as EventListener);
  }, [collectionFlowKey, refresh]);

  const handleSave = () => {
    const actor = actorLabel.trim() || 'Не указано';
    const prevMod = getStepModule(doc, stepId);
    const hadSubstantive = hasSubstantiveModuleContent(prevMod.fields, fieldDefs);
    const willSubstantive = hasSubstantiveModuleContent(draftFields, fieldDefs);
    const next = patchStepModuleFields(doc, stepId, draftFields, actor);
    saveCollectionStageModules(collectionFlowKey, next);
    setDoc(next);
    onAfterModuleSave?.({
      stepId,
      firstSubstantiveSave: !hadSubstantive && willSubstantive,
    });
  };

  const previewLine = useMemo(() => {
    const bits: string[] = [];
    for (const key of previewFieldKeys) {
      const t = (draftFields[key] ?? '').trim();
      if (t) bits.push(t.slice(0, 72));
    }
    return bits.length ? bits.join(' · ') : null;
  }, [draftFields, previewFieldKeys]);

  const substantive = hasSubstantiveModuleContent(draftFields, fieldDefs);

  const firstGenericIndex = useMemo(
    () => fieldDefs.findIndex((d) => GENERIC_FIELD_KEYS.has(d.key)),
    [fieldDefs]
  );

  return (
    <Card className={cn('shadow-sm', VARIANT_STYLES[variant])}>
      <CardHeader className="space-y-1 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Icon className={cn('h-4 w-4 shrink-0', iconClassName)} aria-hidden />
          <CardTitle className="text-sm uppercase tracking-tight">{cardTitle}</CardTitle>
          {matrixStatus ? (
            <Badge
              variant="outline"
              className="border-border-default h-5 text-[7px] font-bold uppercase"
            >
              {STATUS_RU[matrixStatus]}
            </Badge>
          ) : null}
          {substantive ? (
            <Badge className="h-5 bg-emerald-600/90 text-[7px] font-bold uppercase">
              {BRAND_COLLECTION_STAGE_MODULES_DRAFT_FILLED_RU}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-text-secondary h-5 text-[7px] font-semibold">
              {BRAND_COLLECTION_STAGE_MODULES_SYNC_RU}
            </Badge>
          )}
          {modulesLoading ? (
            <Badge variant="outline" className="text-text-muted h-5 text-[7px] font-semibold">
              {BRAND_COLLECTION_STAGE_MODULES_LOADING_RU}
            </Badge>
          ) : null}
          {modulesStoragePg ? (
            <Badge
              variant="outline"
              className="h-5 text-[7px] font-semibold"
              data-testid={BRAND_COLLECTION_STAGE_MODULES_PG_BADGE_TESTID}
            >
              {BRAND_COLLECTION_STAGE_MODULES_PG_BADGE_RU}
            </Badge>
          ) : null}
          {modulesPgUnavailable ? (
            <Badge
              variant="destructive"
              className="h-5 text-[7px] font-semibold"
              data-testid={BRAND_COLLECTION_STAGE_MODULES_PG_UNAVAILABLE_TESTID}
            >
              {BRAND_COLLECTION_STAGE_MODULES_PG_UNAVAILABLE_RU}
            </Badge>
          ) : null}
        </div>
        <CardDescription className="text-xs leading-relaxed">
          Коллекция: <strong className="text-text-primary">{collectionLabel}</strong>. {cardHint}{' '}
          Этап в матрице: <span className="font-mono text-[10px]">{stepId}</span>.
        </CardDescription>
        {previewLine ? (
          <p className="text-text-primary line-clamp-2 pt-0.5 text-[11px] font-medium">
            Кратко: <span className="text-accent-primary">{previewLine}</span>
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-border-subtle flex flex-wrap items-end gap-2 rounded-lg border bg-white/80 p-3">
          <div className="flex min-w-[200px] flex-1 items-center gap-2">
            <UserCircle className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-text-muted text-[9px] font-bold uppercase">
                {BRAND_COLLECTION_STAGE_MODULES_ACTOR_LABEL_RU}
              </p>
              <Input
                className="mt-0.5 h-8 text-xs"
                value={actorLabel}
                onChange={(e) => setActorLabel(e.target.value)}
                placeholder={BRAND_COLLECTION_STAGE_MODULES_ACTOR_PLACEHOLDER_RU}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {fieldDefs.map((def, idx) => {
            const isGeneric = GENERIC_FIELD_KEYS.has(def.key);
            return (
              <div key={def.key}>
                {firstGenericIndex === idx ? (
                  <div className="border-border-default border-t pt-3">
                    <p className="text-text-muted text-[8px] font-black uppercase tracking-wider">
                      Дополнительно: цели, решения, риски, ссылки
                    </p>
                  </div>
                ) : null}
                <div
                  className={cn(
                    isGeneric
                      ? 'border-border-default/80 bg-bg-surface2/40 rounded-lg border border-dashed p-2'
                      : ''
                  )}
                >
                  <p className="text-text-muted mb-1 text-[9px] font-bold uppercase">{def.label}</p>
                  {def.type === 'textarea' ? (
                    <Textarea
                      className="min-h-[64px] text-xs"
                      placeholder={def.placeholder}
                      value={draftFields[def.key] ?? ''}
                      onChange={(e) => setDraftFields((p) => ({ ...p, [def.key]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      className="h-9 text-xs"
                      type={def.type === 'number' ? 'number' : 'text'}
                      placeholder={def.placeholder}
                      value={draftFields[def.key] ?? ''}
                      onChange={(e) => setDraftFields((p) => ({ ...p, [def.key]: e.target.value }))}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-border-subtle flex flex-wrap items-center gap-2 border-t pt-3">
          <Button type="button" size="sm" className="h-9 text-xs" onClick={handleSave}>
            {saveLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-[10px]"
            onClick={onOpenFullDialog}
          >
            <LayoutPanelLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {BRAND_COLLECTION_STAGE_MODULES_ATTACHMENTS_BTN_RU}
          </Button>
          {moduleLink ? (
            <Button type="button" variant="secondary" size="sm" className="h-9 text-[10px]" asChild>
              <Link href={moduleLink.href}>{moduleLink.label}</Link>
            </Button>
          ) : null}
          {(moduleLinkExtra != null
            ? Array.isArray(moduleLinkExtra)
              ? moduleLinkExtra
              : [moduleLinkExtra]
            : []
          ).map((link, i) => (
            <Button
              key={`${link.href}-${link.label}-${i}`}
              type="button"
              variant="outline"
              size="sm"
              className="h-9 text-[10px]"
              asChild
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
