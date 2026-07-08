'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileUp, Mail, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import {
  parseOrderFromText,
  type SmartOrderParsedLine,
  type SmartOrderParseResult,
} from '@/lib/ai/ai-smart-order';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import { tid } from '@/lib/ui/test-ids';

/** OroCommerce: AI SmartOrder — черновик заказа из PDF или email PO */
export function ShopB2bAiSmartOrderLegacyPage() {
  const [mode, setMode] = useState<'pdf' | 'email'>('email');
  const [emailText, setEmailText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<SmartOrderParseResult | null>(null);
  const [createdDraft, setCreatedDraft] = useState(false);

  const handleParse = useCallback(() => {
    const text = mode === 'email' ? emailText : emailText; // PDF в демо тоже через текст (в проде — file upload → OCR)
    if (!text.trim()) return;
    setParsing(true);
    setResult(null);
    setTimeout(() => {
      const res = parseOrderFromText(text, mode);
      setResult(res);
      setParsing(false);
    }, 1200);
  }, [mode, emailText]);

  const handleCreateDraft = useCallback(() => {
    if (!result?.lines.length) return;
    setCreatedDraft(true);
    // В проде: вызов API или добавление в b2bCart / working order store
  }, [result]);

  return (
    <CabinetPageContent
      maxWidth="3xl"
      className="min-h-[200px] space-y-6"
      data-testid={tid.page('shop-b2b-ai-smart-order')}
    >
      <ShopB2bContentHeader lead="PDF или текст письма с PO — черновик заказа (OroCommerce AI SmartOrder)." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Источник заказа</CardTitle>
          <CardDescription>
            Загрузите файл PO (PDF) или вставьте текст письма с заказом
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={mode === 'pdf' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('pdf')}
            >
              <FileUp className="mr-1 size-4" /> PDF
            </Button>
            <Button
              variant={mode === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('email')}
            >
              <Mail className="mr-1 size-4" /> Email / текст
            </Button>
          </div>
          <Textarea
            placeholder={
              mode === 'email'
                ? 'Вставьте текст письма с заказом (артикулы и количества)...'
                : 'Или вставьте текст, извлечённый из PDF...'
            }
            className="min-h-[140px] font-mono text-sm"
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setEmailText('FW26-JKT-01 24 4500.00\nFW26-TEE-02 50 1200\nSS26-DRS-03 12 8900')
            }
          >
            Вставить пример
          </Button>
          {mode === 'pdf' && (
            <p className="text-text-secondary text-xs">
              Демо: вставьте текст из PDF. В проде будет загрузка файла и автоматический OCR.
            </p>
          )}
          <Button onClick={handleParse} disabled={!emailText.trim() || parsing}>
            {parsing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 size-4" />
            )}
            {parsing ? 'Парсинг...' : 'Создать черновик с AI'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-accent-primary/30 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? <CheckCircle className="size-5 text-green-600" /> : null}
              Результат парсинга
            </CardTitle>
            {result.warnings?.length ? (
              <CardDescription className="text-amber-600">
                {result.warnings.join(' ')}
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-2">Стиль / SKU</th>
                  <th className="py-2 pr-2">Кол-во</th>
                  <th className="py-2 pr-2">Цена</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line, i) => (
                  <tr key={i} className="border-border-subtle border-b">
                    <td className="py-2 pr-2 font-mono">{line.style ?? line.sku ?? '—'}</td>
                    <td className="py-2 pr-2">{line.quantity}</td>
                    <td className="py-2 pr-2">
                      {line.price != null ? line.price.toLocaleString('ru-RU') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleCreateDraft} disabled={createdDraft}>
                {createdDraft ? 'Черновик создан' : 'Добавить в черновик заказа'}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.shop.b2bMatrix}>Открыть в матрице</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bWorkingOrder}>Working Order (Excel)</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={LEGACY_ROUTES.shop.b2bOrderDrafts}>Черновики</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        title="Связанные разделы"
        className="mt-6"
        links={getShopB2BHubLinks().filter(
          (l) =>
            l.href === LEGACY_ROUTES.shop.b2bQuickOrder ||
            l.href === LEGACY_ROUTES.shop.b2bGridOrdering ||
            l.href === ROUTES.shop.b2bMatrix
        )}
      />
    </CabinetPageContent>
  );
}
