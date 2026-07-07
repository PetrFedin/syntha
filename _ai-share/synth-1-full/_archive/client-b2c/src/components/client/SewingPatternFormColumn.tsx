'use client';

import { cn } from '@/lib/utils';
import { getSewingPatternsDictionary } from '@/lib/pattern-drafting/sewing-patterns-dictionary';
import type { SewingPatternsMessages } from '@/lib/pattern-drafting/sewing-patterns-messages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SewingPatternGarmentBlock } from '@/lib/pattern-drafting/sewing-pattern.types';
import { Scissors, ZoomIn, Download } from 'lucide-react';
import { useSewingPatternWorkspace } from '@/components/client/useSewingPatternWorkspace';
import { parseSewingNum } from '@/lib/pattern-drafting/sewing-measure-parse';

type W = ReturnType<typeof useSewingPatternWorkspace>;

export function SewingPatternFormColumn(p: {
  w: W;
  download: () => void;
  reset: () => void;
  isApparelSewing: boolean;
  messages?: SewingPatternsMessages;
  /** `NEXT_PUBLIC_SEWING_DISABLE_SVG_EXPORT=1` — скрыть скачивание SVG. */
  svgExportDisabled?: boolean;
}) {
  const m = p.messages ?? getSewingPatternsDictionary();
  const { w } = p;
  return (
    <Card>
      <CardHeader>
        <div className="mb-0.5 flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
            2
          </span>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scissors className="h-4 w-4" />
            Мерки и опции
          </CardTitle>
        </div>
        <CardDescription>
          {p.isApparelSewing ? m.formDescriptionApparel : m.formDescriptionNonApparel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!p.isApparelSewing && <p className="text-xs text-amber-900/80">{m.formDimmedNote}</p>}
        <div className={cn('space-y-3 transition-opacity', !p.isApparelSewing && 'opacity-[0.5]')}>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['sp-bust', 'Грудь', w.bust, w.setBust],
                ['sp-waist', 'Талия', w.waist, w.setWaist],
                ['sp-hip', 'Бёдра', w.hip, w.setHip],
                ['sp-shoulder', 'Плечо', w.shoulder, w.setShoulder],
                ['sp-h', 'Рост', w.height, w.setHeight],
              ] as const
            ).map(([id, label, v, set]) => (
              <div key={id} className="space-y-1">
                <Label htmlFor={id} className="text-xs">
                  {label}
                </Label>
                <Input
                  id={id}
                  inputMode="decimal"
                  value={v}
                  onChange={(e) => set(e.target.value)}
                  className="h-8"
                />
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <Label>Деталь</Label>
            <Select
              value={w.garment}
              onValueChange={(v) => w.setGarment(v as SewingPatternGarmentBlock)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bodice_front">Лиф переда</SelectItem>
                <SelectItem value="bodice_back">Лиф спинка</SelectItem>
                <SelectItem value="skirt_front">Юбка переда</SelectItem>
                <SelectItem value="skirt_back">Юбка зад (CB)</SelectItem>
                <SelectItem value="sleeve">Рукав 1/2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Ease грудь</Label>
              <Slider
                value={[w.easeB]}
                onValueChange={(v) => w.setEaseB(v[0] ?? 4)}
                min={0}
                max={10}
                step={0.5}
              />
              <p className="text-[10px] text-muted-foreground">{w.easeB}</p>
            </div>
            <div>
              <Label className="text-xs">Ease талия</Label>
              <Slider
                value={[w.easeW]}
                onValueChange={(v) => w.setEaseW(v[0] ?? 2)}
                min={0}
                max={8}
                step={0.5}
              />
              <p className="text-[10px] text-muted-foreground">{w.easeW}</p>
            </div>
            <div>
              <Label className="text-xs">Ease бедро</Label>
              <Slider
                value={[w.easeH]}
                onValueChange={(v) => w.setEaseH(v[0] ?? 3)}
                min={0}
                max={8}
                step={0.5}
              />
              <p className="text-[10px] text-muted-foreground">{w.easeH}</p>
            </div>
          </div>
          {w.garment.startsWith('skirt') && (
            <div className="space-y-1">
              <Label>Длина юбки от талии, см</Label>
              <Input
                inputMode="decimal"
                value={String(w.skirtLen)}
                onChange={(e) => w.setSkirtLen(parseSewingNum(e.target.value, 62))}
              />
            </div>
          )}
          {w.garment === 'bodice_front' && (
            <div className="space-y-1">
              <Label>Глубина горловины переда, см</Label>
              <Input
                inputMode="decimal"
                value={String(w.neckDrop)}
                onChange={(e) => w.setNeckDrop(parseSewingNum(e.target.value, 2.4))}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Вытачки / линии</Label>
            {w.garment.startsWith('skirt') && (
              <div className="flex items-center gap-2 text-sm">
                <Checkbox
                  id="d-ws"
                  checked={w.darts.waistDart}
                  onCheckedChange={(c) => w.setDart('waistDart', c === true)}
                />
                <label htmlFor="d-ws">К бёдрам/талии (юбка)</label>
              </div>
            )}
            {w.garment === 'sleeve' && (
              <p className="text-xs text-muted-foreground">Окат — кривые; дарт в этой схеме нет.</p>
            )}
            {w.garment === 'bodice_front' && (
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="d-s"
                    checked={w.darts.shoulderDart}
                    onCheckedChange={(c) => w.setDart('shoulderDart', c === true)}
                  />
                  <label htmlFor="d-s">К плечу</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="d-b"
                    checked={w.darts.bustSideDart}
                    onCheckedChange={(c) => w.setDart('bustSideDart', c === true)}
                  />
                  <label htmlFor="d-b">Бок (грудь)</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="d-w"
                    checked={w.darts.waistDart}
                    onCheckedChange={(c) => w.setDart('waistDart', c === true)}
                  />
                  <label htmlFor="d-w">К талии</label>
                </div>
              </div>
            )}
            {w.garment === 'bodice_back' && (
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="d-sb"
                    checked={w.darts.shoulderDart}
                    onCheckedChange={(c) => w.setDart('shoulderDart', c === true)}
                  />
                  <label htmlFor="d-sb">К плечу</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="d-wb"
                    checked={w.darts.waistDart}
                    onCheckedChange={(c) => w.setDart('waistDart', c === true)}
                  />
                  <label htmlFor="d-wb">К талии</label>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Припуск, мм: {w.seam}</Label>
            <Slider
              value={[w.seam]}
              onValueChange={(v) => w.setSeam(v[0] ?? 10)}
              min={0}
              max={20}
              step={0.5}
            />
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Checkbox
                id="c-seam"
                checked={w.showSeam}
                onCheckedChange={(c) => w.setShowSeam(c === true)}
              />
              <label htmlFor="c-seam">Линия припуска</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="c-g"
                checked={w.showGrain}
                onCheckedChange={(c) => w.setShowGrain(c === true)}
              />
              <label htmlFor="c-g">Нитка долевая</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="c-d"
                checked={w.showDim}
                onCheckedChange={(c) => w.setShowDim(c === true)}
              />
              <label htmlFor="c-d">Метка 1:1</label>
            </div>
          </div>

          {p.isApparelSewing && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ZoomIn className="h-3.5 w-3.5" /> Масштаб
                </span>
                {w.zoomPct}%
              </div>
              <Slider
                value={[w.zoomPct]}
                onValueChange={(v) => w.setZoomPct(v[0] ?? 100)}
                min={50}
                max={200}
                step={5}
              />
            </div>
          )}

          <div className="space-y-1.5">
            {p.svgExportDisabled && (
              <p className="text-[11px] text-muted-foreground">{m.svgExportDisabledHint}</p>
            )}
            <div className="flex gap-2">
              {!p.svgExportDisabled && (
                <Button type="button" variant="outline" className="flex-1" onClick={p.download}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  SVG
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                className={p.svgExportDisabled ? 'w-full' : 'flex-1'}
                onClick={p.reset}
              >
                Сброс
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
