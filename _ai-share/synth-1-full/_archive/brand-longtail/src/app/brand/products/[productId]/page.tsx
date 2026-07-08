'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProductEdit } from './hooks/useProductEdit';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, Loader2, Save, Sparkles, Package, Layers } from 'lucide-react';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { Badge } from '@/components/ui/badge';

export default function ProductEditPage({
  params: paramsPromise,
}: {
  params: Promise<{ productId: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { form, loading, onSubmit } = useProductEdit(params.productId);
  const [aiLoading, setAiLoading] = useState(false);
  const [includeSeo, setIncludeSeo] = useState(false);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <div className="container max-w-5xl space-y-6 py-10">
      <SectionInfoCard
        title="Редактирование товара"
        description="Карточка SKU: данные, медиа, BOM. Связи: Products, Variant Matrix, Production, Inventory, Linesheets."
        icon={Package}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              SKU
            </Badge>
            <Button variant="outline" size="sm" className="ml-1 h-7 text-[9px]" asChild>
              <Link href="/brand/products">Products</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/products/matrix">
                <Layers className="mr-1 h-3 w-3" /> Matrix
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/production">Production</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/inventory">Inventory</Link>
            </Button>
          </>
        }
      />
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 rounded-xl"
        >
          <ChevronLeft className="h-4 w-4" /> Назад
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          className="gap-2 rounded-xl bg-black px-6 text-white"
        >
          <Save className="h-4 w-4" /> Сохранить
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card className="rounded-3xl border-none bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase">Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название</FormLabel>
                      <FormControl>
                        <Input placeholder="Название товара" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Артикул (SKU)</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU-123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цена (₽)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Категория</FormLabel>
                      <FormControl>
                        <Input placeholder="Платья" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      Описание
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={aiLoading || !form.watch('name')}
                        onClick={async () => {
                          const vals = form.getValues();
                          if (!vals.name || !vals.category) return;
                          setAiLoading(true);
                          try {
                            const res = await fetch('/api/ai/product-description', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: vals.name,
                                brand:
                                  (vals as any).brand ??
                                  (vals.sku?.startsWith('SYN') ? 'Syntha' : 'Nordic Wool'),
                                category: vals.category,
                                color:
                                  (vals as any).availableColors?.[0]?.name ??
                                  (vals as any).color ??
                                  'Черный',
                                composition: (vals as any).composition
                                  ?.map((c: any) => `${c.material} ${c.percentage}%`)
                                  .join(', '),
                                tags: (vals as any).tags,
                                sustainability: (vals as any).sustainability,
                                existingDescription: vals.description,
                                includeSeo,
                              }),
                            });
                            const json = (await res.json()) as {
                              description?: string;
                              metaTitle?: string;
                              metaDescription?: string;
                            };
                            if (json.description) form.setValue('description', json.description);
                            if (includeSeo && (json.metaTitle || json.metaDescription)) {
                              const prev = form.getValues('seo') ?? {};
                              form.setValue('seo', {
                                ...prev,
                                metaTitle: json.metaTitle ?? prev.metaTitle,
                                metaDescription: json.metaDescription ?? prev.metaDescription,
                              });
                            }
                          } finally {
                            setAiLoading(false);
                          }
                        }}
                      >
                        {aiLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        Сгенерировать
                      </Button>
                    </FormLabel>
                    <label className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Checkbox checked={includeSeo} onCheckedChange={(v) => setIncludeSeo(!!v)} />
                      Включить SEO (metaTitle, metaDescription)
                    </label>
                    <FormControl>
                      <Textarea
                        placeholder="Описание товара для карточки"
                        {...field}
                        rows={4}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      Теги стиля
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={aiLoading || !form.watch('name')}
                        onClick={async () => {
                          const vals = form.getValues();
                          if (!vals.name || !vals.category) return;
                          setAiLoading(true);
                          try {
                            const res = await fetch('/api/ai/infer-tags', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: vals.name,
                                category: vals.category,
                                description: vals.description,
                                color:
                                  (vals as any).availableColors?.[0]?.name ??
                                  (vals as any).color ??
                                  '',
                              }),
                            });
                            const json = (await res.json()) as { tags?: string[] };
                            if (json.tags?.length) form.setValue('tags', json.tags);
                          } finally {
                            setAiLoading(false);
                          }
                        }}
                      >
                        {aiLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        Автотегировать
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="минимализм, casual, formal…"
                        value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? e.target.value.split(/,\s*/) : [])
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="rounded-xl border-2 border-dashed bg-white/50 p-3 text-center font-bold uppercase tracking-widest text-slate-400">
            Секции инвентаря, медиа и атрибутов рефакторятся...
          </div>
        </form>
      </Form>
    </div>
  );
}
