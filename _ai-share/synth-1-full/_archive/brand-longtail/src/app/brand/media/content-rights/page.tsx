'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PartnerDemoExportBar } from '@/components/brand/partner-demo-export-bar';
import { ROUTES } from '@/lib/routes';
import { PARTNER_DAM_POLICIES } from '@/lib/platform/partner-demo-data';
import { ArrowLeft, Shield, ImageIcon } from 'lucide-react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

const STORAGE_KEY = 'synth.dam.policyOverrides.v1';

function loadOverrides(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

function persistOverrides(map: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export default function DamContentRightsPage() {
  const [enabledById, setEnabledById] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    const o = loadOverrides();
    const m: Record<string, boolean> = {};
    for (const p of PARTNER_DAM_POLICIES) {
      m[p.id] = o[p.id] !== undefined ? o[p.id]! : p.enabled;
    }
    setEnabledById(m);
  }, []);

  const setRow = (id: string, enabled: boolean) => {
    setEnabledById((prev) => {
      const base: Record<string, boolean> = {};
      for (const p of PARTNER_DAM_POLICIES) {
        base[p.id] = prev?.[p.id] !== undefined ? prev[p.id]! : p.enabled;
      }
      const next = { ...base, [id]: enabled };
      persistOverrides(next);
      return next;
    });
  };

  return (
    <CabinetPageContent maxWidth="3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.media}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Shield className="h-6 w-6" />
              DAM: права и лицензии
            </h1>
            <p className="text-sm text-muted-foreground">
              Переключатели + localStorage; демо-источник —{' '}
              <code className="rounded bg-muted px-1 text-[10px]">PARTNER_DAM_POLICIES</code>.
            </p>
          </div>
        </div>
        <PartnerDemoExportBar />
      </div>

      <Button variant="secondary" size="sm" asChild>
        <Link href={ROUTES.brand.media}>
          <ImageIcon className="mr-2 h-3.5 w-3.5" />
          Media &amp; DAM
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Политики</CardTitle>
          <CardDescription>
            Интеграция с Brand DAM и маркетплейсами; API — синхронизация флагов по tenant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="hidden overflow-x-auto sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Политика</TableHead>
                  <TableHead>Область</TableHead>
                  <TableHead className="text-right">Вкл.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PARTNER_DAM_POLICIES.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm font-medium">{r.label}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.scope}</TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={enabledById ? enabledById[r.id] : r.enabled}
                        onCheckedChange={(v) => setRow(r.id, v)}
                        id={r.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-4 sm:hidden">
            {PARTNER_DAM_POLICIES.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
              >
                <div>
                  <Label htmlFor={`m-${r.id}`} className="text-sm">
                    {r.label}
                  </Label>
                  <p className="mt-1 text-[10px] text-muted-foreground">{r.scope}</p>
                </div>
                <Switch
                  checked={enabledById ? enabledById[r.id] : r.enabled}
                  onCheckedChange={(v) => setRow(r.id, v)}
                  id={`m-${r.id}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
