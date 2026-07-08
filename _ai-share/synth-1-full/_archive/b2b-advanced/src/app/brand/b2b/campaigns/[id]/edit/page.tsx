'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseWorkshop2B2bCampaignId } from '@/lib/production/workshop2-b2b-wave22-parity';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

/** Wave 22: минимальный редактор B2B кампании → showroom PG publish. */
export default function BrandB2bCampaignEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = decodeURIComponent(params.id ?? '');
  const parsed = parseWorkshop2B2bCampaignId(campaignId);

  const [tier, setTier] = useState<'standard' | 'vip' | 'prebook'>('standard');
  const [moq, setMoq] = useState('10');
  const [windowStart, setWindowStart] = useState('');
  const [windowEnd, setWindowEnd] = useState('');
  const [articleIds, setArticleIds] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!parsed) return;
    setArticleIds(parsed.articleId);
    void fetch(
      `/api/workshop2/articles/${encodeURIComponent(parsed.collectionId)}/${encodeURIComponent(parsed.articleId)}/showroom`,
      { cache: 'no-store', headers: buildWorkshop2ApiRequestHeaders() }
    )
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as {
          campaign?: {
            moq?: number;
            windowStart?: string;
            windowEnd?: string;
            visibilityTier?: typeof tier;
            articleIds?: string[];
            published?: boolean;
          };
        };
      })
      .then((json) => {
        const c = json?.campaign;
        if (!c) return;
        if (c.moq != null) setMoq(String(c.moq));
        if (c.windowStart) setWindowStart(c.windowStart.slice(0, 10));
        if (c.windowEnd) setWindowEnd(c.windowEnd.slice(0, 10));
        if (c.visibilityTier) setTier(c.visibilityTier);
        if (c.articleIds?.length) setArticleIds(c.articleIds.join(', '));
      })
      .catch(() => setMessage('Не удалось загрузить кампанию из PG'));
  }, [parsed]);

  const save = useCallback(async () => {
    if (!parsed) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/workshop2/articles/${encodeURIComponent(parsed.collectionId)}/${encodeURIComponent(parsed.articleId)}/showroom`,
        {
          method: 'PUT',
          headers: buildWorkshop2ApiRequestHeaders(),
          body: JSON.stringify({
            published: true,
            moq: Number(moq) || 1,
            windowStart: windowStart || undefined,
            windowEnd: windowEnd || undefined,
            visibilityTier: tier,
            articleIds: articleIds
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          }),
        }
      );
      const json = (await res.json()) as { messageRu?: string; message?: string };
      setMessage(json.messageRu ?? json.message ?? (res.ok ? 'Сохранено' : 'Ошибка'));
      if (res.ok) router.push('/brand/b2b/linesheet-campaigns');
    } catch {
      setMessage('Сеть недоступна');
    } finally {
      setBusy(false);
    }
  }, [articleIds, moq, parsed, router, tier, windowEnd, windowStart]);

  if (!parsed) {
    return (
      <CabinetPageContent>
        <p className="text-sm">Некорректный id кампании (ожидается collectionId::articleId).</p>
      </CabinetPageContent>
    );
  }

  return (
    <CabinetPageContent maxWidth="lg" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Редактор B2B кампании</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/brand/b2b/linesheet-campaigns">← Кампании</Link>
        </Button>
      </div>
      <p className="text-text-muted text-sm">
        {parsed.collectionId} · {parsed.articleId}
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Публикация в showroom PG</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tier видимости</Label>
            <select
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
              value={tier}
              onChange={(e) => setTier(e.target.value as typeof tier)}
            >
              <option value="standard">standard</option>
              <option value="prebook">prebook</option>
              <option value="vip">vip</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>MOQ override</Label>
            <Input value={moq} onChange={(e) => setMoq(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Окно start</Label>
            <Input
              type="date"
              value={windowStart}
              onChange={(e) => setWindowStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Окно end</Label>
            <Input type="date" value={windowEnd} onChange={(e) => setWindowEnd(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Article ids (через запятую)</Label>
            <Input value={articleIds} onChange={(e) => setArticleIds(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {message ? <p className="text-sm">{message}</p> : null}

      <Button disabled={busy} onClick={() => void save()}>
        {busy ? 'Сохранение…' : 'Опубликовать в showroom'}
      </Button>
    </CabinetPageContent>
  );
}
