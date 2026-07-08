'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, ArrowLeft, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRbac } from '@/hooks/useRbac';
import type { W2OpsAlert, W2OpsDailyPoint } from '@/lib/server/workshop2-dossier-metrics-ops';
import type { W2DossierMetricsDedupAggregate } from '@/lib/server/workshop2-dossier-metrics-store';
import { ROUTES } from '@/lib/routes';

type TimeFilterMeta = {
  sinceMs: number | null;
  rowsBeforeFilter: number;
  rowsAfterFilter: number;
};

type ApiOk = {
  ok: true;
  dailySeries: W2OpsDailyPoint[];
  alerts: W2OpsAlert[];
  aggregateDedupLatest: W2DossierMetricsDedupAggregate;
  rowsLoaded: number;
  rowsRead?: number;
  timeFilter?: TimeFilterMeta;
  daysBack: number;
};

export default function AdminDossierMetricsOpsPage() {
  const { role } = useRbac();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ApiOk | null>(null);
  const [collections, setCollections] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [sinceHours, setSinceHours] = useState<string>('168');
  const [daysBack, setDaysBack] = useState<string>('14');

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const q = new URLSearchParams();
      q.set('limit', '5000');
      q.set('daysBack', daysBack.trim() || '14');
      if (collections.trim()) q.set('collections', collections.trim());
      if (sinceHours.trim()) q.set('sinceHours', sinceHours.trim());
      const headers: HeadersInit = {};
      if (adminSecret.trim()) headers.Authorization = `Bearer ${adminSecret.trim()}`;
      const res = await fetch(`/api/admin/production/dossier-metrics-ops?${q}`, { headers });
      const j = (await res.json()) as ApiOk | { ok: false; error: string };
      if (!res.ok || !j.ok) {
        setErr('error' in j ? j.error : `HTTP ${res.status}`);
        setData(null);
        return;
      }
      setData(j);
    } catch {
      setErr('network');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [collections, adminSecret, sinceHours, daysBack]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load
  }, []);

  if (role !== 'admin') {
    return (
      <CabinetPageContent maxWidth="3xl" className="py-10">
        <p className="text-text-secondary text-sm">Раздел только для администратора.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={ROUTES.admin.home}>Назад</Link>
        </Button>
      </CabinetPageContent>
    );
  }

  const chartData = data?.dailySeries ?? [];

  return (
    <CabinetPageContent maxWidth="6xl" className="space-y-6 pb-16">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-text-primary flex items-center gap-2 text-xl font-black uppercase tracking-tight">
            <TrendingUp className="h-7 w-7 text-amber-600" />
            Операции · метрики W2
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm">
            Дневная воронка (последний снимок SKU внутри дня), алерты по хвосту. Архив: cron{' '}
            <code className="bg-bg-surface2 rounded px-1">
              /api/cron/w2-dossier-metrics-archive
            </code>{' '}
            + секрет <code className="bg-bg-surface2 rounded px-1">W2_METRICS_CRON_SECRET</code>.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-1">
          <Link href={ROUTES.admin.productionDossierMetrics}>
            <ArrowLeft className="h-4 w-4" />К сводным метрикам
          </Link>
        </Button>
      </header>

      <Card className="border-border-default shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Фильтры</CardTitle>
          <CardDescription>
            Окно времени обрезает строки до построения рядов (как на основной странице).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <label className="text-text-muted text-[10px] font-bold uppercase">Коллекции</label>
            <Input
              value={collections}
              onChange={(e) => setCollections(e.target.value)}
              placeholder="id1, id2"
              className="h-9 max-w-md text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-text-muted text-[10px] font-bold uppercase">sinceHours</label>
            <Select
              value={sinceHours || 'all'}
              onValueChange={(v) => setSinceHours(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-9 w-[200px] text-sm">
                <SelectValue placeholder="Весь хвост" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Весь хвост</SelectItem>
                <SelectItem value="24">24 ч</SelectItem>
                <SelectItem value="168">7 д</SelectItem>
                <SelectItem value="720">30 д</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-text-muted text-[10px] font-bold uppercase">
              Дней на графике
            </label>
            <Input
              value={daysBack}
              onChange={(e) => setDaysBack(e.target.value)}
              className="h-9 w-24 text-sm"
              inputMode="numeric"
            />
          </div>
          <div className="space-y-1">
            <label className="text-text-muted text-[10px] font-bold uppercase">Секрет чтения</label>
            <Input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className="h-9 max-w-xs text-sm"
              autoComplete="off"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="h-9 gap-2"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Обновить
          </Button>
        </CardContent>
      </Card>

      {err ? <p className="text-sm font-medium text-red-600">Ошибка: {err}</p> : null}

      {data ? (
        <div className="text-text-secondary flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">строк: {data.rowsLoaded}</Badge>
          {typeof data.rowsRead === 'number' ? (
            <Badge variant="outline">из хвоста: {data.rowsRead}</Badge>
          ) : null}
        </div>
      ) : null}

      {data && data.alerts.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-amber-950">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Алерты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-950">
            {data.alerts.map((a) => (
              <div
                key={a.code}
                className="rounded-md border border-amber-200/80 bg-white/60 px-3 py-2"
              >
                <span className="font-mono text-[10px] uppercase text-amber-700">{a.level}</span>{' '}
                <span className="text-text-secondary font-mono text-[10px]">{a.code}</span>
                <p className="mt-1 text-[13px] leading-snug">{a.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {data && chartData.length === 0 ? (
        <p className="text-text-secondary text-sm">
          Нет дневных точек в окне — расширьте sinceHours или limit на API.
        </p>
      ) : null}

      {chartData.length > 0 ? (
        <Card className="border-border-default shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Воронка по дням (UTC)</CardTitle>
            <CardDescription>
              Зелёный — уникальные SKU (последний снимок за день); остальное — вехи на этих SKU.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[340px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border-subtle" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="articles"
                  name="SKU/день"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="articlesPassport100"
                  name="Паспорт 100%"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="articlesVisualGate0"
                  name="Гейт 0"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="rawEvents"
                  name="Сырые события"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border-default bg-bg-surface2/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Инфраструктура</CardTitle>
          <CardDescription>
            Без отдельного warehouse-API: presigned PUT или локальный каталог.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-text-secondary space-y-2 text-xs">
          <p>
            <strong className="text-text-primary">Пороги алертов (env):</strong>{' '}
            <code className="rounded bg-white px-1">W2_OPS_STALE_HOURS</code>,{' '}
            <code className="rounded bg-white px-1">W2_OPS_PASSPORT_MIN_ARTICLES</code>,{' '}
            <code className="rounded bg-white px-1">W2_OPS_PASSPORT_RATIO_WARN_BELOW</code>,{' '}
            <code className="rounded bg-white px-1">W2_OPS_ABANDON_MIN_RAW</code>,{' '}
            <code className="rounded bg-white px-1">W2_OPS_ABANDON_RATIO_WARN_ABOVE</code>. Webhook:{' '}
            <code className="rounded bg-white px-1">W2_OPS_ALERT_WEBHOOK_URL</code>, секрет{' '}
            <code className="rounded bg-white px-1">W2_METRICS_WEBHOOK_SECRET</code>, окно cron:{' '}
            <code className="rounded bg-white px-1">W2_OPS_ALERT_SINCE_HOURS</code>.{' '}
            <strong className="text-text-primary">Анти-спуф uid/org:</strong>{' '}
            <code className="rounded bg-white px-1">W2_DOSSIER_METRICS_STAMP_SECRET</code>, выдача{' '}
            <code className="rounded bg-white px-1">POST …/workshop2-dossier-metrics/stamp</code>.
            Клиент:{' '}
            <code className="rounded bg-white px-1">NEXT_PUBLIC_W2_METRICS_STAMP_ENABLED=true</code>
            . MVP без платформы:{' '}
            <code className="rounded bg-white px-1">W2_DOSSIER_METRICS_LOOSE_STAMP=1</code> +{' '}
            <code className="rounded bg-white px-1">W2_DOSSIER_METRICS_TRUSTED_ORIGINS</code>. В{' '}
            <code className="rounded bg-white px-1">production</code> loose без{' '}
            <code className="rounded bg-white px-1">LOOSE_STAMP_ALLOW_PRODUCTION</code> отключён.
          </p>
          <p>
            <strong className="text-text-primary">POST / чтение:</strong>{' '}
            <code className="rounded bg-white px-1">W2_DOSSIER_METRICS_POST_RL_PER_MIN</code>,{' '}
            <code className="rounded bg-white px-1">W2_DOSSIER_METRICS_POST_SECRET</code> +{' '}
            <code className="rounded bg-white px-1">NEXT_PUBLIC_W2_DOSSIER_METRICS_WRITE_KEY</code>;
            чтение:{' '}
            <code className="rounded bg-white px-1">W2_DOSSIER_METRICS_READ_IP_ALLOWLIST</code>.
          </p>
          <p>
            <strong className="text-text-primary">Архив:</strong>{' '}
            <code className="rounded bg-white px-1">W2_METRICS_ARCHIVE_WEBHOOK_URL</code> (после
            архива), <code className="rounded bg-white px-1">W2_METRICS_ARCHIVE_PUT_URL</code>{' '}
            (presigned) или{' '}
            <code className="rounded bg-white px-1">W2_METRICS_ARCHIVE_LOCAL_DIR</code>.
            Идемпотентность по SHA-256 среза (файл state). Повтор при неизменном хвосте →{' '}
            <code className="rounded bg-white px-1">skipped_duplicate</code>; принудительно —{' '}
            <code className="rounded bg-white px-1">?force=1</code>. Cron:{' '}
            <code className="rounded bg-white px-1">vercel.json</code> → 04:00 UTC. Нативный S3:{' '}
            <code className="rounded bg-white px-1">W2_METRICS_S3_*</code>. Retention hot:{' '}
            <code className="rounded bg-white px-1">AFTER_SUCCESS_CLEAR_REDIS</code> /{' '}
            <code className="rounded bg-white px-1">TRUNCATE_FILE</code>.
          </p>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
