'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  brandAgentRepShopCommissionHref,
  brandAgentRepShopPortalHref,
  listBrandAgentRepNames,
  summarizeBrandAgentRepLedger,
} from '@/lib/fashion/brand-agent-rep-oversight';
import { fetchBrandAgentRepLedgerRecords } from '@/lib/fashion/brand-agent-rep-ledger-store';
import { buildShopAgentRepSession } from '@/lib/b2b/shop-agent-rep';
import type { CommissionRecord } from '@/lib/distributor/sub-agent-commission';

const statusLabels: Record<CommissionRecord['status'], string> = {
  pending: 'На согласовании',
  approved: 'Утверждено',
  paid: 'Выплачено',
};

function useCommissionRecords() {
  const [records, setRecords] = useState<CommissionRecord[]>([]);
  const [mode, setMode] = useState<'postgres' | 'file' | 'memory' | 'empty'>('empty');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchBrandAgentRepLedgerRecords();
      setRecords(result.records);
      setMode(result.mode);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { records, mode, loading, reload };
}

function ledgerModeLabel(mode: 'postgres' | 'file' | 'memory' | 'empty'): string {
  if (mode === 'postgres') return 'PG ledger';
  if (mode === 'file') return 'File ledger';
  if (mode === 'memory') return 'Memory ledger';
  return 'Empty';
}

export function BrandAgentRepLedgerPanel() {
  const { records, mode, loading, reload } = useCommissionRecords();
  const summary = useMemo(() => summarizeBrandAgentRepLedger(records), [records]);

  return (
    <div className="space-y-4" data-testid="brand-agent-rep-ledger-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{summary.commissionRub.toLocaleString('ru-RU')} ₽ total</Badge>
        <Badge variant="outline">Pending: {summary.pending}</Badge>
        <Badge variant="outline">Approved: {summary.approved}</Badge>
        <Badge variant="outline" data-testid={`brand-agent-rep-ledger-source-${mode}`}>
          {ledgerModeLabel[mode]}
        </Badge>
        <Button size="sm" variant="outline" onClick={() => void reload()}>
          Refresh
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Commission ledger</CardTitle>
          <CardDescription>Brand oversight · order-level rows from workshop2_b2b_commissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-text-secondary text-sm">Загрузка ledger…</p>
          ) : records.length === 0 ? (
            <p className="text-text-secondary text-sm" data-testid="brand-agent-rep-ledger-empty">
              Нет записей — submit заказ с repId.
            </p>
          ) : (
            <ul className="space-y-2">
              {records.map((r) => (
                <li
                  key={r.id}
                  className="border-border-subtle flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  data-testid={`brand-agent-rep-record-${r.id}`}
                >
                  <div>
                    <p className="font-medium">{r.subAgentName}</p>
                    <p className="text-text-secondary text-xs">
                      {r.period} · {r.orderIds.join(', ')} ·{' '}
                      {r.commissionRub.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <Badge variant="outline">{statusLabels[r.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function BrandAgentRepRepsPanel() {
  const { records, loading } = useCommissionRecords();
  const names = useMemo(() => listBrandAgentRepNames(records), [records]);

  return (
    <div className="space-y-4" data-testid="brand-agent-rep-reps-panel">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Active reps</CardTitle>
          <CardDescription>RepSpark roster mirror from commission records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-text-secondary text-sm">Загрузка…</p>
          ) : names.length === 0 ? (
            <p className="text-text-secondary text-sm">Нет rep в ledger.</p>
          ) : (
            names.map((name) => (
              <div key={name} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{name}</span>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={brandAgentRepShopCommissionHref()}>Комиссия магазина</Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function BrandAgentRepShopPortalPanel() {
  const shop = buildShopAgentRepSession();

  return (
    <div className="space-y-4" data-testid="brand-agent-rep-shop-portal-panel">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Shop-side rep tools</CardTitle>
          <CardDescription>Сквозные роли — столп 3 магазин · контроль бренда.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={brandAgentRepShopPortalHref()}>Портал торгового представителя</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={brandAgentRepShopCommissionHref()}>Rep commission tab</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={shop.matrixHref}>Wholesale matrix</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
