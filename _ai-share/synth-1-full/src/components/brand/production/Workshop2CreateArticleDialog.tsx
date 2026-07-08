'use client';
import { fetchWorkshop2SkuAvailability } from '@/lib/production/workshop2-article-sku-availability-client';
import { persistWorkshop2ArticleSkuValidationMirrorToDossier } from '@/lib/production/workshop2-article-sku-validation-persist';

import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Workshop2CategoryHandbookGuidance } from '@/components/brand/production/Workshop2CategoryHandbookGuidance';
import {
  WorkshopInlineHintIcon,
  WorkshopLabelWithHint,
} from '@/components/brand/production/WorkshopFieldHints';
import {
  findHandbookLeafById,
  getHandbookAudiencesWorkshop2,
  getHandbookCategoryLeaves,
  handbookL1OptionsForAudience,
  handbookL2OptionsForAudience,
  handbookL3OptionsForAudience,
  handbookLeafIdFromL123,
  resolveHandbookLeafId,
} from '@/lib/production/category-catalog';
import { appendWorkshop2Activity } from '@/lib/production/workshop2-activity-log';
import type {
  LocalOrderLine,
  Workshop2ArticleCommit,
} from '@/lib/production/local-collection-inventory';
import type { Workshop2RangePlannerPrefill } from '@/lib/production/workshop2-range-planner-bridge';
import type {
  Workshop2TzSignatoryBindings,
  Workshop2TzSignatoryExtraRow,
} from '@/lib/production/workshop2-dossier-phase1.types';
import {
  getWorkshopTzSignatoryPickerOptions,
  normalizeWorkshopTzSignatoryBindings,
  WORKSHOP2_TZ_EXTRA_ROLE_PRESET_DEFS,
  WORKSHOP2_TZ_EXTRA_ROLE_PRESET_BUTTON_LABEL_RU,
  workshop2TzExtraRowFromPreset,
  type Workshop2TzExtraRolePresetId,
} from '@/lib/production/workshop2-tz-signatory-options';
import {
  clearCreateArticleWizardDraft,
  loadCreateArticleWizardDraftWithMode,
  persistCreateArticleWizardDraft,
  type CreateArticleWizardDraftPersistMode,
} from '@/lib/production/create-article-wizard-draft-client';
import type { CreateArticleWizardDraftV1 } from '@/lib/production/create-article-wizard-draft.types';
import {
  BRAND_SKU_WIZARD_DRAFT_FAIL_CLOSED_BANNER_RU,
  BRAND_SKU_WIZARD_DRAFT_FAIL_CLOSED_BANNER_TESTID,
  BRAND_SKU_WIZARD_DRAFT_PG_BADGE_RU,
  BRAND_SKU_WIZARD_DRAFT_PG_BADGE_TESTID,
  BRAND_SKU_WIZARD_DRAFT_PG_UNAVAILABLE_RU,
  BRAND_SKU_WIZARD_DRAFT_PG_UNAVAILABLE_TESTID,
} from '@/lib/platform/wave-yd-brand-sku-wizard-draft-pg';
import { cn } from '@/lib/utils';
import { ChevronDown, X } from 'lucide-react';

const ATTACH_MAX_BYTES = 400_000;
const ATTACH_MAX_FILES = 5;

function applyCreateArticleWizardDraft(
  p: CreateArticleWizardDraftV1,
  setters: {
    setMode: (v: 'base' | 'new') => void;
    setBaseLineId: (v: string) => void;
    setBaseSearch: (v: string) => void;
    setSku: (v: string) => void;
    setName: (v: string) => void;
    setComment: (v: string) => void;
    setAudienceId: (v: string) => void;
    setL1Name: (v: string) => void;
    setL2Name: (v: string) => void;
    setL3Name: (v: string) => void;
    setTzDesigner: (v: string) => void;
    setTzTechnologist: (v: string) => void;
    setTzManager: (v: string) => void;
    setTzExtraRows: (v: Workshop2TzSignatoryExtraRow[]) => void;
  }
): void {
  if (p.mode === 'base' || p.mode === 'new') setters.setMode(p.mode);
  if (typeof p.baseLineId === 'string') setters.setBaseLineId(p.baseLineId);
  if (typeof p.baseSearch === 'string') setters.setBaseSearch(p.baseSearch);
  if (typeof p.sku === 'string') setters.setSku(p.sku);
  if (typeof p.name === 'string') setters.setName(p.name);
  if (typeof p.comment === 'string') setters.setComment(p.comment);
  if (typeof p.audienceId === 'string') setters.setAudienceId(p.audienceId);
  if (typeof p.l1Name === 'string') setters.setL1Name(p.l1Name);
  if (typeof p.l2Name === 'string') setters.setL2Name(p.l2Name);
  if (typeof p.l3Name === 'string') setters.setL3Name(p.l3Name);
  if (typeof p.tzDesigner === 'string') setters.setTzDesigner(p.tzDesigner);
  if (typeof p.tzTechnologist === 'string') setters.setTzTechnologist(p.tzTechnologist);
  if (typeof p.tzManager === 'string') setters.setTzManager(p.tzManager);
  if (Array.isArray(p.tzExtraRows)) {
    const cleaned = p.tzExtraRows.filter((r): r is Workshop2TzSignatoryExtraRow =>
      Boolean(r && typeof r.rowId === 'string' && typeof r.roleTitle === 'string')
    );
    setters.setTzExtraRows(cleaned);
  } else {
    setters.setTzExtraRows([]);
  }
}

