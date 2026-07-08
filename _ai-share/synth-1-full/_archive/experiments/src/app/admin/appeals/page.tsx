'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import type { Promotion } from '@/lib/types';
import { mockPromotions } from '@/lib/data/mock-promotions';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function AppealsPage() {
  const [appeals, setAppeals] = useState<Promotion[]>(() =>
    mockPromotions.filter((p: Promotion) => p.status === 'appealed')
  );
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleApprove = (id: string) => {
    setAppeals((prev: Promotion[]) => prev.filter((a: Promotion) => a.id !== id));
    // In a real app, you would also update the promotion status
  };

  const handleReject = (id: string) => {
    // Here you would likely open another dialog to confirm rejection reason
    // For simplicity, we just remove it from the list
    setAppeals((prev: Promotion[]) => prev.filter((a: Promotion) => a.id !== id));
  };

  return (
    <CabinetPageContent maxWidth="full" className="space-y-4">
      <header>
        <h1 className="font-headline text-base font-bold">Апелляции</h1>
        <p className="text-muted-foreground">
          Запросы от брендов на пересмотр статуса промо-кампаний.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Активные апелляции</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Кампания</TableHead>
                <TableHead>Бренд</TableHead>
                <TableHead>Дата запроса</TableHead>
                <TableHead>Текущий статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appeals.map((appeal: Promotion) => {
                const appealDate = new Date(); // Mock
                return (
                  <TableRow key={appeal.id}>
                    <TableCell className="font-medium">{appeal.productName}</TableCell>
                    <TableCell>{appeal.brandName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {isClient ? (
                          <>
                            <span>{format(appealDate, 'dd MMM yyyy, HH:mm', { locale: ru })}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(appealDate, { addSuffix: true, locale: ru })}
                            </span>
                          </>
                        ) : (
                          <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-accent-primary/80 text-white">
                        На обжаловании
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            Рассмотреть <MoreHorizontal className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleApprove(appeal.id)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Одобрить
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={rejectionReason || ''}
                            onValueChange={setRejectionReason}
                          >
                            <DropdownMenuRadioItem value="policy">
                              Не соотв. политике
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="quality">
                              Низкое качество
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="other">Другое</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleReject(appeal.id)}
                            disabled={!rejectionReason}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Отклонить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {appeals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Нет активных апелляций.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
