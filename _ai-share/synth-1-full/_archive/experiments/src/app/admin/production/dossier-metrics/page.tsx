'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart2, Download, Loader2, RefreshCw } from 'lucide-react';
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
import { ROUTES } from '@/lib/routes';
import type {
  W2DossierMetricsAggregate,
  W2DossierMetricsDedupAggregate,
  W2DossierMetricsOrgAggregate,
  W2DossierMetricsTeamAggregate,
} from '@/lib/server/workshop2-dossier-metrics-store';

type TimeFilterMeta = {
  sinceMs: number | null;
  rowsBeforeFilter: number;
  rowsAfterFilter: number;
};

type ApiOk = {
  ok: true;
  storage: string;
  fileFallbackPath: string;
  aggregate: W2DossierMetricsAggregate;
  aggregateDedupLatest: W2DossierMetricsDedupAggregate;
  teamLatest: W2DossierMetricsTeamAggregate;
  orgLatest: W2DossierMetricsOrgAggregate;
  rowsLoaded: number;
  rowsRead?: number;
  timeFilter?: TimeFilterMeta;
};

function csvCell(v: string | number): string {
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildDedupAndTeamCsv(d: ApiOk): string {
  const lines: string[] = [
    '# dedup by collection',
    [
      'collectionId',
      'articles',
      'passport100',
      'visualGate0',
      'sampleReady',
      'avgTabMin',
      'avgPersist',
    ]
      .map(csvCell)
      .join(','),
  ];
  for (const r of d.aggregateDedupLatest.byCollection) {
    lines.push(
      [
        r.collectionId,
        r.articles,
        r.articlesPassport100,
        r.articlesVisualGate0,
        r.articlesSampleReady,
        r.avgTabOpenMinutes ?? '',
        r.avgPersistSuccess ?? '',
      ]
        .map(csvCell)
        .join(',')
    );
  }
  lines.push('');
  lines.push('# by team (latest snapshot)');
  lines.push(['teamTag', 'uniqueActors', 'articles'].map(csvCell).join(','));
  for (const r of d.teamLatest.byTeam) {
    lines.push([r.teamTag, r.uniqueActors, r.articles].map(csvCell).join(','));
  }
  lines.push('');
  lines.push('# by org (activeOrganizationId, latest snapshot)');
  lines.push(['orgId', 'uniqueActors', 'uniqueAppUsers', 'articles'].map(csvCell).join(','));
  for (const r of d.orgLatest.byOrg) {
    lines.push([r.orgId, r.uniqueActors, r.uniqueAppUsers, r.articles].map(csvCell).join(','));
  }
  return lines.join('\n');
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function AdminDossierMetricsPage() {
  const { role } = useRbac();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ApiOk | null>(null);
  const [collections, setCollections] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  /** Пусто = всё окно; иначе sinceHours для KPI за период */
  const [sinceHours, setSinceHours] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const q = new URLSearchParams();
      const limit = sinceHours ? '5000' : '3000';
      q.set('limit', limit);
      if (collections.trim()) q.set('collections', collections.trim());
      if (sinceHours.trim()) q.set('sinceHours', sinceHours.trim());
      const headers: HeadersInit = {};
      if (adminSecret.trim()) {
        headers.Authorization = `Bearer ${adminSecret.trim()}`;
      }
      const res = await fetch(`/api/admin/production/dossier-metrics?${q}`, { headers });
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
  }, [collections, adminSecret, sinceHours]);

  useEffect(() => {
    void load();
    // Первичная загрузка; фильтры и секрет применяются по кнопке «Обновить».
    // eslint-disable-next-line react-hooks/exhaustive-deps -- см. выше
  }, []);

  const chartRows =
    data?.aggregate.byCollection.slice(0, 14).map((c) => {
      const d = data.aggregateDedupLatest.byCollection.find(
        (x) => x.collectionId === c.collectionId
      );
      return {
        label: c.collectionId.length > 14 ? `${c.collectionId.slice(0, 12)}…` : c.collectionId,
        events: c.events,
        articles: d?.articles ?? 0,
        p100: d?.articlesPassport100 ?? 0,
      };
    }) ?? [];

  if (role !== 'admin') {
    return (
      <CabinetPageContent maxWidth="3xl" className="py-10">
        <p className="text-text-secondary text-sm">Раздел доступен только роли администратора.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={ROUTES.admin.home}>Назад</Link>
        </Button>
      </CabinetPageContent>
    );
  }

  return (
    <CabinetPageContent maxWidth="6xl" className="space-y-6 pb-16">
      <header className="flex flex-wrap items-start justify-between gap-4 space-y-1">
        <div>
          <h1 className="text-text-primary flex items-center gap-2 text-xl font-black uppercase tracking-tight">
            <BarChart2 className="h-7 w-7 text-amber-600" />
            Метрики досье ТЗ (Workshop2)
          </h1>
          <p className="text-text-secondary text-sm">
            События с клиента: сессия вкладки, сохранения, вехи контура. Хранение: Upstash/KV или
            локальный NDJSON.{' '}
            <Link
              href={ROUTES.admin.productionDossierMetricsOps}
              className="font-medium text-amber-700 underline-offset-2 hover:underline"
            >
              Операции и воронка
            </Link>
          </p>
        </div>
      </header>

      <Card className="border-border-default shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Фильтры</CardTitle>
          <CardDescription>
            Клиент шлёт <code className="bg-bg-surface2 rounded px-1">clientActorId</code>,
            опционально <code className="bg-bg-surface2 rounded px-1">teamTag</code> (localStorage),
            при входе в аккаунт — <code className="bg-bg-surface2 rounded px-1">appUserUid</code> и{' '}
            <code className="bg-bg-surface2 rounded px-1">orgId</code> (тенант). Без email/ФИО.
            Отключить uid/org на клиенте:{' '}
            <code className="bg-bg-surface2 rounded px-1">
              NEXT_PUBLIC_W2_DOSSIER_METRICS_DISABLE_USER_CONTEXT=1
            </code>
            ; на сервере не писать их в хранилище:{' '}
            <code className="bg-bg-surface2 rounded px-1">W2_DOSSIER_METRICS_STRIP_USER_IDS=1</code>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="space-y-1">
            <label className="text-text-muted text-[10px] font-bold uppercase">
              Коллекции (через запятую)
            </label>
            <Input
              value={collections}
              onChange={(e) => setCollections(e.target.value)}
              placeholder="id1, id2"
              className="h-9 max-w-md text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-text-muted text-[10px] font-bold uppercase">
              Окно по времени (capturedAt)
            </label>
            <Select
              value={sinceHours || 'all'}
              onValueChange={(v) => setSinceHours(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-9 w-[200px] text-sm">
                <SelectValue placeholder="Весь хвост" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Весь хвост (после limit)</SelectItem>
                <SelectItem value="24">Последние 24 ч</SelectItem>
                <SelectItem value="168">Последние 7 д</SelectItem>
                <SelectItem value="720">Последние 30 д</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-text-muted text-[10px] font-bold uppercase">
              Секрет API (если задан в .env: READ или ADMIN — достаточно одного)
            </label>
            <Input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Bearer / X-W2-Metrics-Key"
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

      {err ? <p className="text-sm font-medium text-red-600">Ошибка загрузки: {err}</p> : null}

      {data ? (
        <div className="text-text-secondary flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline">backend: {data.storage}</Badge>
          <Badge variant="outline">после времени: {data.rowsLoaded}</Badge>
          {typeof data.rowsRead === 'number' ? (
            <Badge variant="outline">прочитано из хвоста: {data.rowsRead}</Badge>
          ) : null}
          {data.timeFilter?.sinceMs != null ? (
            <Badge variant="secondary">
              с {new Date(data.timeFilter.sinceMs).toLocaleString('ru-RU')} · было{' '}
              {data.timeFilter.rowsBeforeFilter} → {data.timeFilter.rowsAfterFilter}
            </Badge>
          ) : (
            <Badge variant="outline">время: весь хвост</Badge>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            disabled={!data}
            onClick={() =>
              downloadBlob(
                `w2-dossier-metrics-${Date.now()}.json`,
                JSON.stringify(data, null, 2),
                'application/json'
              )
            }
          >
            <Download className="h-3.5 w-3.5" />
            JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            disabled={!data}
            onClick={() =>
              downloadBlob(
                `w2-dossier-metrics-${Date.now()}.csv`,
                buildDedupAndTeamCsv(data),
                'text/csv;charset=utf-8'
              )
            }
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
          <span className="text-text-muted text-[10px]">
            файл (fallback): {data.fileFallbackPath}
          </span>
        </div>
      ) : null}

      {data && chartRows.length > 0 ? (
        <Card className="border-border-default shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">
              События vs уникальные SKU (последний снимок в окне)
            </CardTitle>
            <CardDescription>
              Синие столбцы — все POST в окне; зелёный — число артикулов по последнему снимку;
              фиолетовый — из них с вехой паспорта 100%.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border-subtle" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(v: number, name: string) => [
                    v,
                    name === 'events'
                      ? 'События'
                      : name === 'articles'
                        ? 'SKU (последн.)'
                        : 'Паспорт 100%',
                  ]}
                />
                <Legend />
                <Bar dataKey="events" name="События" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="articles"
                  name="SKU последн. снимок"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="p100"
                  name="Паспорт 100% (последн.)"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="border-border-default shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">По коллекциям (dedup)</CardTitle>
              <CardDescription>Одна строка на артикул — последнее состояние в окне</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[360px] overflow-auto text-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-border-default text-text-secondary border-b text-[10px] uppercase">
                    <th className="py-2 pr-2">Коллекция</th>
                    <th className="py-2 pr-2">SKU</th>
                    <th className="py-2 pr-2">П100</th>
                    <th className="py-2 pr-2">Гейт0</th>
                    <th className="py-2">Образец</th>
                  </tr>
                </thead>
                <tbody>
                  {data.aggregateDedupLatest.byCollection.map((r) => (
                    <tr key={r.collectionId} className="border-border-subtle border-b">
                      <td className="py-1.5 pr-2 font-mono">{r.collectionId}</td>
                      <td className="py-1.5 pr-2 tabular-nums">{r.articles}</td>
                      <td className="py-1.5 pr-2 tabular-nums">{r.articlesPassport100}</td>
                      <td className="py-1.5 pr-2 tabular-nums">{r.articlesVisualGate0}</td>
                      <td className="py-1.5 tabular-nums">{r.articlesSampleReady}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="border-border-default shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">По teamTag (последний снимок)</CardTitle>
              <CardDescription>
                Без тега — строка <code className="bg-bg-surface2 rounded px-1">__none__</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[360px] overflow-auto text-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-border-default text-text-secondary border-b text-[10px] uppercase">
                    <th className="py-2 pr-2">Команда / тег</th>
                    <th className="py-2 pr-2">Акторов</th>
                    <th className="py-2">SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {data.teamLatest.byTeam.map((r) => (
                    <tr key={r.teamTag} className="border-border-subtle border-b">
                      <td
                        className="max-w-[200px] truncate py-1.5 pr-2 font-mono"
                        title={r.teamTag}
                      >
                        {r.teamTag}
                      </td>
                      <td className="py-1.5 pr-2 tabular-nums">{r.uniqueActors}</td>
                      <td className="py-1.5 tabular-nums">{r.articles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="border-border-default shadow-sm lg:col-span-2 xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">По организации (orgId)</CardTitle>
              <CardDescription>
                Последний снимок на артикул; без org —{' '}
                <code className="bg-bg-surface2 rounded px-1">__none__</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[360px] overflow-auto text-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-border-default text-text-secondary border-b text-[10px] uppercase">
                    <th className="py-2 pr-2">orgId</th>
                    <th className="py-2 pr-2">Брауз. акторов</th>
                    <th className="py-2 pr-2">Профилей</th>
                    <th className="py-2">SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orgLatest.byOrg.map((r) => (
                    <tr key={r.orgId} className="border-border-subtle border-b">
                      <td className="max-w-[180px] truncate py-1.5 pr-2 font-mono" title={r.orgId}>
                        {r.orgId}
                      </td>
                      <td className="py-1.5 pr-2 tabular-nums">{r.uniqueActors}</td>
                      <td className="py-1.5 pr-2 tabular-nums">{r.uniqueAppUsers}</td>
                      <td className="py-1.5 tabular-nums">{r.articles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Button variant="outline" size="sm" asChild>
        <Link href={ROUTES.admin.home}>В админку</Link>
      </Button>
    </CabinetPageContent>
  );
}
