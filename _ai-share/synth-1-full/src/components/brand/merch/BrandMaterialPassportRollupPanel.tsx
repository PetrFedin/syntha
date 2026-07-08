'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  brandMaterialPassportRollupToCsv,
  summarizeBrandMaterialPassportRollup,
  type BrandMaterialPassportRollupRow,
} from '@/lib/fashion/brand-material-passport-rollup';
import {
  fetchBrandMaterialPassportRollup,
  refreshBrandMaterialPassportRollup,
} from '@/lib/fashion/brand-material-passport-rollup-store';
import { downloadJsonFile } from '@/lib/platform/json-io';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

type Props = {
  collectionId?: string;
};

function sourceLabel(source: BrandMaterialPassportRollupRow['source']): string {
  if (source === 'pg') return 'PG';
  if (source === 'dossier') return 'ТЗ';
  return 'catalog';
}

export function BrandMaterialPassportRollupPanel({ collectionId = 'SS27' }: Props) {
  const [rows, setRows] = useState<BrandMaterialPassportRollupRow[]>([]);
  const [storageMode, setStorageMode] = useState<string>('demo');
  const [dossierLinked, setDossierLinked] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await fetchBrandMaterialPassportRollup(collectionId);
    setRows(res.rows ?? []);
    setStorageMode(res.storageMode ?? 'demo');
    setDossierLinked(res.dossierLinked ?? false);
  }, [collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const summary = useMemo(() => summarizeBrandMaterialPassportRollup(rows), [rows]);

  const downloadCsv = () => {
    const blob = new Blob([brandMaterialPassportRollupToCsv(rows)], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `material-passport-rollup-${collectionId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const syncRollup = async () => {
    setBusy(true);
    try {
      const res = await refreshBrandMaterialPassportRollup(collectionId);
      if (res.ok && res.rows) {
        setRows(res.rows);
        setStorageMode(res.storageMode ?? storageMode);
        setDossierLinked(res.dossierLinked ?? dossierLinked);
      } else {
        await reload();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="brand-material-passport-rollup-panel">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={downloadCsv}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV rollup
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => downloadJsonFile(`material-passport-rollup-${collectionId}.json`, rows)}
        >
          JSON
        </Button>
        <Badge variant="secondary">
          Composition: {summary.withComposition}/{summary.total}
        </Badge>
        {dossierLinked ? (
          <Badge variant="outline" data-testid="brand-material-passport-rollup-dossier-linked">
            ТЗ dossier
          </Badge>
        ) : null}
        <Badge
          variant="outline"
          data-testid={`brand-material-passport-rollup-source-${storageMode}`}
        >
          {storageMode === 'pg' ? 'PG rollup' : `${storageMode} rollup`}
        </Badge>
        <Button variant="outline" size="sm" type="button" onClick={() => void reload()}>
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={busy}
          onClick={() => void syncRollup()}
          data-testid="brand-material-passport-rollup-sync"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Sync catalog + ТЗ'}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Material passport · rollup</CardTitle>
          <CardDescription>
            Состав и care по SKU · persisted PG/file · overlay из Workshop2 dossier (ТЗ).
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[480px] overflow-x-auto overflow-y-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Цвет</TableHead>
                <TableHead>Сезон</TableHead>
                <TableHead>Состав</TableHead>
                <TableHead>Care</TableHead>
                <TableHead>SoT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.sku}
                  data-testid={`brand-material-passport-rollup-row-${row.sku}`}
                >
                  <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                  <TableCell className="max-w-[160px] truncate text-xs">
                    {row.name.replace(/""/g, '"')}
                  </TableCell>
                  <TableCell className="text-xs">{row.color}</TableCell>
                  <TableCell className="text-xs">{row.season}</TableCell>
                  <TableCell
                    className="max-w-[200px] truncate text-xs"
                    title={row.compositionText.replace(/""/g, '"')}
                  >
                    {row.compositionText.replace(/""/g, '"') || '—'}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    {row.careIds || '—'}
                  </TableCell>
                  <TableCell className="text-[10px] uppercase text-muted-foreground">
                    {sourceLabel(row.source)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