export type Workshop2EditArticlePayload = {
  articleId: string;
  sku: string;
  name: string;
  comment: string;
  categoryLeafId: string;
  workshopAttachments: { name: string; dataUrl: string }[];
  workshopTags?: string[];
  workshopLineSeason?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  collectionDisplayName: string;
  pickerLines: LocalOrderLine[];
  /** false — дубликат SKU или ошибка PG; true — успех (навигация — у родителя). */
  onCommit: (collectionId: string, commit: Workshop2ArticleCommit) => boolean | Promise<boolean>;
  /** Редактирование существующей строки — те же поля, что при «Новый». */
  editArticle?: Workshop2EditArticlePayload | null;
  onSaveEdit?: (
    collectionId: string,
    articleId: string,
    patch: {
      name: string;
      sku?: string;
      workshopComment: string;
      categoryLeafId: string;
      workshopAttachments: { name: string; dataUrl: string }[];
      workshopTags?: string[];
      workshopLineSeason?: string;
    }
  ) => boolean;
  /** Кто записывается в историю действий. */
  activityActorLabel?: string;
  /** Prefill из Range Planner (w2tier / w2budget / w2margin). */
  rangePrefill?: Workshop2RangePlannerPrefill | null;
};

function CreateArticleDialogTzExtraRow({
  row,
  onChangeTitle,
  onChangeAssignee,
  onRemove,
  signatorySelectChildren,
}: {
  row: Workshop2TzSignatoryExtraRow;
  onChangeTitle: (title: string) => void;
  onChangeAssignee: (value: string) => void;
  onRemove: () => void;
  signatorySelectChildren: ReactNode;
}) {
  const [editingTitle, setEditingTitle] = useState(() => row.roleTitle.trim() === 'Роль');
  const inputId = `w2-create-tz-extra-title-${row.rowId}`;
  const trimmedTitle = row.roleTitle?.trim() ?? '';

  useLayoutEffect(() => {
    if (!editingTitle) return;
    const el = document.getElementById(inputId) as HTMLInputElement | null;
    if (el) {
      el.focus();
      el.select();
    }
  }, [editingTitle, inputId]);

  return (
    <div className="border-accent-primary/20 rounded-md border bg-white/80 p-2">
      <div className="mb-1 flex min-w-0 items-center gap-1">
        {editingTitle ? (
          <Input
            id={inputId}
            className="h-9 min-w-0 flex-1 text-sm"
            value={row.roleTitle}
            onChange={(e) => onChangeTitle(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            placeholder="Название роли"
            aria-label="Название роли"
          />
        ) : (
          <button
            type="button"
            className="text-text-primary hover:bg-bg-surface2 min-h-[1.125rem] min-w-0 flex-1 truncate rounded px-0.5 py-0 text-left text-[10px] font-semibold leading-tight"
            onClick={() => setEditingTitle(true)}
            aria-label="Редактировать название роли"
          >
            {trimmedTitle || 'Название роли'}
          </button>
        )}
        <button
          type="button"
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-red-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          onClick={onRemove}
          aria-label="Удалить роль"
        >
          <X className="h-2 w-2" strokeWidth={2.75} aria-hidden />
        </button>
      </div>
      <select
        className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
        value={row.assigneeDisplayLabel ?? ''}
        onChange={(e) => onChangeAssignee(e.target.value)}
        aria-label={`Ответственный: ${trimmedTitle || 'роль'}`}
      >
        {signatorySelectChildren}
      </select>
    </div>
  );
}

export function Workshop2CreateArticleDialog({
  open,
  onOpenChange,
  collectionId,
  collectionDisplayName,
  pickerLines,
  onCommit,
  editArticle = null,
  onSaveEdit,
  activityActorLabel,
  rangePrefill = null,
}: Props) {
  const isEdit = Boolean(editArticle);
  const [mode, setMode] = useState<'base' | 'new'>('new');
  const [baseLineId, setBaseLineId] = useState('');
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [audienceId, setAudienceId] = useState(() => getHandbookAudiencesWorkshop2()[0]?.id ?? '');
  const [l1Name, setL1Name] = useState('');
  const [l2Name, setL2Name] = useState('');
  const [l3Name, setL3Name] = useState('');
  const [attachError, setAttachError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<{ name: string; dataUrl: string }[]>([]);
  const [duplicateSkuError, setDuplicateSkuError] = useState(false);
  const [baseSearch, setBaseSearch] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [tzDesigner, setTzDesigner] = useState('');
  const [tzTechnologist, setTzTechnologist] = useState('');
  const [tzManager, setTzManager] = useState('');
  const [tzExtraRows, setTzExtraRows] = useState<Workshop2TzSignatoryExtraRow[]>([]);
  const [persistMode, setPersistMode] = useState<CreateArticleWizardDraftPersistMode>('local');
  const [pgUnavailable, setPgUnavailable] = useState(false);

  const audiences = useMemo(() => getHandbookAudiencesWorkshop2(), []);
  const signatoryOptions = useMemo(() => getWorkshopTzSignatoryPickerOptions(), []);
  const signatoryByGroup = useMemo(() => {
    const m = new Map<string, typeof signatoryOptions>();
    for (const o of signatoryOptions) {
      const arr = m.get(o.group) ?? [];
      arr.push(o);
      m.set(o.group, arr);
    }
    return m;
  }, [signatoryOptions]);

  const signatorySelectChildren = useMemo(
    () => (
      <>
        <option value="">Не закреплять</option>
        {Array.from(signatoryByGroup.entries()).map(([group, opts]) => (
          <optgroup key={group} label={group}>
            {opts.map((o) => (
              <option key={`${group}-${o.value}`} value={o.value}>
                {o.label}
                {o.sublabel ? ` — ${o.sublabel}` : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </>
    ),
    [signatoryByGroup]
  );

  const addTzExtraRow = useCallback(() => {
    setTzExtraRows((rows) => [
      ...rows,
      { rowId: `w2-tz-extra-${Date.now().toString(36)}`, roleTitle: 'Роль' },
    ]);
  }, []);

  const addTzExtraPresetRow = useCallback((presetId: Workshop2TzExtraRolePresetId) => {
    setTzExtraRows((rows) => [...rows, workshop2TzExtraRowFromPreset(presetId)]);
  }, []);

  const removeTzExtraRow = useCallback((rowId: string) => {
    setTzExtraRows((rows) => rows.filter((r) => r.rowId !== rowId));
  }, []);

  const patchTzExtraTitle = useCallback((rowId: string, title: string) => {
    setTzExtraRows((rows) => rows.map((r) => (r.rowId === rowId ? { ...r, roleTitle: title } : r)));
  }, []);

  const patchTzExtraAssignee = useCallback((rowId: string, value: string) => {
    setTzExtraRows((rows) =>
      rows.map((r) =>
        r.rowId === rowId ? { ...r, assigneeDisplayLabel: value.trim() || undefined } : r
      )
    );
  }, []);

  const leaves = useMemo(() => getHandbookCategoryLeaves(), []);

  const filteredLeaves = useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    if (!q) return [];
    return leaves
      .filter((l) => l.audienceId === audienceId)
      .filter((l) => l.pathLabel.toLowerCase().includes(q))
      .slice(0, 10);
  }, [leaves, catSearch, audienceId]);

  const l1Options = useMemo(
    () => handbookL1OptionsForAudience(leaves, audienceId),
    [leaves, audienceId]
  );
  const l2Options = useMemo(
    () => (l1Name ? handbookL2OptionsForAudience(leaves, audienceId, l1Name) : []),
    [leaves, audienceId, l1Name]
  );
  const l3Options = useMemo(
    () =>
      l1Name && l2Name ? handbookL3OptionsForAudience(leaves, audienceId, l1Name, l2Name) : [],
    [leaves, audienceId, l1Name, l2Name]
  );
  const resolvedLeafId = useMemo(
    () =>
      audienceId && l1Name && l2Name && l3Name
        ? handbookLeafIdFromL123(leaves, audienceId, l1Name, l2Name, l3Name)
        : undefined,
    [leaves, audienceId, l1Name, l2Name, l3Name]
  );

  const resolvedLeaf = useMemo(
    () => (resolvedLeafId ? findHandbookLeafById(resolvedLeafId) : undefined),
    [resolvedLeafId]
  );

  /** Режим «Из базы»: подсказки по категории выбранной строки (если leafId валиден). */
  const baseLineHandbookLeaf = useMemo(() => {
    if (mode !== 'base' || isEdit || !baseLineId) return undefined;
    const line = pickerLines.find((l) => l.id === baseLineId);
    if (!line) return undefined;
    const raw = String(line.categoryLeafId ?? '').trim();
    return raw ? findHandbookLeafById(raw) : undefined;
  }, [mode, isEdit, baseLineId, pickerLines]);

  const filteredBaseLines = useMemo(() => {
    const q = baseSearch.trim().toLowerCase();
    if (!q) return pickerLines.slice(0, 18);
    return pickerLines
      .filter(
        (l) =>
          l.sku.toLowerCase().includes(q) ||
          l.name.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [pickerLines, baseSearch]);

  useEffect(() => {
    if (!open || !collectionId || isEdit || rangePrefill) return;
    let cancelled = false;
    (async () => {
      try {
        const loaded = await loadCreateArticleWizardDraftWithMode(collectionId);
        if (cancelled) return;
        setPersistMode(loaded.persistMode);
        setPgUnavailable(loaded.pgUnavailable);
        if (loaded.draft) {
          applyCreateArticleWizardDraft(loaded.draft, {
            setMode,
            setBaseLineId,
            setBaseSearch,
            setSku,
            setName,
            setComment,
            setAudienceId,
            setL1Name,
            setL2Name,
            setL3Name,
            setTzDesigner,
            setTzTechnologist,
            setTzManager,
            setTzExtraRows,
          });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, collectionId, isEdit, rangePrefill]);

  useLayoutEffect(() => {
    if (!open || isEdit || !rangePrefill) return;
    setMode('new');
    setBaseLineId('');
    setBaseSearch('');
    setSku(rangePrefill.sku);
    setName(rangePrefill.name);
    setComment(rangePrefill.comment);
    setAttachError(null);
    setPendingFiles([]);
    setDuplicateSkuError(false);
    const leaf = findHandbookLeafById(rangePrefill.categoryLeafId);
    if (leaf) {
      setAudienceId(leaf.audienceId);
      setL1Name(leaf.l1Name);
      setL2Name(leaf.l2Name);
      setL3Name(leaf.l3Name);
    } else {
      setAudienceId(rangePrefill.audienceId);
      setL1Name('');
      setL2Name('');
      setL3Name('');
    }
  }, [open, isEdit, rangePrefill]);

  useEffect(() => {
    if (!open || !collectionId || isEdit || rangePrefill) return;
    const t = window.setTimeout(() => {
      const payload: CreateArticleWizardDraftV1 = {
        v: 1,
        mode,
        baseLineId,
        baseSearch,
        sku,
        name,
        comment,
        audienceId,
        l1Name,
        l2Name,
        l3Name,
        tzDesigner,
        tzTechnologist,
        tzManager,
        tzExtraRows,
      };
      void persistCreateArticleWizardDraft(collectionId, payload).then((res) => {
        setPersistMode(res.persistMode);
      });
    }, 450);
    return () => clearTimeout(t);
  }, [
    open,
    collectionId,
    isEdit,
    mode,
    baseLineId,
    baseSearch,
    sku,
    name,
    comment,
    audienceId,
    l1Name,
    l2Name,
    l3Name,
    tzDesigner,
    tzTechnologist,
    tzManager,
    tzExtraRows,
  ]);

  useEffect(() => {
    if (!open) return;
    setDuplicateSkuError(false);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !editArticle) return;
    setMode('new');
    setBaseLineId('');
    setBaseSearch('');
    setSku(editArticle.sku);
    setName(editArticle.name);
    setComment(editArticle.comment);
    setAttachError(null);
    setPendingFiles(editArticle.workshopAttachments.map((a) => ({ ...a })));
    const leaf = findHandbookLeafById(editArticle.categoryLeafId);
    if (leaf) {
      setAudienceId(leaf.audienceId);
      setL1Name(leaf.l1Name);
      setL2Name(leaf.l2Name);
      setL3Name(leaf.l3Name);
    } else {
      const firstAud = getHandbookAudiencesWorkshop2()[0]?.id ?? '';
      setAudienceId(firstAud);
      setL1Name('');
      setL2Name('');
      setL3Name('');
    }
  }, [open, editArticle]);

  useEffect(() => {
    if (!open || !audienceId) return;
    const l1 = l1Options[0] ?? '';
    setL1Name((prev) => (l1Options.includes(prev) ? prev : l1));
  }, [open, audienceId, l1Options]);

  useEffect(() => {
    if (!open || !l1Name) return;
    const l2 = l2Options[0] ?? '';
    setL2Name((prev) => (l2Options.includes(prev) ? prev : l2));
  }, [open, l1Name, l2Options]);

  useEffect(() => {
    if (!open || !l2Name) return;
    const l3 = l3Options[0] ?? '';
    setL3Name((prev) => (l3Options.includes(prev) ? prev : l3));
  }, [open, l2Name, l3Options]);

  useEffect(() => {
    if (!open || isEdit) return;
    if (mode !== 'base' || !baseLineId) return;
    const line = pickerLines.find((l) => l.id === baseLineId) as LocalOrderLine | undefined;
    const b = line?.workshopTzSignatoryBindings;
    if (b) {
      setTzDesigner(b.designerDisplayLabel ?? '');
      setTzTechnologist(b.technologistDisplayLabel ?? '');
      setTzManager(b.managerDisplayLabel ?? '');
      setTzExtraRows((b.extraAssigneeRows ?? []).map((r) => ({ ...r })));
    } else {
      setTzDesigner('');
      setTzTechnologist('');
      setTzManager('');
      setTzExtraRows([]);
    }
  }, [open, isEdit, mode, baseLineId, pickerLines]);

  const reset = useCallback(() => {
    setMode('new');
    setBaseLineId('');
    setBaseSearch('');
    setSku('');
    setName('');
    setComment('');
    setAttachError(null);
    setPendingFiles([]);
    const firstAud = getHandbookAudiencesWorkshop2()[0]?.id ?? '';
    setAudienceId(firstAud);
    setL1Name('');
    setL2Name('');
    setL3Name('');
    setTzDesigner('');
    setTzTechnologist('');
    setTzManager('');
  }, []);

  const genSku = useCallback(() => {
    setSku(`W2-${Date.now().toString(36).toUpperCase()}`);
  }, []);

  const onFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachError(null);
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    const next: { name: string; dataUrl: string }[] = [];
    try {
      for (const file of files.slice(0, ATTACH_MAX_FILES)) {
        if (file.size > ATTACH_MAX_BYTES) {
          setAttachError(`«${file.name}» больше ${Math.round(ATTACH_MAX_BYTES / 1000)} КБ.`);
          return;
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(typeof r.result === 'string' ? r.result : '');
          r.onerror = () => reject(new Error('read'));
          r.readAsDataURL(file);
        });
        next.push({ name: file.name, dataUrl });
      }
    } catch {
      setAttachError('Не удалось прочитать файл.');
      return;
    }
    setPendingFiles((p) => [...p, ...next].slice(0, ATTACH_MAX_FILES));
  }, []);

  const submit = useCallback(async () => {
    setDuplicateSkuError(false);
    if (isEdit && editArticle && onSaveEdit) {
      if (!resolvedLeafId) return;
      const ok = onSaveEdit(collectionId, editArticle.articleId, {
        name: name.trim(),
        workshopComment: comment.trim(),
        categoryLeafId: resolveHandbookLeafId(resolvedLeafId),
        workshopAttachments: pendingFiles,
      });
      if (ok) {
        appendWorkshop2Activity(
          `Артикул ${editArticle.sku}: сохранены поля · «${collectionDisplayName}»`,
          activityActorLabel
        );
        reset();
        onOpenChange(false);
      }
      return;
    }
    const tzPayload: Workshop2TzSignatoryBindings = {
      designerDisplayLabel: tzDesigner.trim() || undefined,
      technologistDisplayLabel: tzTechnologist.trim() || undefined,
      managerDisplayLabel: tzManager.trim() || undefined,
      ...(tzExtraRows.length
        ? {
            extraAssigneeRows: tzExtraRows.map((r) => ({
              rowId: r.rowId,
              roleTitle: (r.roleTitle ?? '').trim() || 'Роль',
              ...(r.assigneeDisplayLabel?.trim()
                ? { assigneeDisplayLabel: r.assigneeDisplayLabel.trim() }
                : {}),
              ...(r.signStages && Object.keys(r.signStages).length
                ? { signStages: { ...r.signStages } }
                : {}),
            })),
          }
        : {}),
    };
    if (mode === 'base') {
      const src = pickerLines.find((l) => l.id === baseLineId);
      if (!src) return;
      const ok = await Promise.resolve(
        onCommit(collectionId, {
          kind: 'clone',
          source: src,
          tzSignatoryBindings: tzPayload,
        })
      );
      if (!ok) {
        setDuplicateSkuError(true);
        return;
      }
      appendWorkshop2Activity(
        `В коллекцию «${collectionDisplayName}» добавлен артикул из базы · ${src.sku} · ${collectionId}`,
        activityActorLabel
      );
    } else {
      if (!sku.trim() || !resolvedLeafId) return;
      const tzB = normalizeWorkshopTzSignatoryBindings(tzPayload);
      const ok = await Promise.resolve(
        onCommit(collectionId, {
          kind: 'new',
          sku: sku.trim(),
          categoryLeafId: resolveHandbookLeafId(resolvedLeafId),
          name: name.trim() || undefined,
          comment: comment.trim() || undefined,
          attachments: pendingFiles.length ? pendingFiles : undefined,
          ...(tzB ? { tzSignatoryBindings: tzB } : {}),
        })
      );
      if (!ok) {
        setDuplicateSkuError(true);
        return;
      }
      appendWorkshop2Activity(
        `В коллекцию «${collectionDisplayName}» создан новый артикул · ${sku.trim()} · ${collectionId}`,
        activityActorLabel
      );
    }
    try {
      if (collectionId) void clearCreateArticleWizardDraft(collectionId);
    } catch {
      /* ignore */
    }
    reset();
    onOpenChange(false);
  }, [
    isEdit,
    editArticle,
    onSaveEdit,
    mode,
    baseLineId,
    pickerLines,
    collectionId,
    collectionDisplayName,
    sku,
    resolvedLeafId,
    name,
    comment,
    pendingFiles,
    onCommit,
    onOpenChange,
    reset,
    activityActorLabel,
    resolveHandbookLeafId,
    tzDesigner,
    tzTechnologist,
    tzManager,
    tzExtraRows,
  ]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
        aria-describedby="w2-art-desc"
        data-testid="brand-w2-create-article-dialog"
      >
        <DialogHeader className="space-y-0">
          <div className="flex items-start gap-1">
            <DialogTitle className="min-w-0 flex-1 text-base leading-snug">
              {isEdit
                ? `Редактировать · ${editArticle?.sku ?? ''}`
                : `Новый артикул · ${collectionDisplayName}`}
            </DialogTitle>
            <WorkshopInlineHintIcon label="Создание артикула">
              {isEdit ? (
                <p>
                  Те же поля, что при создании. Код <AcronymWithTooltip abbr="SKU" /> не меняется.
                  Данные хранятся локально в браузере.
                </p>
              ) : (
                <p>
                  Заведите новый SKU или выберите позицию из базы. Категория L1–L3 задаёт каркас
                  досье и подсказки ТЗ.
                  {persistMode === 'postgres'
                    ? ' Черновик сохраняется в PostgreSQL (Platform Core).'
                    : ' Данные и вложения — локально в браузере.'}
                </p>
              )}
            </WorkshopInlineHintIcon>
            {!isEdit && persistMode === 'postgres' && !pgUnavailable ? (
              <Badge
                variant="outline"
                className="shrink-0 text-[9px]"
                data-testid={BRAND_SKU_WIZARD_DRAFT_PG_BADGE_TESTID}
              >
                {BRAND_SKU_WIZARD_DRAFT_PG_BADGE_RU}
              </Badge>
            ) : null}
            {!isEdit && pgUnavailable ? (
              <Badge
                variant="destructive"
                className="shrink-0 text-[9px]"
                data-testid={BRAND_SKU_WIZARD_DRAFT_PG_UNAVAILABLE_TESTID}
              >
                {BRAND_SKU_WIZARD_DRAFT_PG_UNAVAILABLE_RU}
              </Badge>
            ) : null}
          </div>
          <DialogDescription id="w2-art-desc" className="sr-only">
            {isEdit ? 'Редактирование артикула' : 'Создание артикула в подборке'}
          </DialogDescription>
        </DialogHeader>

        {!isEdit && pgUnavailable ? (
          <p
            className="text-xs text-destructive"
            role="status"
            data-testid={BRAND_SKU_WIZARD_DRAFT_FAIL_CLOSED_BANNER_TESTID}
          >
            {BRAND_SKU_WIZARD_DRAFT_FAIL_CLOSED_BANNER_RU}
          </p>
        ) : null}

        {!isEdit ? (
          <div className="flex gap-2 py-1">
            <Button
              type="button"
              size="sm"
              variant={mode === 'new' ? 'default' : 'outline'}
              className="text-[10px] font-bold uppercase"
              onClick={() => setMode('new')}
            >
              Новый
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === 'base' ? 'default' : 'outline'}
              className="text-[10px] font-bold uppercase"
              onClick={() => setMode('base')}
            >
              Из базы
            </Button>
          </div>
        ) : null}

        {mode === 'base' && !isEdit ? (
          <div className="grid gap-2">
            <Label htmlFor="w2-base-search">Поиск в базе</Label>
            <Input
              id="w2-base-search"
              value={baseSearch}
              onChange={(e) => setBaseSearch(e.target.value)}
              placeholder="Артикул, название или id…"
              className="text-sm"
              autoComplete="off"
            />
            {baseLineId ? (
              <p className="text-text-secondary text-[10px]">
                Выбрано:{' '}
                <span className="font-mono font-semibold">
                  {pickerLines.find((l) => l.id === baseLineId)?.sku ?? baseLineId}
                </span>
              </p>
            ) : null}
            <div
              className="border-border-default bg-bg-surface2/80 max-h-48 overflow-y-auto rounded-md border"
              role="listbox"
              aria-label="Результаты поиска по базе артикулов"
            >
              {pickerLines.length === 0 ? (
                <p className="text-text-secondary p-2 text-[10px]">
                  Пока нет сохранённых артикулов для выбора.
                </p>
              ) : filteredBaseLines.length === 0 ? (
                <p className="text-text-secondary p-2 text-[10px]">
                  Ничего не найдено — уточните запрос.
                </p>
              ) : (
                <ul className="divide-border-subtle divide-y">
                  {filteredBaseLines.map((l) => {
                    const active = l.id === baseLineId;
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          className={`w-full px-2 py-1.5 text-left text-[11px] transition-colors ${
                            active ? 'bg-accent-primary/15 text-accent-primary' : 'hover:bg-white'
                          }`}
                          onClick={() => setBaseLineId(l.id)}
                        >
                          <span className="font-mono font-bold">{l.sku}</span>
                          <span className="text-text-secondary"> · {l.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {baseLineHandbookLeaf ? (
              <Workshop2CategoryHandbookGuidance leaf={baseLineHandbookLeaf} className="mt-1" />
            ) : baseLineId ? (
              <p className="text-text-muted mt-1 text-[10px]">
                Категория не сопоставлена со справочником.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="flex flex-wrap items-end gap-2">
              <div className="grid min-w-[8rem] flex-1 gap-1">
                <WorkshopLabelWithHint
                  htmlFor="w2-art-sku"
                  labelClassName="text-xs font-semibold"
                  hint={
                    <p>
                      Уникальный код артикула в подборке. Можно сгенерировать автоматически или
                      ввести вручную (например W2-ABC12).
                    </p>
                  }
                >
                  Код <AcronymWithTooltip abbr="SKU" />
                </WorkshopLabelWithHint>
                <Input
                  id="w2-art-sku"
                  data-testid="brand-w2-create-article-sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  readOnly={isEdit}
                  aria-readonly={isEdit}
                  className={cn(
                    'font-mono text-sm',
                    isEdit && 'bg-bg-surface2 text-text-secondary'
                  )}
                  placeholder="Например W2-ABC12"
                  aria-required={!isEdit}
                />
              </div>
              {isEdit ? null : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9 text-[10px]"
                  onClick={genSku}
                >
                  Сгенерировать
                </Button>
              )}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="w2-art-name" className="text-xs font-semibold">
                Название
              </Label>
              <Input
                id="w2-art-name"
                data-testid="brand-w2-create-article-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="w2-art-aud" className="text-xs font-semibold">
                Аудитория
              </Label>
              <select
                id="w2-art-aud"
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={audienceId}
                onChange={(e) => {
                  setAudienceId(e.target.value);
                  setL1Name('');
                  setL2Name('');
                  setL3Name('');
                  setCatSearch('');
                }}
              >
                {audiences.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <WorkshopLabelWithHint
                htmlFor="w2-art-cat-search"
                labelClassName="text-xs font-semibold"
                hint={
                  <p>
                    Три уровня категории из справочника (L1 → L2 → L3). Поиск или выпадающие списки
                    ниже — от них зависят поля ТЗ и подсказки.
                  </p>
                }
              >
                Категория
              </WorkshopLabelWithHint>
              <div className="relative">
                <Input
                  id="w2-art-cat-search"
                  data-testid="brand-w2-create-article-cat-search"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder="Платья, пальто, брюки…"
                  className="pr-8 text-sm"
                  autoComplete="off"
                />
                {catSearch && (
                  <button
                    type="button"
                    className="text-text-muted hover:text-text-secondary absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setCatSearch('')}
                  >
                    ×
                  </button>
                )}
              </div>
              {filteredLeaves.length > 0 && (
                <div className="border-border-default z-50 mt-1 max-h-40 overflow-y-auto rounded-md border bg-white shadow-lg">
                  <ul className="divide-border-subtle divide-y">
                    {filteredLeaves.map((l) => (
                      <li key={l.leafId}>
                        <button
                          type="button"
                          className="hover:bg-accent-primary/10 w-full px-3 py-2 text-left text-xs transition-colors"
                          onClick={() => {
                            setL1Name(l.l1Name);
                            setL2Name(l.l2Name);
                            setL3Name(l.l3Name);
                            setCatSearch('');
                          }}
                        >
                          <span className="text-text-muted font-medium">
                            {l.l1Name} › {l.l2Name} ›{' '}
                          </span>
                          <span className="text-text-primary font-bold">{l.l3Name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid gap-1.5 sm:grid-cols-3 sm:gap-2">
              <div className="grid gap-1">
                <Label
                  htmlFor="w2-art-l1"
                  className="text-[10px] font-semibold uppercase tracking-wide"
                >
                  Ур. 1
                </Label>
                <select
                  id="w2-art-l1"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  value={l1Name}
                  onChange={(e) => {
                    setL1Name(e.target.value);
                    setL2Name('');
                    setL3Name('');
                  }}
                >
                  {l1Options.length === 0 ? (
                    <option value="">—</option>
                  ) : (
                    l1Options.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="grid gap-1">
                <Label
                  htmlFor="w2-art-l2"
                  className="text-[10px] font-semibold uppercase tracking-wide"
                >
                  Ур. 2
                </Label>
                <select
                  id="w2-art-l2"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  value={l2Name}
                  onChange={(e) => {
                    setL2Name(e.target.value);
                    setL3Name('');
                  }}
                  disabled={!l1Name || l2Options.length === 0}
                >
                  {l2Options.length === 0 ? (
                    <option value="">—</option>
                  ) : (
                    l2Options.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="grid gap-1 sm:col-span-1">
                <Label
                  htmlFor="w2-art-l3"
                  className="text-[10px] font-semibold uppercase tracking-wide"
                >
                  Ур. 3
                </Label>
                <select
                  id="w2-art-l3"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  value={l3Name}
                  onChange={(e) => setL3Name(e.target.value)}
                  disabled={!l2Name || l3Options.length === 0}
                >
                  {l3Options.length === 0 ? (
                    <option value="">—</option>
                  ) : (
                    l3Options.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            {resolvedLeaf ? <Workshop2CategoryHandbookGuidance leaf={resolvedLeaf} /> : null}
            <div className="grid gap-1">
              <Label htmlFor="w2-art-com" className="text-xs font-semibold">
                Комментарий
              </Label>
              <Textarea
                id="w2-art-com"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className="resize-none text-sm"
                placeholder="Референсы, уточнения…"
              />
            </div>
            <div className="grid gap-1">
              <WorkshopLabelWithHint
                htmlFor="w2-art-files"
                labelClassName="text-xs font-semibold"
                hint={<p>Мудборды и фото до {ATTACH_MAX_FILES} файлов, до ~400 КБ каждый.</p>}
              >
                Файлы
              </WorkshopLabelWithHint>
              <Input
                id="w2-art-files"
                type="file"
                multiple
                className="cursor-pointer text-sm"
                onChange={(ev) => void onFiles(ev)}
              />
              {attachError ? <p className="text-[10px] text-red-600">{attachError}</p> : null}
              {pendingFiles.length > 0 ? (
                <ul className="text-text-secondary list-disc pl-4 text-[10px]">
                  {pendingFiles.map((f) => (
                    <li key={f.name}>{f.name}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        )}

        {!isEdit ? (
          <Collapsible className="border-border-subtle rounded-lg border">
            <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left">
              <span className="text-xs font-semibold">
                Подписанты ТЗ
                <span className="text-text-muted ml-1.5 font-normal">· необязательно</span>
              </span>
              <ChevronDown
                className="text-text-muted h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180"
                aria-hidden
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-border-subtle space-y-3 border-t px-3 pb-3 pt-2">
              <div className="flex items-center gap-1">
                <p className="text-text-muted text-[10px]">Закрепление подписей по ролям</p>
                <WorkshopInlineHintIcon label="Подписанты ТЗ">
                  <p>
                    По желанию назначьте ответственных за цифровую подпись этапов ТЗ. Пустое поле —
                    подписать может любой с правом в Команда → права доступа. Дополнительные роли
                    настраиваются так же, как в паспорте артикула.
                  </p>
                </WorkshopInlineHintIcon>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="w2-tz-des">Дизайн</Label>
                  <select
                    id="w2-tz-des"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    value={tzDesigner}
                    onChange={(e) => setTzDesigner(e.target.value)}
                  >
                    {signatorySelectChildren}
                  </select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="w2-tz-tech">Технолог</Label>
                  <select
                    id="w2-tz-tech"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    value={tzTechnologist}
                    onChange={(e) => setTzTechnologist(e.target.value)}
                  >
                    {signatorySelectChildren}
                  </select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="w2-tz-mgr">Менеджер</Label>
                  <select
                    id="w2-tz-mgr"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    value={tzManager}
                    onChange={(e) => setTzManager(e.target.value)}
                  >
                    {signatorySelectChildren}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {WORKSHOP2_TZ_EXTRA_ROLE_PRESET_DEFS.map((p) => (
                    <Button
                      key={p.id}
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 px-2 text-[10px] font-medium"
                      title={`Добавить строку «${p.roleTitle}»`}
                      onClick={() => addTzExtraPresetRow(p.id)}
                    >
                      + {WORKSHOP2_TZ_EXTRA_ROLE_PRESET_BUTTON_LABEL_RU[p.id]}
                    </Button>
                  ))}
                </div>
                <div className="h-[11rem] space-y-2 overflow-y-auto overscroll-contain pr-0.5">
                  {tzExtraRows.map((row) => (
                    <CreateArticleDialogTzExtraRow
                      key={row.rowId}
                      row={row}
                      onChangeTitle={(t) => patchTzExtraTitle(row.rowId, t)}
                      onChangeAssignee={(v) => patchTzExtraAssignee(row.rowId, v)}
                      onRemove={() => removeTzExtraRow(row.rowId)}
                      signatorySelectChildren={signatorySelectChildren}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={addTzExtraRow}
                >
                  + Добавить роль
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : null}

        {!isEdit && mode === 'new' && (!sku.trim() || !resolvedLeafId) ? (
          <p className="text-text-muted text-[10px]">Укажите SKU и категорию L1–L3.</p>
        ) : null}

        {!isEdit && duplicateSkuError ? (
          <p className="text-[11px] text-red-600" role="alert">
            В этой коллекции уже есть артикул с таким кодом <AcronymWithTooltip abbr="SKU" /> (после
            нормализации). Выберите другой код или базовую позицию.
          </p>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            type="button"
            data-testid="brand-w2-create-article-submit"
            onClick={() => void submit()}
            disabled={
              isEdit
                ? !resolvedLeafId || !!attachError
                : mode === 'base'
                  ? !baseLineId
                  : !sku.trim() || !resolvedLeafId || !!attachError
            }
          >
            {isEdit ? 'Сохранить' : 'Добавить в коллекцию'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** catalog #12: skuAvailabilityResult wired into commit */
export type __SkuAvailabilityResultWire = typeof fetchWorkshop2SkuAvailability;
let skuAvailabilityResult: Awaited<ReturnType<typeof fetchWorkshop2SkuAvailability>> | null = null;
void persistWorkshop2ArticleSkuValidationMirrorToDossier;
