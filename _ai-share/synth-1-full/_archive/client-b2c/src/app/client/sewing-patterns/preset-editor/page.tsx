'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import {
  defaultDeclarativeRulesFile,
  parseSewingPresetDeclarativeJson,
  writeDeclarativeRulesToLocalStorage,
} from '@/lib/pattern-drafting/sewing-preset-declarative';
import { getUnknownErrorDetail } from '@/lib/unknown-error-message';
import { ROUTES } from '@/lib/routes';

const LS_KEY = 'synth.sewing.presetRules.declarative.v1';

export default function SewingPresetEditorPage() {
  const enabled = process.env.NEXT_PUBLIC_SEWING_PRESET_EDITOR === '1';
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      setText(raw?.trim() ? raw : JSON.stringify(defaultDeclarativeRulesFile(), null, 2));
    } catch {
      setText(JSON.stringify(defaultDeclarativeRulesFile(), null, 2));
    }
  }, [enabled]);

  if (!enabled) {
    return (
      <CabinetPageContent maxWidth="screen" className="px-4 py-8">
        <p className="text-sm text-muted-foreground">
          Редактор пресетов выключен. Задайте{' '}
          <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_SEWING_PRESET_EDITOR=1</code> в
          окружении.
        </p>
        <Button asChild variant="link" className="mt-4 h-auto p-0">
          <Link href={ROUTES.client.sewingPatterns}>← К лекалам</Link>
        </Button>
      </CabinetPageContent>
    );
  }

  const onSave = () => {
    setError(null);
    setSaved(false);
    try {
      const parsed = parseSewingPresetDeclarativeJson(text);
      writeDeclarativeRulesToLocalStorage(parsed);
      setSaved(true);
    } catch (e) {
      setError(getUnknownErrorDetail(e));
    }
  };

  return (
    <CabinetPageContent maxWidth="screen" className="space-y-4 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">JSON-оверрайды пресетов (L2/L3)</h1>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.client.sewingPatterns}>К сценарию лекал</Link>
        </Button>
      </div>
      <p className="max-w-3xl text-xs text-muted-foreground">
        Правила хранятся в <code className="rounded bg-slate-100 px-1">{LS_KEY}</code> и применяются
        после эвристики и кода{' '}
        <code className="rounded bg-slate-100 px-1">SEWING_PRESET_USER_RULES</code>. Поля{' '}
        <code className="rounded bg-slate-100 px-1">when.l2Contains</code> /{' '}
        <code className="rounded bg-slate-100 px-1">leafContains</code> — подстроки без учёта
        регистра.
      </p>
      <Textarea
        className="min-h-[320px] font-mono text-xs"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? (
        <p className="text-sm text-emerald-700">
          Сохранено. Вернитесь к лекалам — пресет обновится.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={onSave}>
          Сохранить в localStorage
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setText(JSON.stringify(defaultDeclarativeRulesFile(), null, 2))}
        >
          Подставить пример
        </Button>
      </div>
    </CabinetPageContent>
  );
}
