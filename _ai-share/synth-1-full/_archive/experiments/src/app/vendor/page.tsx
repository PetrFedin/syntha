import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Package } from 'lucide-react';
import { VendorDocumentUpload } from '@/components/vendor/VendorDocumentUpload';

export default function VendorDashboardPage() {
  const mockTasks = [
    {
      id: 'T-101',
      title: 'Оценить Tech Pack: Худи Оверсайз',
      status: 'pending',
      articleId: 'ART-001',
    },
    { id: 'T-102', title: 'Обновить сертификат ISO 9001', status: 'overdue', articleId: null },
    {
      id: 'T-103',
      title: 'Подтвердить сроки по заказу #4092',
      status: 'completed',
      articleId: null,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-text-primary text-2xl font-bold">Добро пожаловать, Фабрика №1</h2>
        <p className="text-text-secondary mt-1">
          Обзор ваших задач и активных запросов от брендов.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-text-secondary text-sm font-medium">
              Новые запросы (RFQ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-text-primary text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-text-secondary text-sm font-medium">
              Активные заказы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-text-primary text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-text-secondary text-sm font-medium">
              Рейтинг (Eco-Score)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">85/100</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h3 className="text-text-primary text-lg font-semibold">Задачи к выполнению</h3>
          <div className="space-y-3">
            {mockTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <div className="flex items-center p-4">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-text-muted font-mono text-xs">{task.id}</span>
                      {task.status === 'pending' && (
                        <Badge variant="secondary" className="text-[10px]">
                          Ожидает
                        </Badge>
                      )}
                      {task.status === 'overdue' && (
                        <Badge variant="destructive" className="text-[10px]">
                          Просрочено
                        </Badge>
                      )}
                      {task.status === 'completed' && (
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-600"
                        >
                          Выполнено
                        </Badge>
                      )}
                    </div>
                    <p className="text-text-primary text-sm font-medium">{task.title}</p>
                  </div>
                  {task.articleId && (
                    <Link href={`/vendor/tech-pack/${task.articleId}`}>
                      <span className="text-accent-primary flex items-center text-xs font-medium hover:underline">
                        Открыть ТЗ <ArrowRight className="ml-1 h-3 w-3" />
                      </span>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-text-primary text-lg font-semibold">Документы</h3>
          <VendorDocumentUpload />
        </div>
      </div>
    </div>
  );
}
