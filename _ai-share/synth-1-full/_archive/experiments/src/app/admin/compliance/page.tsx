'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Download,
  Send,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { getMetricValueToneClass } from '@/lib/ui/semantic-data-tones';

const EDO_STATUS_BADGE_CLASS: Record<string, string> = {
  signed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  sent: 'bg-blue-50 text-blue-600 border-blue-100',
};

const CZ_METRIC_TONE_KEY: Record<string, 'rose' | 'indigo' | 'slate'> = {
  'text-rose-600': 'rose',
  'text-accent-primary': 'indigo',
  'text-text-primary': 'slate',
};
import { EDODocument, ChestnyZNAKCode } from '@/lib/types/compliance';

/**
 * Compliance Dashboard UI (Russian Layer)
 * Управление маркировкой Честный ЗНАК и ЭДО (УПД/УКД).
 */

export default function ComplianceDashboard() {
  const [activeTab, setActiveTab] = useState('edo');

  // Mock Data
  const edoDocs: EDODocument[] = [
    {
      id: 'doc-101',
      type: 'UPD',
      number: 'УПД-445/25',
      date: '2025-03-05',
      senderId: 'brand-ltd-1',
      receiverId: 'retail-store-2',
      totalAmount: 450000,
      vatAmount: 75000,
      currency: 'RUB',
      status: 'signed',
      xmlUrl: '#',
      items: [],
      operator: 'diadoc',
    },
    {
      id: 'doc-102',
      type: 'UPD',
      number: 'УПД-446/25',
      date: '2025-03-07',
      senderId: 'brand-ltd-1',
      receiverId: 'warehouse-global',
      totalAmount: 1200000,
      vatAmount: 200000,
      currency: 'RUB',
      status: 'sent',
      xmlUrl: '#',
      items: [],
      operator: 'diadoc',
    },
  ];

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 pb-16 duration-700 animate-in fade-in">
      <div className="border-border-subtle flex flex-col items-start justify-between gap-3 border-b pb-3 md:flex-row md:items-end">
        <div className="space-y-0.5">
          <div className="text-text-muted flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em]">
            <span>Admin</span>
            <ChevronRight className="h-2 w-2" />
            <span className="text-text-muted">Regulatory Compliance</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-text-primary font-headline text-base font-bold uppercase leading-none tracking-tighter">
              Security & Legal Hub 2.0
            </h1>
            <Badge
              variant="outline"
              className="bg-accent-primary/10 text-accent-primary border-accent-primary/20 h-4 gap-1 px-1.5 text-[7px] font-bold uppercase tracking-widest shadow-sm transition-all"
            >
              <span className="bg-accent-primary h-1.5 w-1.5 animate-pulse rounded-full" /> EDO
              STATUS: SYNCED
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-border-default hover:bg-bg-surface2 h-8 rounded-lg px-3 text-[9px] font-bold uppercase tracking-widest shadow-sm transition-all"
          >
            <Download className="text-text-muted mr-1.5 h-3.5 w-3.5" /> CRPT Manifest
          </Button>
          <Button className="bg-text-primary hover:bg-accent-primary border-text-primary h-8 gap-1.5 rounded-lg border px-4 text-[9px] font-bold uppercase tracking-widest text-white shadow-lg transition-all">
            <ShieldCheck className="h-3.5 w-3.5" /> Identity Verify
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edo" className="w-full" onValueChange={setActiveTab}>
        {/* cabinetSurface v1 */}
        <TabsList className={cn(cabinetSurface.tabsList, 'mb-4 max-w-[320px] shadow-inner')}>
          <TabsTrigger
            value="edo"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7 flex-1 px-4 text-[9px] transition-all data-[state=active]:border'
            )}
          >
            <FileText className="mr-2 h-3 w-3" /> EDO Module
          </TabsTrigger>
          <TabsTrigger
            value="cz"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7 flex-1 px-4 text-[9px] transition-all data-[state=active]:border'
            )}
          >
            <QrCode className="mr-2 h-3 w-3" /> Chestny ZNAK
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edo" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card className="border-border-subtle hover:border-accent-primary/20 overflow-hidden rounded-xl border bg-white shadow-sm transition-all">
            <div className="border-border-subtle bg-bg-surface2/80 border-b p-4">
              <h3 className="text-text-primary text-[10px] font-bold uppercase leading-none tracking-widest">
                Document Ledger (Diadoc)
              </h3>
              <p className="text-text-muted mt-1 text-[8px] font-bold uppercase tracking-widest opacity-60">
                Legal Entity Verification & Transmission Pipeline
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-bg-surface2/80 hover:bg-bg-surface2/80 border-border-subtle border-b">
                  <TableHead className="text-text-muted h-10 px-4 text-[9px] font-bold uppercase tracking-[0.2em]">
                    Entity Type
                  </TableHead>
                  <TableHead className="text-text-muted h-10 text-[9px] font-bold uppercase tracking-[0.2em]">
                    Reference & Date
                  </TableHead>
                  <TableHead className="text-text-muted h-10 text-[9px] font-bold uppercase tracking-[0.2em]">
                    Counterparty
                  </TableHead>
                  <TableHead className="text-text-muted h-10 text-[9px] font-bold uppercase tracking-[0.2em]">
                    Magnitude (VAT Incl.)
                  </TableHead>
                  <TableHead className="text-text-muted h-10 text-center text-[9px] font-bold uppercase tracking-[0.2em]">
                    Status
                  </TableHead>
                  <TableHead className="text-text-muted h-10 w-24 px-4 text-right text-[9px] font-bold uppercase tracking-[0.2em]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-border-subtle divide-y">
                {edoDocs.map((doc) => (
                  <TableRow
                    key={doc.id}
                    className="hover:bg-bg-surface2/80 group h-12 transition-all"
                  >
                    <TableCell className="text-accent-primary px-4 text-[10px] font-bold uppercase">
                      {doc.type}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-text-primary text-[11px] font-bold uppercase tracking-tight">
                          {doc.number}
                        </span>
                        <span className="text-text-muted text-[9px] font-bold uppercase tracking-widest opacity-60">
                          {doc.date}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary text-[10px] font-bold uppercase tracking-tight">
                      {doc.receiverId}
                    </TableCell>
                    <TableCell className="text-text-primary text-[11px] font-bold italic tabular-nums tracking-tighter">
                      {doc.totalAmount.toLocaleString()} ₽
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          'h-3.5 rounded border px-1.5 text-[7px] font-bold uppercase tracking-widest shadow-sm transition-all',
                          EDO_STATUS_BADGE_CLASS[doc.status] ?? EDO_STATUS_BADGE_CLASS.sent
                        )}
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 transition-all group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-text-primary/90 text-text-muted h-7 w-7 rounded-lg transition-all hover:text-white"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-accent-primary text-accent-primary h-7 w-7 rounded-lg transition-all hover:text-white"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="cz" className={cabinetSurface.cabinetProfileTabPanel}>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                label: 'KIZ Inventory (Marking)',
                val: '12,450',
                sub: 'Available via CRPT',
                color: 'text-accent-primary',
                bg: 'bg-accent-primary/10',
              },
              {
                label: 'Operational Circulation',
                val: '8,920',
                sub: 'Active nodes',
                color: 'text-text-primary',
                bg: 'bg-bg-surface2/80',
              },
              {
                label: 'MTK Exceptions',
                val: '24',
                sub: 'Attention required',
                color: 'text-rose-600',
                bg: 'bg-rose-50/50',
              },
            ].map((m, i) => (
              <Card
                key={i}
                className="border-border-subtle hover:border-accent-primary/20 group relative overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition-all"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-text-muted text-[9px] font-bold uppercase leading-none tracking-[0.15em]">
                    {m.label}
                  </span>
                  {CZ_METRIC_TONE_KEY[m.color] === 'rose' && (
                    <AlertCircle
                      className={cn('h-3 w-3 animate-pulse', getMetricValueToneClass('rose'))}
                    />
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      'text-sm font-bold uppercase tabular-nums leading-none tracking-tighter',
                      getMetricValueToneClass(CZ_METRIC_TONE_KEY[m.color] ?? 'slate')
                    )}
                  >
                    {m.val}
                  </span>
                </div>
                <p className="text-text-muted mt-2 text-[8px] font-bold uppercase tracking-widest opacity-60">
                  {m.sub}
                </p>
              </Card>
            ))}
          </div>

          <Card className="border-border-subtle hover:border-accent-primary/20 overflow-hidden rounded-xl border bg-white shadow-sm transition-all">
            <div className="border-border-subtle bg-bg-surface2/80 border-b p-4">
              <h3 className="text-text-primary text-[10px] font-bold uppercase leading-none tracking-widest">
                Serial Protocol (KIZ Orders)
              </h3>
              <p className="text-text-muted mt-1 text-[8px] font-bold uppercase tracking-widest opacity-60">
                Production Unit Tracking & GS1 Alignment
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-bg-surface2/80 hover:bg-bg-surface2/80 border-border-subtle border-b">
                  <TableHead className="text-text-muted h-10 px-4 text-[9px] font-bold uppercase tracking-[0.2em]">
                    Sequence ID
                  </TableHead>
                  <TableHead className="text-text-muted h-10 text-[9px] font-bold uppercase tracking-[0.2em]">
                    Entity / GTIN
                  </TableHead>
                  <TableHead className="text-text-muted h-10 text-right text-[9px] font-bold uppercase tracking-[0.2em]">
                    Volume
                  </TableHead>
                  <TableHead className="text-text-muted h-10 text-[9px] font-bold uppercase tracking-[0.2em]">
                    Timeline
                  </TableHead>
                  <TableHead className="text-text-muted h-10 text-center text-[9px] font-bold uppercase tracking-[0.2em]">
                    CRPT Status
                  </TableHead>
                  <TableHead className="text-text-muted h-10 w-24 px-4 text-right text-[9px] font-bold uppercase tracking-[0.2em]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-border-subtle divide-y">
                <TableRow className="hover:bg-bg-surface2/80 group h-12 transition-all">
                  <TableCell className="text-text-muted px-4 font-mono text-[9px] font-bold">
                    ORD-MARK-99821
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-text-primary text-[11px] font-bold uppercase tracking-tight">
                        Cotton T-Shirt Black
                      </span>
                      <span className="text-text-muted text-[9px] font-bold uppercase tracking-widest opacity-60">
                        GTIN: 4607123456789
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-text-primary text-[11px] font-bold tabular-nums">
                      500
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-text-muted text-[10px] font-bold uppercase tabular-nums">
                      2025-03-01
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="h-3.5 rounded border-emerald-100 bg-emerald-50 px-1.5 text-[7px] font-bold uppercase tracking-widest text-emerald-600 shadow-sm"
                    >
                      Ready
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-bg-surface2 border-border-subtle text-text-secondary hover:text-accent-primary h-7 rounded-lg border px-3 text-[8px] font-bold uppercase tracking-widest shadow-inner transition-all hover:bg-white group-hover:bg-white"
                    >
                      <Download className="mr-1.5 h-3 w-3" /> Manifest PDF
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </CabinetPageContent>
  );
}
