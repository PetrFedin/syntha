'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Workshop2DossierPersistButton } from '@/components/brand/production/Workshop2DossierPersistButton';
import { useToast } from '@/hooks/use-toast';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { persistWorkshop2SupplierQcSnapshotToDossier } from '@/lib/production/workshop2-supplier-qc-dossier-persist';
import type { Workshop2SupplierQcScorecard } from '@/lib/production/workshop2-supplier-qc-scorecard';
import { putWorkshop2Wave29DossierPatch } from '@/lib/production/workshop2-wave29-persist-client';
import { useArticleWorkspace } from '@/components/brand/production/article-workspace-context';
import { Workshop2OperationalPgMirrorChip } from '@/components/brand/production/workshop2-operational-panel-chrome';
import { summarizeWorkshop2SupplierQcPgMirror } from '@/lib/production/workshop2-operational-pg-mirror-status';
import {
  formatWorkshop2PersistToastDescription,
  formatWorkshop2PersistToastTitle,
} from '@/lib/production/workshop2-persist-toast-messages';
import * as LucideIcons from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { WidgetContainer } from '@/components/design-system/widget-container';
import { workshop2DevWarn } from '@/lib/production/workshop2-dev-log';

interface ScorecardData {
  totalBatches: number;
  passed: number;
  failed: number;
  rework: number;
  passRate: number;
  defectTypes: { name: string; value: number }[];
  source?: 'purchase_orders' | 'empty';
  hintRu?: string;
}

const COLORS = {
  passed: '#10b981',
  failed: '#f43f5e',
  rework: '#f59e0b',
};

export function SupplierQcScorecard({
  supplierId,
  dossier = null,
  onDossierPersisted,
}: {
  supplierId: string;
  dossier?: Workshop2DossierPhase1 | null;
  onDossierPersisted?: (next: Workshop2DossierPhase1) => void;
}) {
  const { ref } = useArticleWorkspace();
  const { toast } = useToast();
  const [data, setData] = useState<ScorecardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [persisting, setPersisting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/brand/workshop2/qc/supplier-scorecard?supplierId=${supplierId}`)
      .then(async (res) => {
        const json = (await res.json()) as ScorecardData;
        if (active) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        workshop2DevWarn('qc-scorecard', 'Failed to fetch scorecard', {
          panel: 'supplier-qc-scorecard',
          cause: err,
        });
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [supplierId]);

  const pgMirror = summarizeWorkshop2SupplierQcPgMirror(dossier);

  const persistToDossier = useCallback(async () => {
    const base = dossier;
    if (!base || !data || data.source === 'empty') return;
    setPersisting(true);
    try {
      const scorecard: Workshop2SupplierQcScorecard = {
        supplierId,
        totalBatches: data.totalBatches,
        passed: data.passed,
        failed: data.failed,
        rework: data.rework,
        passRate: data.passRate,
        defectTypes: data.defectTypes,
        source: data.source ?? 'purchase_orders',
        hintRu: data.hintRu,
      };
      const res = await putWorkshop2Wave29DossierPatch({
        collectionId: ref.collectionId,
        articleId: String(ref.articleId),
        base,
        apply: (d) => persistWorkshop2SupplierQcSnapshotToDossier(d, scorecard),
        field: 'supplier_qc_mirror',
        updatedByLabel: 'qc-scorecard',
      });
      if (res.ok) onDossierPersisted?.(res.dossier);
      toast({
        title: formatWorkshop2PersistToastTitle({
          scopeLabelRu: 'Scorecard PO',
          ok: res.ok,
        }),
        description: formatWorkshop2PersistToastDescription({
          mirrorField: 'supplierQcSnapshot',
          ok: res.ok,
          okHintRu: 'Снимок PO scorecard записан в досье.',
          reason: res.reason,
        }),
        variant: res.ok ? 'default' : 'destructive',
      });
    } finally {
      setPersisting(false);
    }
  }, [data, dossier, onDossierPersisted, ref.articleId, ref.collectionId, supplierId, toast]);

  if (loading) {
    return (
      <WidgetContainer title="Рейтинг производителя">
        <div className="text-text-secondary flex h-48 items-center justify-center text-sm">
          Загрузка рейтинга...
        </div>
      </WidgetContainer>
    );
  }

  if (!data) {
    return (
      <WidgetContainer title="Рейтинг производителя">
        <div className="text-text-secondary flex h-48 items-center justify-center text-sm">
          Данные недоступны
        </div>
      </WidgetContainer>
    );
  }

  if (data.source === 'empty' || data.totalBatches === 0) {
    return (
      <WidgetContainer title="Рейтинг производителя (PO)">
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span data-testid="workshop2-supplier-qc-pg-chip">
            <Workshop2OperationalPgMirrorChip {...pgMirror} />
          </span>
        </div>
        <p className="text-text-secondary mt-3 text-sm leading-relaxed">
          {data.hintRu ??
            'Нет заказов на закупку с этим поставщиком — scorecard строится из PO, не из фиксированного mock.'}
        </p>
        <p className="text-text-muted mt-2 text-[11px]">supplierId: {supplierId}</p>
      </WidgetContainer>
    );
  }

  const pieData = [
    { name: 'Принято', value: data.passed, color: COLORS.passed },
    { name: 'Доработка', value: data.rework, color: COLORS.rework },
    { name: 'Брак', value: data.failed, color: COLORS.failed },
  ];

  return (
    <WidgetContainer title="Рейтинг производителя (AQL)">
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span data-testid="workshop2-supplier-qc-pg-chip">
          <Workshop2OperationalPgMirrorChip {...pgMirror} />
        </span>
        {dossier ? (
          <Workshop2DossierPersistButton
            busy={persisting}
            className="h-7 text-[10px]"
            title="supplierQcSnapshot → PG"
            onClick={() => void persistToDossier()}
          />
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-text-secondary mb-1 text-sm font-medium">Pass Rate</p>
          <div className="text-text-primary text-4xl font-bold">{data.passRate.toFixed(1)}%</div>
          <p className="text-text-muted mt-2 text-xs">{data.totalBatches} партий проверено</p>
        </div>

        <div className="flex h-40 flex-col items-center">
          <p className="text-text-secondary mb-2 text-xs font-semibold">Статус партий</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: '11px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
                itemStyle={{ color: '#0f172a' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex h-40 flex-col items-center">
          <p className="text-text-secondary mb-2 text-xs font-semibold">Частые дефекты</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.defectTypes}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 10, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  fontSize: '11px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="value" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetContainer>
  );
}
