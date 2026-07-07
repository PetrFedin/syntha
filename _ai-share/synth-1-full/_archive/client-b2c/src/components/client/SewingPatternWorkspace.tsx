'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SewingCategoryBar } from '@/components/client/SewingCategoryBar';
import { SewingPatternFormColumn } from '@/components/client/SewingPatternFormColumn';
import { useSewingPatternWorkspace } from '@/components/client/useSewingPatternWorkspace';
import { useToast } from '@/hooks/use-toast';
import {
  readSewingUiLocale,
  sewingPatternsMessagesEn,
  writeSewingUiLocale,
  type SewingPatternsLocale,
} from '@/lib/pattern-drafting/sewing-patterns-dictionary';
import { sewingPatternsMessages } from '@/lib/pattern-drafting/sewing-patterns-messages';
import { Info, Loader2, Ruler, Scissors } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

export function SewingPatternWorkspace() {
  const w = useSewingPatternWorkspace();
  const { toast } = useToast();
  const [uiLocale, setUiLocale] = useState<SewingPatternsLocale>('ru');
  const [measureSource, setMeasureSource] = useState<'form' | 'profile' | 'server'>('form');
  useEffect(() => {
    setUiLocale(readSewingUiLocale());
  }, []);
  const m = useMemo(
    () => (uiLocale === 'en' ? sewingPatternsMessagesEn : sewingPatternsMessages),
    [uiLocale]
  );

  const showMeasureSourcePicker =
    w.profileMeasureMismatch || w.serverFormMismatch || w.profileVsServerMismatch;

  useEffect(() => {
    if (!showMeasureSourcePicker) setMeasureSource('form');
  }, [showMeasureSourcePicker]);

  const onCommitIntent = async () => {
    const r = await w.commitIntentToServer();
    if (r.ok) {
      const desc = r.categoryHandbook
        ? m.commitIntentSuccessWithSchema(
            r.pathLabel ?? w.pathLabel,
            r.categoryHandbook.schemaVersion,
            r.categoryHandbook.generatedAt
          )
        : m.commitIntentSuccessSimple(r.pathLabel ?? w.pathLabel);
      toast({ title: m.commitIntentSuccess, description: desc });
      return;
    }
    if (r.error === 'aborted') {
      toast({ title: m.commitIntentError, description: m.commitIntentErrorAborted });
      return;
    }
    if (r.error === 'offline') {
      toast({ title: m.commitIntentError, description: m.commitOffline, variant: 'destructive' });
      return;
    }
    if (r.error === 'network') {
      toast({
        title: m.commitIntentError,
        description: m.commitIntentErrorNetwork,
        variant: 'destructive',
      });
      return;
    }
    if (r.error === 'rate_limited') {
      toast({
        title: m.commitIntentError,
        description: m.commitIntentErrorRateLimited,
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: m.commitIntentError,
      description: m.commitIntentErrorCode(r.error),
      variant: 'destructive',
    });
  };

  return (
    <>
      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-slate-900">{m.introTitle}</p>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={uiLocale === 'ru' ? 'secondary' : 'ghost'}
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    writeSewingUiLocale('ru');
                    setUiLocale('ru');
                  }}
                  aria-pressed={uiLocale === 'ru'}
                >
                  {m.uiLocaleShortRu}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={uiLocale === 'en' ? 'secondary' : 'ghost'}
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    writeSewingUiLocale('en');
                    setUiLocale('en');
                  }}
                  aria-pressed={uiLocale === 'en'}
                >
                  {m.uiLocaleShortEn}
                </Button>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              <span className="font-medium text-slate-800">{m.introClientLabel}</span>
              {m.introAfterClient}
              <span className="font-medium text-slate-800">{m.introBrandLabel}</span>
              {m.introAfterBrand}
              <span className="font-medium text-slate-800">{m.introWardrobeName}</span>
              {m.introAfterWardrobe}
              <Link className="text-emerald-700 underline" href={ROUTES.client.fitProfile}>
                {m.introLinkProfile}
              </Link>
              {m.introAfterLink}
            </p>
          </div>
        </div>
      </div>

      {showMeasureSourcePicker && (
        <Card className="mb-3" role="region" aria-label={m.measureSourceTitle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{m.measureSourceTitle}</CardTitle>
            <CardDescription className="text-xs">{m.measureSourceDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <RadioGroup
              className="grid gap-2 sm:grid-cols-3"
              value={measureSource}
              onValueChange={(v) => setMeasureSource(v as 'form' | 'profile' | 'server')}
            >
              <div className="flex items-center space-x-2 rounded-md border border-slate-200/80 p-2">
                <RadioGroupItem value="form" id="sew-ms-form" />
                <Label htmlFor="sew-ms-form" className="cursor-pointer text-xs font-normal">
                  {m.measureSourceForm}
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border border-slate-200/80 p-2">
                <RadioGroupItem value="profile" id="sew-ms-profile" disabled={!w.hasBodyProfile} />
                <Label
                  htmlFor="sew-ms-profile"
                  className={
                    w.hasBodyProfile
                      ? 'cursor-pointer text-xs font-normal'
                      : 'text-xs font-normal text-muted-foreground'
                  }
                >
                  {m.measureSourceProfile}
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border border-slate-200/80 p-2">
                <RadioGroupItem
                  value="server"
                  id="sew-ms-server"
                  disabled={!w.hasServerIntentSnapshot}
                />
                <Label
                  htmlFor="sew-ms-server"
                  className={
                    w.hasServerIntentSnapshot
                      ? 'cursor-pointer text-xs font-normal'
                      : 'text-xs font-normal text-muted-foreground'
                  }
                >
                  {m.measureSourceServer}
                </Label>
              </div>
            </RadioGroup>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={
                  measureSource === 'form' ||
                  (measureSource === 'profile' && !w.hasBodyProfile) ||
                  (measureSource === 'server' && !w.hasServerIntentSnapshot)
                }
                onClick={() => {
                  if (measureSource === 'profile') w.applyMeasuresFromProfile();
                  if (measureSource === 'server') w.applyMeasuresFromServer();
                }}
                data-testid="sewing-measure-apply"
              >
                {m.measureSourceApply}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <SewingCategoryBar
        catL1={w.catL1}
        setCatL1={w.setCatL1}
        catL2={w.catL2}
        setCatL2={w.setCatL2}
        catL3={w.catL3}
        setCatL3={w.setCatL3}
        isApparelSewing={w.isApparelSewing}
        pathLabel={w.pathLabel}
        leafName={w.leafName}
        garment={w.garment}
        setGarment={w.setGarment}
        messages={m}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          title={!w.isOnline ? m.commitOffline : undefined}
          disabled={w.commitPending || !w.handbookLeafId || !w.isOnline}
          onClick={() => void onCommitIntent()}
          data-testid="sewing-commit-intent"
        >
          {w.commitPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
          {m.commitIntentButton}
        </Button>
        <span className="text-[11px] text-muted-foreground">{m.commitIntentHint}</span>
      </div>

      <ol className="mb-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground sm:mb-4 sm:gap-4 sm:text-xs">
        <li className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
            1
          </span>
          {m.funnelStep1}
        </li>
        <li className="text-slate-300 sm:inline">→</li>
        <li className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-600">
            2
          </span>
          <Ruler className="h-3.5 w-3.5" />
          {m.funnelStep2}
        </li>
        <li className="text-slate-300 sm:inline">→</li>
        <li className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-600">
            3
          </span>
          <Scissors className="h-3.5 w-3.5" />
          {m.funnelStep3}
        </li>
      </ol>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_minmax(0,0.55fr)]">
        <SewingPatternFormColumn
          w={w}
          download={w.download}
          reset={w.reset}
          isApparelSewing={w.isApparelSewing}
          messages={m}
          svgExportDisabled={w.svgExportDisabled}
        />

        <Card
          className={!w.isApparelSewing ? 'opacity-90' : undefined}
          data-testid="sewing-preview-card"
        >
          <CardHeader>
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-600">
                3
              </span>
              <CardTitle className="text-base">{m.stepPreviewTitle}</CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal text-slate-600">
                {m.educationalDraftBadge}
              </Badge>
            </div>
            <CardDescription>
              {m.previewFileDescription(
                w.result.widthMm,
                w.result.heightMm,
                w.result.downloadFileName
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`relative max-h-[70vh] overflow-auto rounded-md border border-slate-200 bg-white ${w.isApparelSewing ? 'min-h-[320px]' : 'min-h-[200px]'}`}
              style={{ touchAction: 'pan-y pinch-zoom' as const }}
            >
              <div
                className="inline-block min-w-full p-3"
                style={{ transform: `scale(${w.zoomPct / 100})`, transformOrigin: 'top left' }}
                dangerouslySetInnerHTML={{ __html: w.result.svg }}
              />
            </div>
            <ul className="mt-2 max-h-32 space-y-0.5 overflow-y-auto text-[11px] text-muted-foreground">
              {w.result.notes.map((n) => (
                <li key={n}>· {n}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{m.metricsBlockTitle}</CardTitle>
            <CardDescription>{m.metricsBlockDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            {w.result.buildLog.map((row) => (
              <div
                key={row.key}
                className="flex justify-between gap-2 border-b border-slate-100 py-0.5"
              >
                <span className="text-slate-600">{row.key}</span>
                <span className="font-mono text-slate-900">
                  {row.value} {row.unit ?? ''}
                </span>
              </div>
            ))}
            {w.result.buildLog.length === 0 && (
              <p className="text-muted-foreground">
                {w.isApparelSewing ? '—' : m.nonApparelMetricsEmpty}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {process.env.NEXT_PUBLIC_SEWING_PRESET_EDITOR === '1' && (
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          <Link
            href={ROUTES.client.sewingPatternsPresetEditor}
            className="underline decoration-dotted underline-offset-2"
          >
            Редактор JSON-оверрайдов пресетов
          </Link>
        </p>
      )}
    </>
  );
}
