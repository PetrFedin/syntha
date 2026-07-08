'use client';

import { useEffect, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Workshop2CompositionLabelSizePresetSelect } from '@/components/brand/production/Workshop2CompositionLabelSizePresetSelect';
import { W2_COMPOSITION_LABEL_PHYSICAL_OPTIONS } from '@/lib/production/workshop2-composition-label-spec-constants';
import type { Workshop2CompositionLabelSectionNeed } from '@/lib/production/workshop2-composition-label-from-tz';
import type {
  Workshop2CompositionLabelPhysicalKind,
  Workshop2CompositionLabelSpec,
} from '@/lib/production/workshop2-dossier-phase1.types';

type PrintColorMode = NonNullable<Workshop2CompositionLabelSpec['printColorMode']>;
import { cn } from '@/lib/utils';

function patchSpec(
  prev: Workshop2CompositionLabelSpec | undefined,
  patch: Partial<Workshop2CompositionLabelSpec>
): Workshop2CompositionLabelSpec {
  return { ...(prev ?? {}), ...patch };
}

export function Workshop2CompositionLabelDimensionsSection({
  spec,
  onChange,
  readOnly,
  need,
  dossierMissing,
}: {
  spec: Workshop2CompositionLabelSpec | undefined;
  onChange: (next: Workshop2CompositionLabelSpec) => void;
  readOnly: boolean;
  need: Set<Workshop2CompositionLabelSectionNeed>;
  dossierMissing: boolean;
}) {
  const ro = readOnly;
  const s = spec ?? {};
  const specRef = useRef(s);
  useEffect(() => {
    specRef.current = s;
  }, [s]);
  const patch = (delta: Partial<Workshop2CompositionLabelSpec>) =>
    onChange(patchSpec(specRef.current, delta));
  const physical = (s.physicalMaterial ?? '') as Workshop2CompositionLabelPhysicalKind | '';
  const sourcesAlert =
    need.has('fiber_tz_gap') ||
    need.has('fiber_constructor_sum') ||
    need.has('care_tz_gap') ||
    need.has('manufacturer_tz_gap');

  return (
    <>
      <div className="space-y-2">
        <p
          className={cn(
            'text-xs font-medium',
            need.has('dimensions') || need.has('physical') ? 'text-red-600' : 'text-text-primary'
          )}
        >
          Габариты и материал полотна
        </p>
        <Workshop2CompositionLabelSizePresetSelect spec={s} onChange={onChange} readOnly={ro} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              className={cn('text-xs font-medium', need.has('dimensions') ? 'text-red-600' : '')}
            >
              Ширина бирки, мм
            </Label>
            <Input
              className="h-9 text-xs"
              inputMode="decimal"
              disabled={ro}
              value={s.labelWidthMm ?? ''}
              onChange={(e) => patch({ labelWidthMm: e.target.value, labelSizePresetId: '' })}
              placeholder="напр. 50"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              className={cn('text-xs font-medium', need.has('dimensions') ? 'text-red-600' : '')}
            >
              Высота / длина, мм
            </Label>
            <Input
              className="h-9 text-xs"
              inputMode="decimal"
              disabled={ro}
              value={s.labelHeightMm ?? ''}
              onChange={(e) => patch({ labelHeightMm: e.target.value, labelSizePresetId: '' })}
              placeholder="напр. 120"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Припуск печати, мм</Label>
            <Input
              className="h-9 text-xs"
              inputMode="decimal"
              disabled={ro}
              value={s.labelBleedMm ?? ''}
              onChange={(e) => patch({ labelBleedMm: e.target.value })}
              placeholder="напр. 2"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Безопасное поле от обреза, мм</Label>
            <Input
              className="h-9 text-xs"
              inputMode="decimal"
              disabled={ro}
              value={s.labelSafeInsetMm ?? ''}
              onChange={(e) => patch({ labelSafeInsetMm: e.target.value })}
              placeholder="напр. 3"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Цветность печати (подсказка)</Label>
            <Select
              disabled={ro}
              value={(s.printColorMode ?? '') || 'unset'}
              onValueChange={(v) =>
                patch({ printColorMode: v === 'unset' ? '' : (v as PrintColorMode) })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Не задано" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unset" className="text-xs">
                  Не задано
                </SelectItem>
                <SelectItem value="bw" className="text-xs">
                  Ч/б
                </SelectItem>
                <SelectItem value="cmyk" className="text-xs">
                  CMYK
                </SelectItem>
                <SelectItem value="spot" className="text-xs">
                  Пантоны / spot
                </SelectItem>
                <SelectItem value="other" className="text-xs">
                  Иное (см. примечания технолога)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Разрешение / растр (подсказка)</Label>
            <Input
              className="h-9 text-xs"
              disabled={ro}
              value={s.printDpiNote ?? ''}
              onChange={(e) => patch({ printDpiNote: e.target.value })}
              placeholder="напр. 300 DPI, 55 LPI жаккард"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              className={cn('text-xs font-medium', need.has('physical') ? 'text-red-600' : '')}
            >
              Тип полотна (фильтр)
            </Label>
            <Select
              disabled={ro}
              value={physical || 'unset'}
              onValueChange={(v) =>
                patch({
                  physicalMaterial:
                    v === 'unset' ? '' : (v as Workshop2CompositionLabelPhysicalKind),
                })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {W2_COMPOSITION_LABEL_PHYSICAL_OPTIONS.map((o) => (
                  <SelectItem
                    key={o.id}
                    value={o.id}
                    className="text-xs"
                    title={o.hint || undefined}
                  >
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Свой текст полотна / уточнение</Label>
            <Input
              className="h-9 text-xs"
              disabled={ro}
              value={s.physicalMaterialNote ?? ''}
              onChange={(e) => patch({ physicalMaterialNote: e.target.value })}
              placeholder="При «Другое» — обязательно; иначе уточнение к выбранному типу"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p
          className={cn('text-xs font-medium', sourcesAlert ? 'text-red-600' : 'text-text-primary')}
        >
          Что войдёт в финальный текст (источники из ТЗ)
        </p>
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-start gap-2 text-xs leading-snug">
            <Checkbox
              disabled={ro}
              checked={Boolean(s.includeFiberCompositionFromTz)}
              onCheckedChange={(v) => patch({ includeFiberCompositionFromTz: v === true })}
            />
            <span>
              <span
                className={cn(
                  'font-medium',
                  need.has('fiber_tz_gap') ? 'text-red-600' : 'text-text-primary'
                )}
              >
                Сырьевой состав в %
              </span>{' '}
              — из ТЗ (mat / composition).{' '}
              {dossierMissing ? (
                <span className="text-text-muted">
                  (превью ТЗ: нет досье в этом месте — только в карточке ТЗ.)
                </span>
              ) : null}
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 text-xs leading-snug">
            <Checkbox
              disabled={ro}
              checked={Boolean(s.includeCareSymbolsFromTz)}
              onCheckedChange={(v) => patch({ includeCareSymbolsFromTz: v === true })}
            />
            <span>
              <span
                className={cn(
                  'font-medium',
                  need.has('care_tz_gap') ? 'text-red-600' : 'text-text-primary'
                )}
              >
                Рекомендации по уходу
              </span>{' '}
              — классы стирки и температура из ТЗ; при отсутствии — доп. текст или знаки ниже в
              конструкторе.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 text-xs leading-snug">
            <Checkbox
              disabled={ro}
              checked={Boolean(s.includeManufacturerFromTz)}
              onCheckedChange={(v) => patch({ includeManufacturerFromTz: v === true })}
            />
            <span>
              <span
                className={cn(
                  'font-medium',
                  need.has('manufacturer_tz_gap') ? 'text-red-600' : 'text-text-primary'
                )}
              >
                Производитель / маркировка
              </span>{' '}
              — из маркировки, упаковки, штрихкода, заметок бренда и страны происхождения (если
              заполнены).
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Дополнительно для текста бирки (вручную)</Label>
        <Textarea
          className="min-h-[72px] text-xs"
          disabled={ro}
          value={s.extraLegalLines ?? ''}
          onChange={(e) => patch({ extraLegalLines: e.target.value })}
          placeholder="Юридический адрес, регистрационный знак, EAC, артикул на бирке, телефон горячей линии…"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Примечания технолога к финальной вёрстке</Label>
        <Textarea
          className="min-h-[64px] text-xs"
          disabled={ro}
          data-testid="workshop2-dossier-composition-technologist-notes"
          value={s.technologistNotes ?? ''}
          onChange={(e) => patch({ technologistNotes: e.target.value })}
          placeholder="Особенности печати, двухсторонняя бирка, языки, запреты формулировок…"
        />
      </div>

      <div className="border-border-subtle bg-bg-surface2/50 text-text-secondary space-y-2 rounded-lg border border-dashed p-3 text-xs leading-snug">
        <p className="text-text-primary text-xs font-medium">Справка по типам материалов бирки</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <span className="text-text-primary font-medium">Сатин</span> — мягкий материал, не
            раздражает кожу.
          </li>
          <li>
            <span className="text-text-primary font-medium">Нейлон</span> — плотный, держит форму.
          </li>
          <li>
            <span className="text-text-primary font-medium">Жаккард</span> — тканый ярлык с
            логотипом в структуре.
          </li>
        </ul>
      </div>
    </>
  );
}
