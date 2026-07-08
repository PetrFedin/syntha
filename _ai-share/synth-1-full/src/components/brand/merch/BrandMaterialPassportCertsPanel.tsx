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
  brandMaterialPassportCertsToCsv,
  summarizeBrandMaterialPassportCerts,
  type BrandMaterialPassportCertRow,
} from '@/lib/fashion/brand-material-passport-certs';
import {
  fetchBrandMaterialPassportCerts,
  patchBrandMaterialPassportCertReady,
} from '@/lib/fashion/brand-material-passport-certs-store';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

type Props = {
  collectionId?: string;
};

export function BrandMaterialPassportCertsPanel({ collectionId = 'SS27' }: Props) {
  const [rows, setRows] = useState<BrandMaterialPassportCertRow[]>([]);
  const [storageMode, setStorageMode] = useState<string>('demo');
  const [busySku, setBusySku] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const res = await fetchBrandMaterialPassportCerts(collectionId);
    setRows(res.rows ?? []);
    setStorageMode(res.storageMode ?? 'demo');
  }, [collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const summary = useMemo(() => summarizeBrandMaterialPassportCerts(rows), [rows]);

  const downloadCsv = () => {
    const blob = new Blob([brandMaterialPassportCertsToCsv(rows)], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `material-passport-certs-${collectionId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleReady = async (row: BrandMaterialPassportCertRow) => {
    setBusySku(row.sku);
    try {
      const res = await patchBrandMaterialPassportCertReady({
        collectionId,
        sku: row.sku,
        certReady: !row.certReady,
      });
      if (res.ok && res.rows) {
        setRows(res.rows);
        setStorageMode(res.storageMode ?? storageMode);
      }
    } finally {
      setBusySku(null);
    }
  };

  return (
    <div className="space-y-4" data-testid="brand-material-passport-certs-panel">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={downloadCsv}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV certs
        </Button>
        <Badge variant="secondary">Ready: {summary.ready}</Badge>
        <Badge variant="outline">Blocked: {summary.blocked}</Badge>
        <Badge
          variant="outline"
          data-testid={`brand-material-passport-certs-source-${storageMode}`}
        >
          {storageMode === 'pg' ? 'PG certs' : `${storageMode} certs`}
        </Badge>
        <Button variant="outline" size="sm" type="button" onClick={() => void reload()}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Material passport · certs</CardTitle>
          <CardDescription>
            Material Exchange: composition + care + sustainability · persisted for release gate.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[480px] overflow-x-auto overflow-y-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Composition</TableHead>
                <TableHead>Care</TableHead>
                <TableHead>Eco</TableHead>
                <TableHead>Gate</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.sku} data-testid={`brand-material-passport-cert-row-${row.sku}`}>
                  <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                  <TableCell>{row.hasComposition ? '✓' : '—'}</TableCell>
                  <TableCell>{row.hasCare ? '✓' : '—'}</TableCell>
                  <TableCell className="font-mono text-sm">{row.sustainabilityTags}</TableCell>
                  <TableCell className="text-xs">
                    {row.certReady ? (
                      <span className="text-emerald-600">ready</span>
                    ) : (
                      <span className="text-text-muted">{row.gapRu}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px]"
                      disabled={busySku != null || (!row.certReady && row.gapRu !== 'ok')}
                      onClick={() => void toggleReady(row)}
                      data-testid={`brand-material-passport-cert-toggle-${row.sku}`}
                    >
                      {busySku === row.sku ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : row.certReady ? (
                        'Revoke'
                      ) : (
                        'Mark ready'
                      )}
                    </Button>
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
