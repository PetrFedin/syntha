'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Edit2 } from 'lucide-react';
import { use, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { OrderChat } from '@/components/shop/b2b';
import { ShopB2bToolHeader } from '@/components/shop/ShopB2bToolHeader';
import { ROUTES } from '@/lib/routes';

const contract = {
  id: 'contr_124',
  brand: 'Nordic Wool',
  type: 'Договор на предзаказ',
  status: 'pending',
  startDate: '2024-08-01',
  endDate: '2024-10-31',
  versions: [
    {
      version: 2,
      date: '2024-07-28',
      user: 'Анна (Nordic Wool)',
      url: '#',
      changes: 'Пункт 3.2 изменен',
    },
    { version: 1, date: '2024-07-25', user: 'Вы', url: '#', changes: 'Первоначальная версия' },
  ],
};

export default function B2BContractDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const params = use(paramsPromise);

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-6 pb-24 sm:px-6">
      <ShopB2bToolHeader
        backHref={ROUTES.shop.b2bContracts}
        className="mb-8"
        titleVisual="semibold"
        title={
          <>
            Контракт <span className="font-mono text-muted-foreground">{params.contractId}</span>
          </>
        }
        meta={<Badge variant="secondary">На согласовании</Badge>}
        trailing={
          <>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Скачать PDF
            </Button>
            <Button>
              <Edit2 className="mr-2 h-4 w-4" />
              Подписать
            </Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Предпросмотр документа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex aspect-[3/4] items-center justify-center rounded-md bg-muted p-4">
                <FileText className="h-24 w-24 text-muted-foreground/50" />
                <p className="absolute text-muted-foreground">Предпросмотр документа будет здесь</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <div className="sticky top-24 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Версии документа</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contract.versions.map((v) => (
                    <div key={v.version} className="flex items-center justify-between text-sm">
                      <p>
                        <span className="font-semibold">Версия {v.version}</span>
                        <span className="text-muted-foreground">
                          {' '}
                          от {new Date(v.date).toLocaleDateString('ru-RU')}
                        </span>
                      </p>
                      <Button variant="link" size="sm" className="h-auto p-0">
                        Скачать
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <OrderChat />
          </div>
        </div>
      </div>
    </CabinetPageContent>
  );
}
