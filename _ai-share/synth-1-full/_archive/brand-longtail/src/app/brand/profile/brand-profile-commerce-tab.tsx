'use client';

import type { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock, DollarSign, Package, Palette, Truck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

export type BrandProfileCommerceTermsState = {
  moq: string;
  leadTime: string;
  currency: string;
  shipping: string;
  productionCapacity: string;
  sampleDevelopment: string;
};

export type BrandProfileCommerceTabProps = {
  commerceTerms: BrandProfileCommerceTermsState;
  setCommerceTerms: Dispatch<SetStateAction<BrandProfileCommerceTermsState>>;
  isEditing: boolean;
  tabPanelClassName: string;
};

export function BrandProfileCommerceTab({
  commerceTerms,
  setCommerceTerms,
  isEditing,
  tabPanelClassName,
}: BrandProfileCommerceTabProps) {
  return (
    <TabsContent value="commerce" className={tabPanelClassName}>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-1">
          <div className="bg-accent-primary h-1 w-5 rounded-full" />
          <h2 className="text-text-primary text-sm font-semibold">Условия оптовой торговли</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(
            [
              {
                key: 'moq' as const,
                label: 'Мин. заказ (MOQ)',
                icon: Package,
                color: 'bg-accent-soft',
                text: 'text-accent-primary',
              },
              {
                key: 'leadTime' as const,
                label: 'Срок производства',
                icon: Clock,
                color: 'bg-amber-50',
                text: 'text-amber-600',
              },
              {
                key: 'currency' as const,
                label: 'Валюта оплаты',
                icon: DollarSign,
                color: 'bg-state-success/10',
                text: 'text-state-success',
              },
              {
                key: 'shipping' as const,
                label: 'Условия доставки',
                icon: Truck,
                color: 'bg-blue-50',
                text: 'text-blue-600',
              },
              {
                key: 'productionCapacity' as const,
                label: 'Мощность производства',
                icon: Zap,
                color: 'bg-accent-primary/10',
                text: 'text-accent-primary',
              },
              {
                key: 'sampleDevelopment' as const,
                label: 'Срок изготовления сэмпла',
                icon: Palette,
                color: 'bg-state-error/10',
                text: 'text-state-error',
              },
            ] as const
          ).map((item, i) => (
            <Card
              key={i}
              className="border-border-subtle hover:border-accent-soft group rounded-xl border bg-white p-4 shadow-sm transition-all"
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-lg border border-transparent shadow-sm transition-transform group-hover:scale-110',
                    item.color,
                    item.text
                  )}
                >
                  <item.icon className="size-4" />
                </div>
                <span className="text-text-muted text-xs font-medium">{item.label}</span>
              </div>
              {isEditing ? (
                <Input
                  value={commerceTerms[item.key]}
                  onChange={(e) =>
                    setCommerceTerms((prev) => ({ ...prev, [item.key]: e.target.value }))
                  }
                  className="bg-bg-surface2 h-8 rounded-lg border-none text-[13px] font-bold uppercase shadow-inner"
                />
              ) : (
                <p className="text-text-primary text-base font-bold tracking-tight">
                  {commerceTerms[item.key]}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="bg-state-success h-1 w-5 rounded-full" />
          <h2 className="text-text-primary text-sm font-semibold">Условия по тирам партнёров</h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-accent-primary h-6 text-[8px] font-bold"
          >
            <Link href={ROUTES.brand.pricing}>
              Прайсинг <ArrowUpRight className="inline size-2.5" />
            </Link>
          </Button>
        </div>
        <Card className="border-border-subtle from-bg-surface2 to-bg-surface rounded-xl border bg-gradient-to-br p-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'VIP', discount: '45%', color: 'bg-amber-50 border-amber-100' },
              {
                label: 'Retail',
                discount: '40%',
                color: 'bg-accent-soft border-accent-soft',
              },
              {
                label: 'Market',
                discount: '50%',
                color: 'bg-bg-surface2 border-border-subtle',
              },
            ].map((t) => (
              <div key={t.label} className={cn('rounded-lg border p-3', t.color)}>
                <p className="text-text-muted text-[9px] font-bold uppercase">{t.label}</p>
                <p className="text-text-primary text-sm font-black">{t.discount}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </TabsContent>
  );
}
