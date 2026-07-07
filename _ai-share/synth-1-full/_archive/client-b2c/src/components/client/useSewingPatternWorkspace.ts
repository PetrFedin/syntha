'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { getOrCreateClientDeviceId } from '@/lib/client/client-device-id';
import type {
  SewingOrderIntentServerRecordV1,
  SewingOrderMeasureStrings,
} from '@/lib/client/sewing-order-intent';
import { sameMeasureStrings } from '@/lib/client/sewing-order-intent';
import {
  NON_APPAREL_SEWING_PATTERN_RESULT,
  buildSewingPattern,
  defaultSewingDraftOptions,
} from '@/lib/pattern-drafting/build-sewing-pattern';
import type {
  SewingPatternDartToggles,
  SewingPatternGarmentBlock,
} from '@/lib/pattern-drafting/sewing-pattern.types';
import { loadBodyProfile } from '@/lib/fashion/fit-match-logic';
import {
  getDefaultSewingCategorySelection,
  getSewingEffectiveLeaf,
  getSewingL1Options,
  getSewingL2Options,
  getSewingL3Options,
} from '@/lib/pattern-drafting/sewing-apparel-category-tree';
import { resolveSewingCategoryPreset } from '@/lib/pattern-drafting/sewing-category-presets';
import { SEWING_PRESET_RULES_CHANGED_EVENT } from '@/lib/pattern-drafting/sewing-preset-declarative';
import {
  readSewingPatternIntentV1,
  readStoredSewingLeafId,
  writeSewingPatternIntentV1,
  writeStoredSewingLeafId,
} from '@/lib/pattern-drafting/sewing-pattern-leaf-storage';
import type { SewingPatternResult } from '@/lib/pattern-drafting/sewing-pattern.types';
import { logObservability, reportError } from '@/lib/logger';
import { getUnknownErrorName } from '@/lib/unknown-error-message';
import { findHandbookLeafById } from '@/lib/production/category-handbook-leaves';
import { applyInstructionalWatermarkToSvg } from '@/lib/pattern-drafting/sewing-svg-educational';
import {
  parseSewingNum,
  SEWING_DEFAULT_MEASURES as SEWING_DEF,
} from '@/lib/pattern-drafting/sewing-measure-parse';

export { parseSewingNum, SEWING_DEF };

function sewingFunnelAbContext(): { abVariant?: string } {
  if (typeof window === 'undefined') return {};
  const v = process.env.NEXT_PUBLIC_SEWING_FUNNEL_VARIANT?.trim();
  return v ? { abVariant: v } : {};
}

export type SewingIntentCommitResult =
  | {
      ok: true;
      canonicalId: string;
      pathLabel?: string;
      categoryHandbook?: { schemaVersion: number; generatedAt: string };
      record?: SewingOrderIntentServerRecordV1;
    }
  | { ok: false; error: string; aborted?: boolean };

function subscribeOnline(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);
  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
}

