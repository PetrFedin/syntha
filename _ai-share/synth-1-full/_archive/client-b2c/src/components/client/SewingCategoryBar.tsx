'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  getSewingL1Options,
  getSewingL2Options,
  getSewingL3Options,
} from '@/lib/pattern-drafting/sewing-apparel-category-tree';
import { resolveSewingCategoryPreset } from '@/lib/pattern-drafting/sewing-category-presets';
import { getSewingPatternsDictionary } from '@/lib/pattern-drafting/sewing-patterns-dictionary';
import type { SewingPatternsMessages } from '@/lib/pattern-drafting/sewing-patterns-messages';
import type { SewingPatternGarmentBlock } from '@/lib/pattern-drafting/sewing-pattern.types';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Copy, Package, Sparkles, Info } from 'lucide-react';

const GARMENT_SHORT: Record<SewingPatternGarmentBlock, string> = {
  bodice_front: 'Перед',
  bodice_back: 'Спинка',
  skirt_front: 'Юбка',
  skirt_back: 'Юбка зад',
  sleeve: 'Рукав',
};

type Props = {
  catL1: string;
  setCatL1: (s: string) => void;
  catL2: string;
  setCatL2: (s: string) => void;
  catL3: string;
  setCatL3: (s: string) => void;
  isApparelSewing: boolean;
  pathLabel: string;
  leafName: string;
  garment: SewingPatternGarmentBlock;
  setGarment: (g: SewingPatternGarmentBlock) => void;
  /** Переопределение словаря (например переключатель RU/EN в родителе). */
  messages?: SewingPatternsMessages;
};

export function SewingCategoryBar(p: Props) {
  const m = p.messages ?? getSewingPatternsDictionary();
  const { toast } = useToast();
  const l1List = useMemo(() => getSewingL1Options(), []);
  const l2List = useMemo(() => getSewingL2Options(p.catL1), [p.catL1]);
  const l3List = useMemo(() => getSewingL3Options(p.catL1, p.catL2), [p.catL1, p.catL2]);
  const preset = useMemo(
    () => (p.isApparelSewing ? resolveSewingCategoryPreset(p.catL2, p.leafName) : null),
    [p.isApparelSewing, p.catL2, p.leafName]
  );

  const copyNote = () => {
    const text = p.isApparelSewing
      ? `${p.pathLabel}\n${preset?.forBrandNote ?? ''}`
      : `${p.pathLabel}\n(категория: не одежда — ориентиры кроя к инструменту «лекала» не применялись).`;
    void navigator.clipboard.writeText(text);
    toast({ title: m.copyCategorySnapshot, description: m.copyCategoryDescription });
  };

  return (
    <Card className="border-l-4 border-l-emerald-600/90 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-emerald-700" />
              Категория каталога
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Ур.1–3 из справочника Syntha (category-handbook, «Каталог»). Один и тот же{' '}
              <span className="font-medium">leafId</span>, что в MES. Ориентиры ease/деталей —
              только для одежды; крой утверждает бренд.
            </p>
          </div>
          <Badge
            data-testid="sewing-path-badge"
            variant="secondary"
            className="max-w-full whitespace-normal text-left font-normal"
          >
            {p.pathLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!p.isApparelSewing && (
          <div
            role="status"
            aria-live="polite"
            className="relative w-full rounded-lg border border-slate-200 bg-slate-50 p-4 pl-10 text-slate-800"
          >
            <Info className="absolute left-3 top-4 h-4 w-4 text-slate-500" aria-hidden />
            <p className="text-sm font-medium leading-none tracking-tight">
              {m.nonApparelBannerTitle}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{m.nonApparelBannerBody}</p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ур.1 (корень)</Label>
            <Select value={p.catL1} onValueChange={p.setCatL1}>
              <SelectTrigger data-testid="sewing-select-l1">
                <SelectValue placeholder="Направление" />
              </SelectTrigger>
              <SelectContent>
                {l1List.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ур.2 (группа)</Label>
            <Select value={p.catL2} onValueChange={p.setCatL2}>
              <SelectTrigger data-testid="sewing-select-l2">
                <SelectValue placeholder="Группа" />
              </SelectTrigger>
              <SelectContent>
                {l2List.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ур.3 (подтип / лист)</Label>
            {l3List.length > 0 ? (
              <Select value={p.catL3} onValueChange={p.setCatL3}>
                <SelectTrigger data-testid="sewing-select-l3">
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  {l3List.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex h-9 items-center rounded-md border border-dashed border-slate-200 bg-slate-50/80 px-3 text-xs text-muted-foreground">
                Нет L3
              </div>
            )}
          </div>
        </div>

        {preset && p.isApparelSewing && (
          <div className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1.5 text-sm text-slate-700">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-600" />
              <span className="leading-snug">
                <span className="font-medium text-slate-900">Лист: </span>
                {p.leafName}
                <span className="text-muted-foreground"> — </span>
                {preset.summary}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 text-xs"
                onClick={copyNote}
              >
                <Copy className="mr-1 h-3 w-3" />В буфер для бренда
              </Button>
              {[preset.primary, ...preset.alternates]
                .filter((g, i, a) => a.indexOf(g) === i)
                .map((g) => (
                  <Button
                    key={g}
                    type="button"
                    size="sm"
                    variant={p.garment === g ? 'default' : 'outline'}
                    className="h-7 text-xs"
                    onClick={() => p.setGarment(g)}
                  >
                    {GARMENT_SHORT[g] ?? g}
                  </Button>
                ))}
              {p.garment === preset.primary && (
                <span className="ml-0 flex items-center gap-0.5 text-[10px] text-emerald-700 sm:ml-1">
                  <CheckCircle2 className="h-3 w-3" /> Ориентир
                </span>
              )}
            </div>
          </div>
        )}

        {!p.isApparelSewing && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <p className="text-xs text-slate-600">{m.nonApparelPathOnlyHint}</p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 text-xs"
              onClick={copyNote}
            >
              <Copy className="mr-1 h-3 w-3" />
              Скопировать путь
            </Button>
          </div>
        )}

        <Separator />
      </CardContent>
    </Card>
  );
}
