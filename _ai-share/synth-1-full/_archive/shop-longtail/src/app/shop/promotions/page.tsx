'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from '@/components/ui/combobox';
import { products as allProducts } from '@/lib/products';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { isDemoBrandName } from '@/lib/data/demo-platform-brands';

const shopProducts = allProducts.filter((p) => isDemoBrandName(p.brand));
const productOptions = shopProducts.map((p) => ({ value: p.id, label: `${p.sku} - ${p.name}` }));

const statusConfig = {
  pending: { label: 'На согласовании', icon: Clock, color: 'text-amber-600' },
  approved: { label: 'Одобрено', icon: CheckCircle, color: 'text-green-600' },
  rejected: { label: 'Отклонено', icon: XCircle, color: 'text-red-600' },
};

export default function ShopPromotionsPage() {
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [promotionType, setPromotionType] = useState('discount');
  const [discountValue, setDiscountValue] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [requests, setRequests] = useState<any[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest = {
      id: `req-${Date.now()}`,
      products: selectedProducts.map((id) => shopProducts.find((p) => p.id === id)?.name),
      type: promotionType,
      value: discountValue,
      dates: dateRange,
      status: 'pending',
    };
    setRequests((prev) => [newRequest, ...prev]);
    toast({ title: 'Запрос отправлен на согласование бренду.' });
    // Reset form
    setSelectedProducts([]);
    setDiscountValue('');
    setDateRange(undefined);
  };

  const isActionRequest =
    promotionType === 'discount' || promotionType === 'outlet' || promotionType === 'promo_code';

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-6 pb-24 sm:px-6">
      <header>
        <h1 className="font-headline text-base font-bold">Управление продвижением</h1>
        <p className="text-muted-foreground">
          Создавайте запросы на скидки и акции для ваших товаров.
        </p>
      </header>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Создать новый запрос на акцию</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Товары</Label>
              <Combobox
                options={productOptions}
                value={selectedProducts}
                onChange={(v) => setSelectedProducts(Array.isArray(v) ? v : v ? [v] : [])}
                multiple
                placeholder="Выберите один или несколько товаров..."
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Тип акции</Label>
                <Select value={promotionType} onValueChange={setPromotionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Скидка (%)</SelectItem>
                    <SelectItem value="promo_code">Промокод</SelectItem>
                    <SelectItem value="outlet">Перенос в Аутлет</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Размер скидки / Промокод</Label>
                <Input
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={promotionType === 'promo_code' ? 'Напр. SALE20' : 'Напр. 20'}
                  type={promotionType === 'promo_code' ? 'text' : 'number'}
                />
              </div>
              <div className="space-y-2">
                <Label>Период</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'LLL dd, y', { locale: ru })} -{' '}
                            {format(dateRange.to, 'LLL dd, y', { locale: ru })}
                          </>
                        ) : (
                          format(dateRange.from, 'LLL dd, y', { locale: ru })
                        )
                      ) : (
                        <span>Выберите период</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={selectedProducts.length === 0 || !discountValue || !dateRange?.from}
            >
              Отправить на согласование
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>История запросов</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товары</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Условия</TableHead>
                <TableHead>Период</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => {
                const statusInfo = statusConfig[req.status as keyof typeof statusConfig];
                return (
                  <TableRow key={req.id}>
                    <TableCell className="max-w-[200px] truncate">
                      {req.products.join(', ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{req.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {req.value}
                      {req.type === 'discount' && '%'}
                    </TableCell>
                    <TableCell>
                      {req.dates?.from
                        ? `${format(req.dates.from, 'dd.MM.yy')} - ${req.dates.to ? format(req.dates.to, 'dd.MM.yy') : ''}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-current/30 flex w-fit items-center gap-1.5 ${statusInfo.color}`}
                      >
                        <statusInfo.icon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    У вас пока нет запросов на продвижение.
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
