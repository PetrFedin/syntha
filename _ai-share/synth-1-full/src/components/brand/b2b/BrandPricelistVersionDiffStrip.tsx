'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WidgetCard } from '@/components/ui/widget-card';
import {
  buildBrandPricelistVersionDiffFields,
  isBrandPricelistVersionActive,
  pickDefaultBrandPricelistVersionDiffPair,
  type BrandPricelistVersionRow,
} from '@/lib/b2b/brand-pricelist-versions-feed';
import { PRICE_TIER_LABELS } from '@/lib/b2b/price-tiers';

type Props = {
  rows: readonly BrandPricelistVersionRow[];
};

export function BrandPricelistVersionDiffStrip({ rows }: Props) {
  const defaultPair = useMemo(() => pickDefaultBrandPricelistVersionDiffPair(rows), [rows]);
  const [baseId, setBaseId] = useState<string | undefined>(defaultPair?.baseId);
  const [targetId, setTargetId] = useState<string | undefined>(defaultPair?.targetId);

  const resolvedBaseId = baseId ?? defaultPair?.baseId;
  const resolvedTargetId = targetId ?? defaultPair?.targetId;
  const base = rows.find((row) => row.id === resolvedBaseId);
  const target = rows.find((row) => row.id === resolvedTargetId);

  const diffFields =
    base && target && base.id !== target.id
      ? buildBrandPricelistVersionDiffFields(base, target)
      : [];
  const changedCount = diffFields.filter((field) => field.changed).length;

  if (rows.length < 2) {
    return (
      <p className="text-text-secondary text-xs" data-testid="brand-pricelist-version-diff-empty">
        Нужно ≥2 версии для сравнения.
      </p>
    );
  }

  return (
    <WidgetCard
      title="Version diff"
      description="Сравнение multiplier / периода · base vs target перед shop tier sync."
    >
      <div className="space-y-3" data-testid="brand-pricelist-version-diff-strip">
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-xs">
            Base
            <Select value={resolvedBaseId} onValueChange={setBaseId}>
              <SelectTrigger className="h-8 w-52" data-testid="brand-pricelist-diff-base-select">
                <SelectValue placeholder="Base version" />
              </SelectTrigger>
              <SelectContent>
                {rows.map((row) => (
                  <SelectItem key={row.id} value={row.id}>
                    {row.name}
                    {isBrandPricelistVersionActive(row) ? ' · active' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-1 text-xs">
            Target
            <Select value={resolvedTargetId} onValueChange={setTargetId}>
              <SelectTrigger className="h-8 w-52" data-testid="brand-pricelist-diff-target-select">
                <SelectValue placeholder="Target version" />
              </SelectTrigger>
              <SelectContent>
                {rows.map((row) => (
                  <SelectItem key={row.id} value={row.id}>
                    {PRICE_TIER_LABELS[row.channel] ?? row.channel} · {row.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <Badge variant={changedCount ? 'secondary' : 'outline'} data-testid="brand-pricelist-diff-changed-count">
            {changedCount} changed
          </Badge>
        </div>

        {base && target && base.id === target.id ? (
          <p className="text-amber-950 text-xs" data-testid="brand-pricelist-diff-same-version">
            Выберите две разные версии.
          </p>
        ) : diffFields.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Base</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diffFields.map((field) => (
                  <TableRow
                    key={field.field}
                    data-testid={`brand-pricelist-diff-row-${field.field.toLowerCase().replace(/\s+/g, '-')}`}
                    className={field.changed ? 'bg-amber-50/40' : undefined}
                  >
                    <TableCell className="text-xs font-medium">{field.field}</TableCell>
                    <TableCell className="font-mono text-xs">{field.baseValue}</TableCell>
                    <TableCell className="font-mono text-xs">{field.targetValue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </div>
    </WidgetCard>
  );
}
