'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import {
  getLookbookProjects,
  addLookbookProject,
  updateLookbookProject,
  type LookbookProject,
  type LookbookVisibility,
} from '@/lib/b2b/lookbook-projects-store';
import { BookOpen, Plus, Eye, Lock, Calendar, FileText, Droplets } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

const BRAND_ID = 'brand_syntha_lab';
const BRAND_NAME = 'Syntha Lab';

export default function BrandLookbookProjectsPage() {
  const [projects, setProjects] = useState<LookbookProject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    lookbookUrl: '/lookbooks/new.pdf',
    visibility: 'invited' as LookbookVisibility,
    invitedPartnerIds: 'retail_msk_1, retail_msk_2',
    visibleUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const load = useCallback(() => setProjects(getLookbookProjects(BRAND_ID)), []);
  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = () => {
    const partnerIds = form.invitedPartnerIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    addLookbookProject({
      name: form.name || 'New Lookbook',
      brandId: BRAND_ID,
      brandName: BRAND_NAME,
      lookbookUrl: form.lookbookUrl,
      visibility: form.visibility,
      invitedPartnerIds: form.visibility === 'invited' ? partnerIds : [],
      visibleUntil: new Date(form.visibleUntil).toISOString(),
    });
    setForm({
      name: '',
      lookbookUrl: '/lookbooks/new.pdf',
      visibility: 'invited',
      invitedPartnerIds: 'retail_msk_1, retail_msk_2',
      visibleUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    setShowForm(false);
    load();
  };

  const setWatermarked = (id: string) => {
    updateLookbookProject(id, { watermarkedPdfUrl: `/lookbooks/${id}-watermarked.pdf` });
    load();
  };

  const now = new Date().toISOString();
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Лукбуки как проекты"
        leadPlain="Colect: права (кто видит, до какой даты), watermarked PDF, заказ из лукбука."
        actions={<BookOpen className="h-6 w-6 shrink-0 text-muted-foreground" aria-hidden />}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Проекты лукбуков</CardTitle>
              <CardDescription>
                Коллекция = проект: ссылка на лукбук, видимость и срок.
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowForm((x) => !x)} className="gap-1">
              <Plus className="h-4 w-4" /> Новый
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent className="border-border-subtle space-y-3 border-t pt-4">
            <input
              placeholder="Название"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              placeholder="URL лукбука / PDF"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={form.lookbookUrl}
              onChange={(e) => setForm((f) => ({ ...f, lookbookUrl: e.target.value }))}
            />
            <div className="flex items-center gap-4">
              <label className="text-sm">Кто видит:</label>
              <select
                className="rounded-lg border px-3 py-2 text-sm"
                value={form.visibility}
                onChange={(e) =>
                  setForm((f) => ({ ...f, visibility: e.target.value as LookbookVisibility }))
                }
              >
                <option value="all">Все партнёры</option>
                <option value="invited">Только приглашённые</option>
              </select>
              {form.visibility === 'invited' && (
                <input
                  placeholder="ID партнёров через запятую"
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  value={form.invitedPartnerIds}
                  onChange={(e) => setForm((f) => ({ ...f, invitedPartnerIds: e.target.value }))}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Виден до:</label>
              <input
                type="date"
                className="rounded-lg border px-3 py-2 text-sm"
                value={form.visibleUntil}
                onChange={(e) => setForm((f) => ({ ...f, visibleUntil: e.target.value }))}
              />
            </div>
            <Button size="sm" onClick={handleAdd}>
              Добавить проект
            </Button>
          </CardContent>
        )}
        <CardContent className={showForm ? 'border-border-subtle border-t' : ''}>
          <ul className="space-y-3">
            {projects.map((p) => {
              const expired = p.visibleUntil < now;
              return (
                <li
                  key={p.id}
                  className="border-border-default flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-text-muted h-5 w-5" />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <div className="text-text-secondary mt-0.5 flex items-center gap-2 text-xs">
                        {p.visibility === 'all' ? (
                          <>
                            <Eye className="h-3 w-3" /> Все
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" /> Приглашённые
                          </>
                        )}
                        <span>
                          <Calendar className="mr-0.5 inline h-3 w-3" /> до{' '}
                          {new Date(p.visibleUntil).toLocaleDateString('ru-RU')}
                        </span>
                        {expired && <Badge variant="secondary">Истёк</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!p.watermarkedPdfUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setWatermarked(p.id)}
                        className="gap-1"
                      >
                        <Droplets className="h-3 w-3" /> Watermarked PDF
                      </Button>
                    )}
                    {p.watermarkedPdfUrl && (
                      <Badge variant="outline" className="gap-1">
                        <Droplets className="h-3 w-3" /> PDF с водяным знаком
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <a href={p.lookbookUrl} target="_blank" rel="noopener noreferrer">
                        Открыть
                      </a>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.b2bOrders}>Заказы B2B</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.partnerMap}>Карта партнёров</Link>
        </Button>
      </div>
    </CabinetPageContent>
  );
}
