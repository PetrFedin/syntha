'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useMemo } from 'react';
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
import { MoreHorizontal, Search, Star, TrendingDown, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { brands as allBrands } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

const brandAnalyticsData = allBrands.map((brand, i) => ({
  ...brand,
  revenue: Math.floor(1000000 + Math.random() * 5000000),
  margin: 55 + Math.random() * 15,
  sellThrough: 70 + Math.random() * 25,
  returns: 2 + Math.random() * 8,
  rank: i + 1,
}));

type SortKey = 'revenue' | 'margin' | 'sellThrough' | 'returns' | 'rank';

const getMarginColor = (margin: number) => {
  if (margin >= 65) return 'text-green-600';
  if (margin >= 55) return 'text-amber-600';
  return 'text-red-600';
};

const getSellThroughColor = (sellThrough: number) => {
  if (sellThrough >= 85) return 'text-green-600';
  if (sellThrough >= 75) return 'text-amber-600';
  return 'text-red-600';
};

export default function BrandRatingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedData = useMemo(() => {
    return brandAnalyticsData
      .filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (sortDirection === 'asc') {
          return valA - valB;
        } else {
          return valB - valA;
        }
      });
  }, [searchQuery, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection(key === 'rank' ? 'asc' : 'desc');
    }
  };

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-6 pb-24 sm:px-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" /> Рейтинг брендов
              </CardTitle>
              <CardDescription>
                Анализируйте и сравнивайте эффективность ваших брендов-партнеров.
              </CardDescription>
            </div>
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('rank')}
                >
                  Rank
                </TableHead>
                <TableHead>Бренд</TableHead>
                <TableHead
                  className="cursor-pointer text-right hover:bg-muted"
                  onClick={() => handleSort('revenue')}
                >
                  Выручка
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right hover:bg-muted"
                  onClick={() => handleSort('margin')}
                >
                  Маржинальность
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right hover:bg-muted"
                  onClick={() => handleSort('sellThrough')}
                >
                  Sell-Through
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right hover:bg-muted"
                  onClick={() => handleSort('returns')}
                >
                  Возвраты
                </TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((brand, index) => (
                <TableRow key={brand.id}>
                  <TableCell className="text-sm font-bold text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={brand.logo.url}
                        alt={brand.name}
                        width={32}
                        height={32}
                        className="rounded-full border object-contain"
                      />
                      <span className="font-medium">{brand.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {brand.revenue.toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell
                    className={cn('text-right font-semibold', getMarginColor(brand.margin))}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {brand.margin > 60 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {brand.margin.toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold',
                      getSellThroughColor(brand.sellThrough)
                    )}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {brand.sellThrough > 80 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {brand.sellThrough.toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{brand.returns.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={ROUTES.shop.b2bPartnerRetailer(brand.slug)}>Профиль</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
