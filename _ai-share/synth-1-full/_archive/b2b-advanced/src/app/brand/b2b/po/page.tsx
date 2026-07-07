'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowLeft, Upload, Link2 } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getB2BLinks } from '@/lib/data/entity-links';
import { useToast } from '@/hooks/use-toast';
import { tid } from '@/lib/ui/test-ids';

/** JOOR/NuOrder: генерация/загрузка Purchase Order (PO), привязка к заказу, сверка «заказ ↔ PO». */
const MOCK_ORDER_IDS = ['B2B-0013', 'B2B-0012', 'B2B-0011', 'B2B-0010'];

export default function PurchaseOrderPage() {
  const { toast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [pos, setPos] = useState([
    { id: 'PO-001', orderId: 'B2B-0012', status: 'Совпадает', date: '2025-03-10' },
    { id: 'PO-002', orderId: 'B2B-0011', status: 'На проверке', date: '2025-03-09' },
  ]);

  const handleGeneratePO = () => {
    if (!selectedOrderId) {
      toast({ title: 'Выберите заказ', variant: 'destructive' });
      return;
    }
    const newId = `PO-${String(pos.length + 1).padStart(3, '0')}`;
    setPos((prev) => [
      {
        id: newId,
        orderId: selectedOrderId,
        status: 'Создан',
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    toast({
      title: 'PO создан',
      description: `${newId} привязан к заказу ${selectedOrderId}. В проде — генерация PDF/EDI.`,
    });
  };

  return (
    <CabinetPageContent maxWidth="3xl" className="space-y-6" data-testid={tid.page('brand-b2b-po')}>
      <div className="mb-6 flex items-center gap-3">
        <Link href={ROUTES.brand.b2bOrders}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-tight">
            <FileText className="size-6" /> Purchase Order (PO)
          </h1>
          <p className="text-text-secondary mt-0.5 text-sm">
            Генерация и загрузка PO, привязка к заказу, сверка заказ ↔ PO. ЭДО — в планах.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Действия</CardTitle>
          <CardDescription>
            Создать PO по заказу или загрузить от ритейлера (JOOR/NuOrder)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-text-secondary mb-1 block text-xs">Заказ</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="border-border-default w-40 rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Выберите заказ</option>
              {MOCK_ORDER_IDS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          <Button size="sm" onClick={handleGeneratePO}>
            <Link2 className="mr-2 size-4" /> Создать PO по заказу
          </Button>
          <Button size="sm" variant="outline">
            <Upload className="mr-2 size-4" /> Загрузить PO
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Список PO</CardTitle>
          <CardDescription>Привязка к B2B заказу и статус сверки</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {pos.map((po) => (
              <li
                key={po.id}
                className="border-border-subtle bg-bg-surface2 flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{po.id}</p>
                  <p className="text-text-secondary text-xs">
                    Заказ{' '}
                    <Link
                      href={ROUTES.brand.b2bOrder(po.orderId)}
                      className="text-accent-primary hover:underline"
                    >
                      {po.orderId}
                    </Link>{' '}
                    · {po.date}
                  </p>
                </div>
                <Badge
                  variant={
                    po.status === 'Совпадает'
                      ? 'default'
                      : po.status === 'Создан'
                        ? 'outline'
                        : 'secondary'
                  }
                >
                  {po.status}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <RelatedModulesBlock
        links={getB2BLinks().filter((l) => l.href !== ROUTES.brand.b2bOrders)}
        title="B2B заказы, финансы, документы"
      />
    </CabinetPageContent>
  );
}