function getOnlineClient(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

const def = getDefaultSewingCategorySelection();

export function useSewingPatternWorkspace() {
  const { user } = useAuth();
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineClient, () => true);
  const svgExportDisabled = process.env.NEXT_PUBLIC_SEWING_DISABLE_SVG_EXPORT === '1';
  const [bust, setBust] = useState(String(SEWING_DEF.bust));
  const [waist, setWaist] = useState(String(SEWING_DEF.waist));
  const [hip, setHip] = useState(String(SEWING_DEF.hip));
  const [shoulder, setShoulder] = useState(String(SEWING_DEF.shoulder));
  const [height, setHeight] = useState(String(SEWING_DEF.height));
  const [garment, setGarment] = useState<SewingPatternGarmentBlock>('bodice_front');
  const [darts, setDarts] = useState<SewingPatternDartToggles>({
    shoulderDart: true,
    bustSideDart: true,
    waistDart: true,
  });
  const [easeB, setEaseB] = useState(4);
  const [easeW, setEaseW] = useState(2);
  const [easeH, setEaseH] = useState(3);
  const [seam, setSeam] = useState(10);
  const [neckDrop, setNeckDrop] = useState(2.4);
  const [skirtLen, setSkirtLen] = useState(62);
  const [showSeam, setShowSeam] = useState(true);
  const [showGrain, setShowGrain] = useState(true);
  const [showDim, setShowDim] = useState(false);
  const [zoomPct, setZoomPct] = useState(100);

  const [catL1, setCatL1State] = useState(def.l1);
  const [catL2, setCatL2State] = useState(def.l2);
  const [catL3, setCatL3State] = useState(def.l3);
  const storageRead = useRef(false);
  const prevL1Ref = useRef<string | null>(null);
  const commitAbortRef = useRef<AbortController | null>(null);
  const [commitPending, setCommitPending] = useState(false);
  const [serverIntentBaseline, setServerIntentBaseline] =
    useState<SewingOrderIntentServerRecordV1 | null>(null);
  /** Смена JSON-правил пресетов (мини-редактор) — пересчитать ease/деталь. */
  const [presetRulesRevision, setPresetRulesRevision] = useState(0);

  const isApparelSewing = catL1 === 'Одежда';
  const { pathLabel, leafName, leafId } = getSewingEffectiveLeaf(catL1, catL2, catL3);

  const currentMeasures: SewingOrderMeasureStrings = useMemo(
    () => ({ bust, waist, hip, shoulder, height }),
    [bust, waist, hip, shoulder, height]
  );

  const profileMeasureMismatch = useMemo(() => {
    const p = loadBodyProfile();
    if (!p) return false;
    const d = 0.75;
    if (p.chest && Math.abs(parseSewingNum(bust, SEWING_DEF.bust) - p.chest) > d) return true;
    if (p.waist && Math.abs(parseSewingNum(waist, SEWING_DEF.waist) - p.waist) > d) return true;
    if (p.hips && Math.abs(parseSewingNum(hip, SEWING_DEF.hip) - p.hips) > d) return true;
    if (p.height && Math.abs(parseSewingNum(height, SEWING_DEF.height) - p.height) > 1) return true;
    return false;
  }, [bust, waist, hip, height]);

  /** Поля отличаются от последнего снимка, принятого с сервера (после гидрации или commit). */
  const serverFormMismatch = useMemo(() => {
    if (!serverIntentBaseline) return false;
    if (serverIntentBaseline.handbookLeafId !== leafId) return true;
    return !sameMeasureStrings(serverIntentBaseline.measures, currentMeasures);
  }, [serverIntentBaseline, leafId, currentMeasures]);

  /** Профиль мерок и последний снимок на сервере не согласованы (оба заданы). */
  const profileVsServerMismatch = useMemo(() => {
    const p = loadBodyProfile();
    const s = serverIntentBaseline?.measures;
    if (!p || !s) return false;
    const d = 0.75;
    if (p.chest && Math.abs(parseSewingNum(s.bust, SEWING_DEF.bust) - p.chest) > d) return true;
    if (p.waist && Math.abs(parseSewingNum(s.waist, SEWING_DEF.waist) - p.waist) > d) return true;
    if (p.hips && Math.abs(parseSewingNum(s.hip, SEWING_DEF.hip) - p.hips) > d) return true;
    if (p.height && Math.abs(parseSewingNum(s.height, SEWING_DEF.height) - p.height) > 1)
      return true;
    return false;
  }, [serverIntentBaseline]);

  const hasBodyProfile = useMemo(() => {
    const p = loadBodyProfile();
    return Boolean(p && (p.chest || p.waist || p.hips || p.height));
  }, [bust, waist, hip, height, profileMeasureMismatch, profileVsServerMismatch]);

  const applyMeasuresFromProfile = useCallback(() => {
    const p = loadBodyProfile();
    if (p?.chest) setBust(String(p.chest));
    if (p?.waist) setWaist(String(p.waist));
    if (p?.hips) setHip(String(p.hips));
    if (p?.height) setHeight(String(p.height));
  }, []);

  const applyMeasuresFromServer = useCallback(() => {
    const r = serverIntentBaseline;
    if (!r) return;
    setCatL1State(r.l1Name);
    setCatL2State(r.l2Name);
    setCatL3State(r.l3Name);
    setBust(r.measures.bust);
    setWaist(r.measures.waist);
    setHip(r.measures.hip);
    setShoulder(r.measures.shoulder);
    setHeight(r.measures.height);
  }, [serverIntentBaseline]);

  useEffect(() => {
    const p = loadBodyProfile();
    if (p?.chest) setBust(String(p.chest));
    if (p?.waist) setWaist(String(p.waist));
    if (p?.hips) setHip(String(p.hips));
    if (p?.height) setHeight(String(p.height));
  }, []);

  useEffect(() => {
    return () => {
      commitAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (sessionStorage.getItem('synth.sewing.funnel.pv')) return;
      sessionStorage.setItem('synth.sewing.funnel.pv', '1');
      logObservability('sewing_funnel_page_view', {
        surface: 'client_sewing_patterns',
        ...sewingFunnelAbContext(),
      });
    } catch {
      /* storage blocked */
    }
  }, []);

  useEffect(() => {
    const onRules = () => setPresetRulesRevision((n) => n + 1);
    window.addEventListener(SEWING_PRESET_RULES_CHANGED_EVENT, onRules);
    return () => window.removeEventListener(SEWING_PRESET_RULES_CHANGED_EVENT, onRules);
  }, []);

  useEffect(() => {
    if (storageRead.current) return;
    storageRead.current = true;
    const stored = readStoredSewingLeafId();
    if (!stored) return;
    const leaf = findHandbookLeafById(stored);
    if (leaf) {
      setCatL1State(leaf.l1Name);
      setCatL2State(leaf.l2Name);
      setCatL3State(leaf.l3Name);
    }
  }, []);

  useEffect(() => {
    const l1s = getSewingL1Options();
    let n1 = catL1;
    if (l1s.length > 0 && !l1s.includes(n1) && l1s[0]) n1 = l1s[0];
    const l2s = getSewingL2Options(n1);
    let n2 = catL2;
    if (l2s.length > 0 && !l2s.includes(n2) && l2s[0]) n2 = l2s[0];
    const l3s = getSewingL3Options(n1, n2);
    let n3 = catL3;
    if (l3s.length > 0 && !l3s.includes(n3) && l3s[0]) n3 = l3s[0];
    if (n1 !== catL1) setCatL1State(n1);
    if (n2 !== catL2) setCatL2State(n2);
    if (n3 !== catL3) setCatL3State(n3);
  }, [catL1, catL2, catL3]);

  useEffect(() => {
    if (leafId) writeStoredSewingLeafId(leafId);
  }, [leafId]);

  useEffect(() => {
    if (prevL1Ref.current === null) {
      prevL1Ref.current = catL1;
      return;
    }
    if (prevL1Ref.current !== catL1) {
      logObservability('sewing_pattern_l1_change', {
        from: prevL1Ref.current,
        to: catL1,
        isApparel: catL1 === 'Одежда',
      });
      prevL1Ref.current = catL1;
    }
  }, [catL1]);

  useEffect(() => {
    if (!leafId) return;
    const t = window.setTimeout(() => {
      writeSewingPatternIntentV1({
        v: 1,
        handbookLeafId: leafId,
        pathLabel,
        isApparelSewing,
        measures: { bust, waist, hip, shoulder, height },
        updatedAt: new Date().toISOString(),
      });
    }, 400);
    return () => window.clearTimeout(t);
  }, [leafId, pathLabel, isApparelSewing, bust, waist, hip, shoulder, height]);

  useEffect(() => {
    if (!isApparelSewing) return;
    const { leafName: ln } = getSewingEffectiveLeaf(catL1, catL2, catL3);
    const pr = resolveSewingCategoryPreset(catL2, ln);
    setGarment(pr.primary);
    setEaseB(pr.ease.bust);
    setEaseW(pr.ease.waist);
    setEaseH(pr.ease.hip);
    setDarts(pr.darts);
    setSkirtLen(pr.skirtLenCm);
    setNeckDrop(pr.neckDropCm);
  }, [isApparelSewing, catL1, catL2, catL3, presetRulesRevision]);

  useEffect(() => {
    const deviceId = getOrCreateClientDeviceId();
    if (deviceId.length < 8) return;
    const userId = user?.uid?.trim() ?? null;
    let cancelled = false;
    const t = window.setTimeout(() => {
      void (async () => {
        const sp = new URLSearchParams({ deviceId });
        if (userId) sp.set('userId', userId);
        try {
          const res = await fetch(`/api/client/sewing-pattern-intent?${sp.toString()}`, {
            cache: 'default',
          });
          if (!res.ok || cancelled) return;
          const data = (await res.json()) as {
            ok?: boolean;
            record?: SewingOrderIntentServerRecordV1 | null;
          };
          if (!data.ok || !data.record || cancelled) return;
          const local = readSewingPatternIntentV1();
          const serverTs = Date.parse(data.record.updatedAt);
          const localTs = local?.updatedAt ? Date.parse(local.updatedAt) : 0;
          if (serverTs <= localTs) return;
          setCatL1State(data.record.l1Name);
          setCatL2State(data.record.l2Name);
          setCatL3State(data.record.l3Name);
          setBust(data.record.measures.bust);
          setWaist(data.record.measures.waist);
          setHip(data.record.measures.hip);
          setShoulder(data.record.measures.shoulder);
          setHeight(data.record.measures.height);
          setServerIntentBaseline(data.record);
          logObservability('sewing_intent_hydrated_from_server', {
            handbookLeafId: data.record.handbookLeafId,
          });
        } catch {
          /* ignore */
        }
      })();
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [user?.uid]);

  const rawResult: SewingPatternResult = useMemo(() => {
    if (!isApparelSewing) {
      return NON_APPAREL_SEWING_PATTERN_RESULT;
    }
    return buildSewingPattern(
      defaultSewingDraftOptions({
        measures: {
          unit: 'cm',
          bust: parseSewingNum(bust, SEWING_DEF.bust),
          waist: parseSewingNum(waist, SEWING_DEF.waist),
          hip: parseSewingNum(hip, SEWING_DEF.hip),
          shoulderWidth: parseSewingNum(shoulder, SEWING_DEF.shoulder),
          bodyHeight: height ? parseSewingNum(height, SEWING_DEF.height) : undefined,
        },
        garment,
        darts,
        ease: { bust: easeB, waist: easeW, hip: easeH },
        seamAllowanceMm: seam,
        showSeamLine: showSeam,
        showGrain,
        showDimensions: showDim,
        frontNeckDropCm: neckDrop,
        shoulderSlant: 0.5,
        waistToHemSkirtCm: skirtLen,
      })
    );
  }, [
    isApparelSewing,
    bust,
    waist,
    hip,
    shoulder,
    height,
    garment,
    darts,
    easeB,
    easeW,
    easeH,
    seam,
    neckDrop,
    skirtLen,
    showSeam,
    showGrain,
    showDim,
  ]);

  const result: SewingPatternResult = useMemo(() => {
    if (!isApparelSewing) return rawResult;
    return { ...rawResult, svg: applyInstructionalWatermarkToSvg(rawResult.svg) };
  }, [isApparelSewing, rawResult]);

  const setDart = (key: keyof SewingPatternDartToggles, v: boolean) => {
    setDarts((prev) => ({ ...prev, [key]: v }));
  };

  const download = () => {
    const blob = new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.downloadFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setBust(String(SEWING_DEF.bust));
    setWaist(String(SEWING_DEF.waist));
    setHip(String(SEWING_DEF.hip));
    setShoulder(String(SEWING_DEF.shoulder));
    setHeight(String(SEWING_DEF.height));
    setZoomPct(100);
  };

  const setCatL1Cascade = useCallback((l1: string) => {
    const l2s = getSewingL2Options(l1);
    const l2 = l2s[0] ?? '';
    const l3s = getSewingL3Options(l1, l2);
    const l3 = l3s[0] ?? '';
    setCatL1State(l1);
    setCatL2State(l2);
    setCatL3State(l3);
  }, []);

  const setCatL2Cascade = useCallback(
    (l2: string) => {
      const l3s = getSewingL3Options(catL1, l2);
      const l3 = l3s[0] ?? '';
      setCatL2State(l2);
      setCatL3State(l3);
    },
    [catL1]
  );

  const commitIntentToServer = useCallback(async (): Promise<SewingIntentCommitResult> => {
    if (!leafId) return { ok: false, error: 'no_leaf' };
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { ok: false, error: 'offline' };
    }
    logObservability('sewing_funnel_commit_clicked', { handbookLeafId: leafId });
    const deviceId = getOrCreateClientDeviceId();
    if (deviceId.length < 8) return { ok: false, error: 'no_device' };
    commitAbortRef.current?.abort();
    const ac = new AbortController();
    commitAbortRef.current = ac;
    setCommitPending(true);
    try {
      const res = await fetch('/api/client/sewing-pattern-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handbookLeafId: leafId,
          measures: { bust, waist, hip, shoulder, height },
          deviceId,
          userId: user?.uid?.trim() || null,
          persist: true,
        }),
        signal: ac.signal,
      });
      let data: {
        ok?: boolean;
        error?: string;
        handbookLeafId?: string;
        pathLabel?: string;
        categoryHandbook?: { schemaVersion: number; generatedAt: string };
        persisted?: boolean;
        record?: SewingOrderIntentServerRecordV1;
      } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        data = {};
      }
      if (res.ok && data.ok && data.handbookLeafId) {
        if (data.record) {
          setServerIntentBaseline(data.record);
        }
        logObservability('sewing_funnel_intent_persisted', {
          persisted: data.persisted !== false,
          ...sewingFunnelAbContext(),
        });
        logObservability('sewing_pattern_intent_validated', {
          handbookLeafId: data.handbookLeafId,
          schemaVersion: data.categoryHandbook?.schemaVersion,
          ...sewingFunnelAbContext(),
        });
        return {
          ok: true,
          canonicalId: data.handbookLeafId,
          pathLabel: data.pathLabel,
          categoryHandbook: data.categoryHandbook,
          record: data.record,
        };
      }
      return { ok: false, error: data.error ?? 'request_failed' };
    } catch (e) {
      if (getUnknownErrorName(e) === 'AbortError') {
        return { ok: false, error: 'aborted', aborted: true };
      }
      reportError(e, { endpoint: '/api/client/sewing-pattern-intent' });
      return { ok: false, error: 'network' };
    } finally {
      if (commitAbortRef.current === ac) commitAbortRef.current = null;
      setCommitPending(false);
    }
  }, [leafId, bust, waist, hip, shoulder, height, user?.uid]);

  return {
    result,
    isOnline,
    svgExportDisabled,
    hasBodyProfile,
    hasServerIntentSnapshot: Boolean(serverIntentBaseline),
    download,
    reset,
    catL1,
    setCatL1: setCatL1Cascade,
    catL2,
    setCatL2: setCatL2Cascade,
    catL3,
    setCatL3: setCatL3State,
    isApparelSewing,
    pathLabel,
    leafName,
    handbookLeafId: leafId,
    commitIntentToServer,
    commitPending,
    profileMeasureMismatch,
    profileVsServerMismatch,
    serverFormMismatch,
    applyMeasuresFromProfile,
    applyMeasuresFromServer,
    setDart,
    bust,
    setBust,
    waist,
    setWaist,
    hip,
    setHip,
    shoulder,
    setShoulder,
    height,
    setHeight,
    garment,
    setGarment,
    darts,
    easeB,
    setEaseB,
    easeW,
    setEaseW,
    easeH,
    setEaseH,
    seam,
    setSeam,
    neckDrop,
    setNeckDrop,
    skirtLen,
    setSkirtLen,
    showSeam,
    setShowSeam,
    showGrain,
    setShowGrain,
    showDim,
    setShowDim,
    zoomPct,
    setZoomPct,
  };
}
