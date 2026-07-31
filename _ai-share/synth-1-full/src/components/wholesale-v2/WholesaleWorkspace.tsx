'use client';

import { onAuthStateChanged, type User } from 'firebase/auth';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { loadWholesaleWorkspace, type WholesaleEntity, type WholesaleWorkspace } from '@/lib/wholesale-v2/client';

const stages = ['campaign', 'collection', 'showroom', 'selection', 'order-builder', 'order', 'confirmation', 'deal-space'] as const;

export function WholesaleWorkspace() {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<WholesaleWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFor = useCallback(async (activeUser: User | null) => {
    if (!activeUser) {
      setWorkspace(null);
      setError('Войдите в Syntha, чтобы открыть B2B workspace.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setWorkspace(await loadWholesaleWorkspace(activeUser));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось загрузить workspace.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      return onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser);
        void refreshFor(nextUser);
      });
    } catch (cause) {
      setLoading(false);
      setError(cause instanceof Error ? cause.message : 'Firebase Auth недоступен.');
      return () => undefined;
    }
  }, [refreshFor]);

  const pipeline = useMemo(() => {
    const counts = new Map(stages.map((stage) => [stage, 0]));
    for (const cycle of workspace?.cycles ?? []) {
      const stage = text(cycle.stage);
      if (counts.has(stage as typeof stages[number])) counts.set(stage as typeof stages[number], (counts.get(stage as typeof stages[number]) ?? 0) + 1);
    }
    return stages.map((stage) => ({ stage, count: counts.get(stage) ?? 0 }));
  }, [workspace]);

  if (loading) return <WorkspaceState title="Загружаем wholesale workspace" body="Проверяем сессию и доступные торговые контуры." />;
  if (error) return <WorkspaceState title="Workspace недоступен" body={error} action={<button className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white" onClick={() => void refreshFor(user)}>Повторить</button>} />;
  if (!workspace) return null;

  const activeRelationships = workspace.relationships.filter((item) => text(item.status) === 'active').length;
  const acceptedInvitations = workspace.invitations.filter((item) => text(item.status) === 'accepted').length;
  const openDeals = workspace.deals.filter((item) => text(item.status) === 'open').length;
  const orderValue = workspace.orders.reduce((sum, item) => sum + number(item.totalAmount), 0);

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-4 py-6 text-neutral-950 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col gap-4 rounded-[28px] bg-black p-7 text-white md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">Syntha Wholesale V2</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Коммерческий workspace</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Только организации, партнёры, заказы и события, доступные текущему пользователю. Источник — PostgreSQL через Firebase-authenticated BFF.</p>
          </div>
          <div className="flex gap-2">
            <a href="/api/wholesale-v2/openapi.json" className="rounded-full border border-white/25 px-4 py-2 text-sm">OpenAPI</a>
            <button onClick={() => void refreshFor(user)} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">Обновить</button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Организации" value={workspace.organisations.length} />
          <Metric label="Активные партнёры" value={activeRelationships} />
          <Metric label="Доступы в шоурумы" value={acceptedInvitations} />
          <Metric label="Открытые сделки" value={openDeals} />
          <Metric label="Сумма заказов" value={money(orderValue, currency(workspace.orders))} />
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Pipeline</p><h2 className="mt-2 text-2xl font-semibold">Коммерческие циклы</h2></div>
            <span className="text-sm text-neutral-500">{workspace.cycles.length} циклов</span>
          </div>
          <div className="mt-6 grid gap-2 md:grid-cols-4 xl:grid-cols-8">
            {pipeline.map(({ stage, count }, index) => (
              <div key={stage} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between"><span className="text-xs text-neutral-400">{String(index + 1).padStart(2, '0')}</span><span className="text-2xl font-semibold">{count}</span></div>
                <p className="mt-5 break-words text-sm font-medium">{stage}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <DataPanel title="Партнёрские отношения" rows={workspace.relationships} columns={['id', 'brandId', 'shopId', 'status']} />
          <DataPanel title="Приглашения в шоурумы" rows={workspace.invitations} columns={['showroomId', 'shopId', 'status', 'expiresAt']} />
        </div>
        <DataPanel title="Заказы" rows={workspace.orders} columns={['id', 'brandId', 'shopId', 'status', 'currency', 'totalAmount']} />
        <div className="grid gap-6 xl:grid-cols-2">
          <DataPanel title="DealSpace" rows={workspace.deals} columns={['id', 'orderId', 'status', 'currency', 'totalAmount']} />
          <DataPanel title="Календарь" rows={workspace.calendar} columns={['type', 'title', 'startsAt', 'visibility']} />
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{label}</p><p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p></div>;
}

function DataPanel({ title, rows, columns }: { title: string; rows: WholesaleEntity[]; columns: string[] }) {
  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5"><h2 className="text-xl font-semibold">{title}</h2><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">{rows.length}</span></div>
      <div className="overflow-x-auto">
        {rows.length ? <table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="text-xs uppercase tracking-wide text-neutral-400">{columns.map((column) => <th key={column} className="px-6 py-3 font-medium">{column}</th>)}</tr></thead><tbody>{rows.slice(0, 12).map((row, index) => <tr key={text(row.id) || String(index)} className="border-t border-neutral-100">{columns.map((column) => <td key={column} className="max-w-[260px] truncate px-6 py-4">{display(row[column])}</td>)}</tr>)}</tbody></table> : <p className="px-6 py-10 text-sm text-neutral-500">Нет доступных данных.</p>}
      </div>
    </section>
  );
}

function WorkspaceState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-[#f5f5f3] p-6"><div className="max-w-lg rounded-[28px] bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-3 text-sm leading-6 text-neutral-500">{body}</p>{action ? <div className="mt-6">{action}</div> : null}</div></main>;
}
function display(value: unknown): string { if (typeof value === 'number') return new Intl.NumberFormat('ru-RU').format(value); if (typeof value === 'string') return value; if (value == null) return '—'; return JSON.stringify(value); }
function text(value: unknown): string { return typeof value === 'string' ? value : ''; }
function number(value: unknown): number { return typeof value === 'number' && Number.isFinite(value) ? value : 0; }
function currency(orders: WholesaleEntity[]): string { return text(orders.find((item) => text(item.currency))?.currency) || 'EUR'; }
function money(value: number, code: string): string { try { return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(value); } catch { return `${value} ${code}`; } }
