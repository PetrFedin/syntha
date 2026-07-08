'use client';
import { workshop2DevWarn } from '@/lib/production/workshop2-dev-log';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { AttributeCatalogAttribute } from '@/lib/production/attribute-catalog.types';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { cn } from '@/lib/utils';
import {
  extractHex6,
  extractTwoHexesFromCss,
  normalizeRuColorMatch,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-color-mat-helpers';
import { HandbookMultiSelectPopover } from '@/components/brand/production/workshop2-phase1-dossier-panel-handbook-multi-select';
import { resolvedHandbookDisplayLabel } from '@/components/brand/production/workshop2-phase1-dossier-panel-handbook-display-label';
import {
  partitionHandbookAndFree,
  partitionValues,
} from '@/components/brand/production/workshop2-phase1-dossier-panel-assignment-helpers';
import { WORKSHOP_FIELD_LABEL_CLASS } from '@/components/brand/production/workshop2-phase1-dossier-panel-ui-constants';

export function AttributeRowEditor({
  attribute,
  dossier,
  allowMultiHandbook,
  onSetHandbookParameters,
  onFreeTextSide,
  patchColor,
}: {
  attribute: AttributeCatalogAttribute;
  dossier: Workshop2DossierPhase1;
  allowMultiHandbook: boolean;
  onSetHandbookParameters: (
    attributeId: string,
    parts: { parameterId: string; displayLabel: string }[]
  ) => void;
  onFreeTextSide: (attributeId: string, text: string) => void;
  patchColor?: (u: {
    handbook?: { parameterId: string; displayLabel: string } | null;
    freeText?: string;
  }) => void;
}) {
  const handbookParts = useMemo(() => {
    const assign = dossier.assignments.find(
      (x) => x.kind === 'canonical' && x.attributeId === attribute.attributeId
    );
    const { hbs: list } = partitionHandbookAndFree(assign);
    const aid = attribute.attributeId;
    return list.map((v) => ({
      parameterId: v.parameterId!,
      displayLabel: resolvedHandbookDisplayLabel(aid, v.parameterId!, v.displayLabel),
    }));
  }, [dossier.assignments, attribute.attributeId]);

  const sortedParams = useMemo(
    () => [...attribute.parameters].sort((x, y) => x.sortOrder - y.sortOrder),
    [attribute.parameters]
  );

  const selectOptions = useMemo(() => {
    const assign = dossier.assignments.find(
      (x) => x.kind === 'canonical' && x.attributeId === attribute.attributeId
    );
    const { hbs: hbList } = partitionHandbookAndFree(assign);
    const list = [...sortedParams];
    for (const v of hbList) {
      const pid = v.parameterId;
      if (pid && !list.some((p) => p.parameterId === pid)) {
        list.unshift({
          parameterId: pid,
          label: v.displayLabel || pid,
          sortOrder: -1,
        });
      }
    }
    return list;
  }, [sortedParams, dossier.assignments, attribute.attributeId]);

  if (attribute.attributeId === 'color' && patchColor) {
    return <ColorAttributeRow attribute={attribute} dossier={dossier} patchColor={patchColor} />;
  }

  const a = dossier.assignments.find(
    (x) => x.kind === 'canonical' && x.attributeId === attribute.attributeId
  );
  const { hbs, ft } = partitionHandbookAndFree(a);
  const freeStr = ft?.text ?? '';

  if (attribute.type === 'text') {
    return (
      <Input
        className="h-9 w-full min-w-0 text-sm"
        value={freeStr}
        onChange={(e) => onFreeTextSide(attribute.attributeId, e.target.value)}
        placeholder={attribute.uiPlaceholder ?? 'Свой текст'}
      />
    );
  }

  if (allowMultiHandbook) {
    const optList = selectOptions.map((p) => ({ parameterId: p.parameterId, label: p.label }));
    return (
      <div className="grid gap-2 sm:grid-cols-2 sm:items-start sm:gap-3">
        <HandbookMultiSelectPopover
          options={optList}
          parts={handbookParts}
          catalogAttributeId={attribute.attributeId}
          onPartsChange={(parts) => onSetHandbookParameters(attribute.attributeId, parts)}
        />
        <Input
          className="h-9 min-w-0 text-sm"
          value={freeStr}
          onChange={(e) => onFreeTextSide(attribute.attributeId, e.target.value)}
          placeholder={attribute.uiPlaceholder ?? 'Свой текст'}
        />
      </div>
    );
  }

  const currentPid = hbs[0]?.parameterId ?? '';

  return (
    <div className="grid gap-2 sm:grid-cols-2 sm:items-start">
      <select
        className="border-border-default text-text-primary h-9 w-full min-w-0 rounded-md border bg-white px-2 text-sm"
        value={currentPid}
        onChange={(e) => {
          const pid = e.target.value;
          const p = attribute.parameters.find((x) => x.parameterId === pid);
          onSetHandbookParameters(
            attribute.attributeId,
            pid && p ? [{ parameterId: pid, displayLabel: p.label }] : []
          );
        }}
      >
        <option value="">Не выбрано из справочника</option>
        {selectOptions.map((p) => (
          <option key={p.parameterId} value={p.parameterId}>
            {p.label}
          </option>
        ))}
      </select>
      <Input
        className="h-9 min-w-0 text-sm"
        value={freeStr}
        onChange={(e) => onFreeTextSide(attribute.attributeId, e.target.value)}
        placeholder={attribute.uiPlaceholder ?? 'Свой текст'}
      />
    </div>
  );
}

export function ColorAttributeRow({
  attribute,
  dossier,
  patchColor,
  paletteCrossNeedles,
}: {
  attribute: AttributeCatalogAttribute;
  dossier: Workshop2DossierPhase1;
  patchColor: (u: {
    handbook?: { parameterId: string; displayLabel: string } | null;
    freeText?: string;
  }) => void;
  /** Сузить палитру по токенам из основной группы и референса (паспорт). */
  paletteCrossNeedles?: string[];
}) {
  const a = dossier.assignments.find(
    (x) => x.kind === 'canonical' && x.attributeId === attribute.attributeId
  );
  const { hb, ft } = partitionValues(a);
  const currentPid = hb?.parameterId ?? '';
  const freeStr = ft?.text ?? '';

  const sorted = useMemo(
    () => [...attribute.parameters].sort((x, y) => x.sortOrder - y.sortOrder),
    [attribute.parameters]
  );

  const [gradA, setGradA] = useState('#6366f1');
  const [gradB, setGradB] = useState('#ec4899');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [palFilter, setPalFilter] = useState('');
  const [ignorePaletteCross, setIgnorePaletteCross] = useState(false);
  const [aiColorOpen, setAiColorOpen] = useState(false);
  const [aiColorLoading, setAiColorLoading] = useState(false);
  const [aiColorPrompt, setAiColorPrompt] = useState('');

  useEffect(() => {
    const p = sorted.find((x) => x.parameterId === currentPid);
    if (p?.colorHex) {
      setGradA(p.colorHex);
      setGradB(p.colorHex);
      return;
    }
    if (p?.gradientCss) {
      const pair = extractTwoHexesFromCss(p.gradientCss);
      if (pair) {
        setGradA(pair.a);
        setGradB(pair.b);
        return;
      }
    }
    const t = freeStr.trim();
    if (t.startsWith('linear-gradient')) {
      const pair = extractTwoHexesFromCss(t);
      if (pair) {
        setGradA(pair.a);
        setGradB(pair.b);
      }
    }
  }, [currentPid, freeStr, sorted]);

  const hexFromText = extractHex6(freeStr);
  const colorInputValue = hexFromText ?? gradA;

  const mergeFreeWithHex = (hex: string) => {
    setGradA(hex);
    setGradB(hex);
    const without = freeStr
      .replace(/#([0-9A-Fa-f]{6})\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    patchColor({ freeText: without ? `${hex} · ${without}` : hex });
  };

  const previewCss = freeStr.trim().startsWith('linear-gradient')
    ? freeStr.trim()
    : `linear-gradient(90deg, ${gradA}, ${gradB})`;

  const pickHandbook = (pid: string, label: string) => {
    if (pid && label)
      patchColor({ handbook: { parameterId: pid, displayLabel: label }, freeText: '' });
    else patchColor({ handbook: null, freeText: '' });
  };

  const current = sorted.find((x) => x.parameterId === currentPid);
  const needle = palFilter.trim().toLowerCase();
  const activeCross =
    !ignorePaletteCross && paletteCrossNeedles && paletteCrossNeedles.length > 0
      ? paletteCrossNeedles
      : [];
  const filteredPalette = sorted.filter((p) => {
    const lbNorm = normalizeRuColorMatch(p.label);
    const byName = !needle || lbNorm.includes(normalizeRuColorMatch(needle));
    const byCross =
      activeCross.length === 0 || activeCross.some((n) => n.length >= 2 && lbNorm.includes(n));
    return byName && byCross;
  });

  const summaryLabel = (() => {
    if (currentPid && current) return current.label;
    const t = freeStr.trim();
    if (t.startsWith('linear-gradient')) return 'Свой градиент (сохранён)';
    if (extractHex6(freeStr)) return 'Свой оттенок / текст';
    return 'Выберите цвет из палитры';
  })();

  const summarySwatchStyle: CSSProperties = (() => {
    if (current?.colorHex) return { backgroundColor: current.colorHex };
    if (current?.gradientCss) return { background: current.gradientCss };
    const t = freeStr.trim();
    if (t.startsWith('linear-gradient')) return { background: t };
    const hx = extractHex6(freeStr);
    if (hx) return { backgroundColor: hx };
    return { background: previewCss };
  })();

  const onFreeTextChange = (raw: string) => {
    patchColor({ freeText: raw });
    const t = raw.trim();
    if (!t.startsWith('linear-gradient')) {
      const hx = extractHex6(raw);
      if (hx) {
        setGradA(hx);
        setGradB(hx);
      }
    }
  };

  /** Единый размер «квадратов»: как прежний блок «Свой оттенок» (h-4), +50% → h-6/w-6. */
  const colorWellClass =
    'h-6 w-6 shrink-0 cursor-pointer rounded-md border border-border-default bg-white p-0 box-border';

  /** Превью в квадрате «Свой оттенок»: сплошной или сохранённый linear-gradient из текста. */
  const shadeSwatchStyle: CSSProperties = (() => {
    const t = freeStr.trim();
    if (t.startsWith('linear-gradient')) return { background: t };
    return summarySwatchStyle;
  })();

  /** Секции палитры / оттенка / градиента — без лишних рамок (визуал). */
  const colorSubCard = 'bg-bg-surface2/40 space-y-2 rounded-md p-3 min-w-0';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-start">
        <div className={colorSubCard}>
          <div className="flex items-center gap-1">
            <Label
              className={cn(WORKSHOP_FIELD_LABEL_CLASS, 'text-text-primary')}
              title="Палитра и градиент"
            >
              Палитра и градиент
            </Label>
          </div>
          <div className="ring-border-subtle/80 min-w-0 overflow-hidden rounded-md bg-white shadow-sm ring-1">
            <button
              type="button"
              className="hover:bg-bg-surface2/80 flex h-9 w-full items-center gap-2 px-2 text-left text-sm"
              onClick={() => setPaletteOpen((o) => !o)}
            >
              <span
                className="border-border-default h-2.5 w-2.5 shrink-0 rounded-full border shadow-sm"
                style={summarySwatchStyle}
              />
              <span className="text-text-primary min-w-0 flex-1 truncate font-medium leading-none">
                {summaryLabel}
              </span>
              <span className="text-text-muted shrink-0 text-[10px]">
                {paletteOpen ? '▲' : '▼'}
              </span>
            </button>
            {paletteOpen ? (
              <div className="border-border-subtle/70 border-t bg-white p-2">
                <Input
                  className="mb-2 h-9 text-sm"
                  placeholder="Фильтр по названию цвета…"
                  value={palFilter}
                  onChange={(e) => setPalFilter(e.target.value)}
                />
                {paletteCrossNeedles && paletteCrossNeedles.length > 0 ? (
                  <button
                    type="button"
                    className="text-text-primary hover:text-text-secondary mb-2 text-left text-[10px] font-semibold underline underline-offset-2"
                    onClick={() => setIgnorePaletteCross((v) => !v)}
                  >
                    {ignorePaletteCross
                      ? 'Сузить список по основной группе и референсу'
                      : 'Показать всю палитру'}
                  </button>
                ) : null}
                <div className="divide-border-subtle/70 max-h-52 divide-y overflow-y-auto rounded-md bg-white">
                  <button
                    type="button"
                    className="hover:bg-bg-surface2 flex h-9 w-full items-center gap-2 px-2 text-left text-sm"
                    onClick={() => {
                      pickHandbook('', '');
                      setPaletteOpen(false);
                      setPalFilter('');
                    }}
                  >
                    <span className="border-border-default bg-bg-surface2 h-2.5 w-2.5 shrink-0 rounded-full border border-dashed" />
                    <span className="text-text-secondary leading-none">
                      Не выбрано из справочника
                    </span>
                  </button>
                  {filteredPalette.map((p) => (
                    <button
                      key={p.parameterId}
                      type="button"
                      className={cn(
                        'hover:bg-bg-surface2 flex h-9 w-full items-center gap-2 px-2 text-left text-sm',
                        currentPid === p.parameterId && 'bg-accent-primary/15'
                      )}
                      onClick={() => {
                        pickHandbook(p.parameterId, p.label);
                        setPaletteOpen(false);
                        setPalFilter('');
                      }}
                    >
                      <span
                        className="border-border-default h-2.5 w-2.5 shrink-0 rounded-full border"
                        style={
                          p.colorHex
                            ? { backgroundColor: p.colorHex }
                            : p.gradientCss
                              ? { background: p.gradientCss }
                              : { background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)' }
                        }
                      />
                      <span className="min-w-0 flex-1 truncate leading-none">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className={colorSubCard}>
          <div className="flex items-center justify-between gap-1">
            <Label className={cn(WORKSHOP_FIELD_LABEL_CLASS, 'text-text-primary')}>
              Свой оттенок
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-[9px] text-teal-700 hover:bg-teal-50 hover:text-teal-900"
              onClick={() => setAiColorOpen(true)}
            >
              <LucideIcons.Sparkles className="mr-1 size-3" />
              Распознать Pantone/HEX
            </Button>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="ring-border-subtle/80 relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-white shadow-sm ring-1"
              title="Превью: при сохранённом градиенте показывается полоса; клик — выбор сплошного цвета"
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={shadeSwatchStyle}
                aria-hidden
              />
              <input
                type="color"
                value={colorInputValue}
                onChange={(e) => mergeFreeWithHex(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Выбор оттенка"
              />
            </div>
            <Input
              className="h-9 min-w-0 flex-1 text-sm"
              value={freeStr}
              onChange={(e) => onFreeTextChange(e.target.value)}
              placeholder={attribute.uiPlaceholder ?? 'Пантон, RAL, комментарий к цвету…'}
            />
          </div>
        </div>
      </div>

      <div className={cn(colorSubCard, 'w-full')}>
        <div className="flex items-center gap-1">
          <Label className={cn(WORKSHOP_FIELD_LABEL_CLASS, 'text-text-primary')}>
            Свой градиент
          </Label>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
          <input
            type="color"
            value={gradA}
            onChange={(e) => setGradA(e.target.value)}
            className={colorWellClass}
            aria-label="Цвет начала градиента"
          />
          <span className="text-text-secondary shrink-0 text-[10px]">→</span>
          <input
            type="color"
            value={gradB}
            onChange={(e) => setGradB(e.target.value)}
            className={colorWellClass}
            aria-label="Цвет конца градиента"
          />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-9 w-9 shrink-0"
            aria-label="Записать градиент в цвет"
            title="Записать градиент в цвет"
            onClick={() =>
              patchColor({
                handbook: null,
                freeText: `linear-gradient(90deg, ${gradA}, ${gradB})`,
              })
            }
          >
            <LucideIcons.Check className="h-4 w-4" aria-hidden />
          </Button>
          <div
            className="bg-bg-surface2/50 ring-border-subtle/50 h-9 min-h-9 min-w-0 flex-1 rounded-md shadow-inner ring-1 ring-inset"
            style={{ background: previewCss }}
            title="Превью градиента"
          />
        </div>
      </div>

      <Dialog open={aiColorOpen} onOpenChange={setAiColorOpen}>
        <DialogContent className="max-h-[min(90vh,600px)] w-[min(96vw,500px)] max-w-none gap-0 overflow-hidden p-0 sm:rounded-xl">
          <DialogHeader className="border-border-subtle border-b p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-100/50 text-teal-600">
                <LucideIcons.Sparkles className="h-5 w-5" aria-hidden />
              </div>
              <div className="flex-1 text-left">
                <DialogTitle className="text-base text-teal-900">
                  Распознать Pantone/HEX
                </DialogTitle>
                <DialogDescription className="text-xs text-teal-700/80">
                  Загрузите изображение или введите примерное описание цвета, чтобы нейросеть
                  подобрала точный Pantone TCX/TPG или HEX.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex min-h-[300px] flex-col items-center justify-center space-y-5 bg-slate-50 p-6">
            {aiColorLoading ? (
              <>
                <LucideIcons.Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-xs font-medium text-teal-700">
                  Анализ изображения и поиск по библиотекам Pantone...
                </p>
              </>
            ) : (
              <>
                <div className="w-full space-y-3">
                  <div className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 transition-colors hover:bg-slate-50">
                    <LucideIcons.UploadCloud className="mb-2 h-8 w-8 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">Загрузить фото</p>
                    <p className="mt-1 text-center text-[10px] text-slate-500">JPEG, PNG до 5MB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">ИЛИ</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <Input
                    placeholder="Опишите цвет (например: 'пыльная роза', 'navy blue')"
                    className="h-9 bg-white text-sm"
                    value={aiColorPrompt}
                    onChange={(e) => setAiColorPrompt(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-teal-600 text-white hover:bg-teal-700"
                  onClick={async () => {
                    setAiColorLoading(true);
                    try {
                      const res = await fetch('/api/brand/workshop2/ai/pantone', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ description: aiColorPrompt }),
                      });
                      const data = (await res.json()) as { hex?: string; label?: string };
                      if (data.hex && data.label) {
                        patchColor({ freeText: `${data.hex} · ${data.label}` });
                      }
                    } catch (error) {
                      workshop2DevWarn('component', 'Failed to resolve pantone color', {
                        cause: error,
                      });
                    } finally {
                      setAiColorLoading(false);
                      setAiColorOpen(false);
                    }
                  }}
                >
                  Распознать
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
