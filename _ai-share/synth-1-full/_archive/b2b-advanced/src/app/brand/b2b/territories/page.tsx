'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Workshop2B2bCreditAccount } from '@/lib/production/workshop2-b2b-credit-hold';

type TerritoryRow = Workshop2B2bCreditAccount & {
  id: string;
  labelRu: string;
  active: boolean;
};

/** Wave 7 P1 #7: CRUD B2B territories → credit hold checkout. */
export default function BrandB2bTerritoriesPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<TerritoryRow[]>([]);
  const [form, setForm] = useState({
    territoryId: '',
    labelRu: '',
    creditLimitRub: '',
    openOrdersRub: '0',
    customerName: '',
  });

  const load = useCallback(async () => {
    const res = await fetch('/api/workshop2/b2b/territories', { cache: 'no-store' });
    const json = (await res.json()) as { ok?: boolean; territories?: TerritoryRow[] };
    if (json.territories) setRows(json.territories);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    const res = await fetch('/api/workshop2/b2b/territories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        territoryId: form.territoryId,
        labelRu: form.labelRu,
        creditLimitRub: Number(form.creditLimitRub),
        openOrdersRub: Number(form.openOrdersRub),
        customerName: form.customerName,
      }),
    });
    const json = (await res.json()) as { ok?: boolean; messageRu?: string };
    toast({
      title: json.ok ? 'Территория сохранена' : 'Ошибка',
      description: json.messageRu,
      variant: json.ok ? 'default' : 'destructive',
    });
    if (json.ok) void load();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">B2B — территории и credit hold</h1>
        <p className="mt-1 text-sm text-slate-600">
          Лимиты используются в checkout при <code>WORKSHOP2_B2B_CREDIT_HOLD=true</code>.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">Новая / обновить территорию</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="territoryId (RU-MOW)"
            value={form.territoryId}
            onChange={(e) => setForm((f) => ({ ...f, territoryId: e.target.value }))}
          />
          <Input
            placeholder="Название"
            value={form.labelRu}
            onChange={(e) => setForm((f) => ({ ...f, labelRu: e.target.value }))}
          />
          <Input
            placeholder="creditLimitRub"
            value={form.creditLimitRub}
            onChange={(e) => setForm((f) => ({ ...f, creditLimitRub: e.target.value }))}
          />
          <Input
            placeholder="openOrdersRub"
            value={form.openOrdersRub}
            onChange={(e) => setForm((f) => ({ ...f, openOrdersRub: e.target.value }))}
          />
          <Input
            placeholder="customerName"
            value={form.customerName}
            onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
            className="sm:col-span-2"
          />
        </div>
        <Button type="button" className="mt-3" onClick={() => void save()}>
          Сохранить
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] uppercase text-slate-500">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Лимит ₽</th>
              <th className="p-2">Открытые ₽</th>
              <th className="p-2">Доступно ₽</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.territoryId} className="border-t">
                <td className="p-2">
                  <div className="font-medium">{r.territoryId}</div>
                  <div className="text-[11px] text-slate-500">{r.labelRu ?? r.customerName}</div>
                </td>
                <td className="p-2">{r.creditLimitRub.toLocaleString('ru-RU')}</td>
                <td className="p-2">{r.openOrdersRub.toLocaleString('ru-RU')}</td>
                <td className="p-2">
                  {(r.creditLimitRub - r.openOrdersRub).toLocaleString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
