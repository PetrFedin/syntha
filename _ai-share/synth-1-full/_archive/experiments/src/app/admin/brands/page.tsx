'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { brands as allBrands } from '@/lib/placeholder-data';
import { products } from '@/lib/products';
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
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  BarChart2,
  Users,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BrandFinancialsDialog, BrandFollowersDialog } from '@/components/admin';
import type { Brand } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';

export default function BrandsDirectoryPage() {
  const [brands, setBrands] = useState(allBrands);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [viewingFinancials, setViewingFinancials] = useState<Brand | null>(null);
  const [viewingFollowers, setViewingFollowers] = useState<Brand | null>(null);
  const [activeFilterGroup, setActiveFilterGroup] = useState<string | null>(null);

  const filterGroups = {
    '0-9': '0123456789'.split(''),
    'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    'А-Я': 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split(''),
  };

  const handleFilterClick = (letter: string) => {
    setActiveLetter((prev) => (prev === letter ? null : letter));
  };

  const handleGroupClick = (group: string) => {
    setActiveFilterGroup((prev) => (prev === group ? null : group));
    setActiveLetter(null); // Reset letter filter when changing group
  };

  const filteredBrands = useMemo(() => {
    let tempBrands = [...brands];

    if (showOnlySelected && selectedBrands.size > 0) {
      tempBrands = tempBrands.filter((b) => selectedBrands.has(b.id));
    }

    if (searchQuery) {
      tempBrands = tempBrands.filter((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeLetter) {
      tempBrands = tempBrands.filter((b) => {
        const nameToTest = b.name;
        return (
          nameToTest.toUpperCase().startsWith(activeLetter) ||
          (!isNaN(parseInt(activeLetter, 10)) && nameToTest.startsWith(activeLetter))
        );
      });
    }

    return tempBrands;
  }, [brands, searchQuery, activeLetter, selectedBrands, showOnlySelected]);

  const handleSelectBrand = (brandId: string) => {
    setSelectedBrands((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(brandId)) {
        newSet.delete(brandId);
      } else {
        newSet.add(brandId);
      }
      return newSet;
    });
  };

  const isAllSelected = filteredBrands.length > 0 && selectedBrands.size === filteredBrands.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBrands(new Set());
    } else {
      setSelectedBrands(new Set(filteredBrands.map((b) => b.id)));
    }
  };

  const getTierVariant = (tier?: 'Free' | 'Pro' | 'Elite') => {
    switch (tier) {
      case 'Pro':
        return 'default';
      case 'Elite':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-4 pb-24 duration-700 animate-in fade-in">
        <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-end">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <span>Admin</span>
              <ChevronRight className="h-2 w-2" />
              <span className="text-slate-300">Brands Directory</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-headline text-base font-bold uppercase leading-none tracking-tighter text-slate-900">
                Partners Ecosystem
              </h1>
              <Badge
                variant="outline"
                className="h-4 gap-1 border-indigo-100 bg-indigo-50 px-1.5 text-[7px] font-bold tracking-widest text-indigo-600 shadow-sm transition-all"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" /> TOTAL:{' '}
                {brands.length}
              </Badge>
            </div>
          </div>
          <Button className="h-8 gap-1.5 rounded-lg border border-slate-900 bg-slate-900 px-4 text-[9px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-indigo-600">
            <PlusCircle className="h-3.5 w-3.5" /> Добавить бренд
          </Button>
        </div>

        <div className="space-y-4">
          {/* Toolbar & Filters */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
              <div className="flex shrink-0 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                {Object.keys(filterGroups).map((groupName) => (
                  <button
                    key={groupName}
                    onClick={() => handleGroupClick(groupName)}
                    className={cn(
                      'h-6.5 shrink-0 rounded-md px-3 text-[9px] font-bold uppercase tracking-widest shadow-sm transition-all',
                      activeFilterGroup === groupName
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-900'
                    )}
                  >
                    {groupName}
                  </button>
                ))}
              </div>
              <div className="mx-0.5 h-4 w-[1px] shrink-0 bg-slate-200" />
              <div className="h-8.5 flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
                <Switch
                  id="show-selected"
                  checked={showOnlySelected}
                  onCheckedChange={setShowOnlySelected}
                  disabled={selectedBrands.size === 0}
                  className="scale-75 data-[state=checked]:bg-indigo-600"
                />
                <Label
                  htmlFor="show-selected"
                  className="cursor-pointer text-[9px] font-bold uppercase tracking-widest text-slate-400"
                >
                  Selected ({selectedBrands.size})
                </Label>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 px-1">
              <div className="group relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                <Input
                  placeholder="Фильтр по названию..."
                  className="h-7 w-32 rounded-lg border-slate-200 bg-white pl-8 text-[10px] font-bold uppercase tracking-tight shadow-sm focus:ring-1 focus:ring-indigo-500 md:w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {activeFilterGroup && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: -8 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 0 }}
                exit={{ height: 0, opacity: 0, marginTop: -8 }}
                className="overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-sm"
              >
                <div className="flex flex-wrap gap-1">
                  {(filterGroups[activeFilterGroup as keyof typeof filterGroups] || []).map(
                    (letter) => (
                      <Button
                        key={letter}
                        variant={activeLetter === letter ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                          'h-7 w-7 rounded-lg p-0 text-[10px] font-bold transition-all',
                          activeLetter === letter
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                            : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
                        )}
                        onClick={() => handleFilterClick(letter)}
                      >
                        {letter}
                      </Button>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:border-indigo-100/50">
            <div className="flex gap-2 border-b border-slate-100 bg-slate-50/50 p-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-lg border-slate-200 bg-white px-3 text-[8px] font-bold uppercase tracking-widest text-slate-500 shadow-sm transition-all hover:border-indigo-100 hover:text-indigo-600"
                asChild
              >
                <a href="/admin/quality">
                  <ShieldCheck className="mr-1.5 h-3 w-3 text-indigo-500" /> Quality Control (BPI)
                </a>
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[40px] px-4">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className="scale-75"
                    />
                  </TableHead>
                  <TableHead className="h-10 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Brand Identity
                  </TableHead>
                  <TableHead className="h-10 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Network
                  </TableHead>
                  <TableHead className="h-10 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Start Date
                  </TableHead>
                  <TableHead className="h-10 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Tier
                  </TableHead>
                  <TableHead className="h-10 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Styles
                  </TableHead>
                  <TableHead className="h-10 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Status
                  </TableHead>
                  <TableHead className="h-10 w-24 text-right text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-50">
                {filteredBrands.map((brand) => {
                  const productCount = products.filter((p) => p.brand === brand.name).length;
                  return (
                    <TableRow
                      key={brand.id}
                      data-state={selectedBrands.has(brand.id) ? 'selected' : ''}
                      className="group h-12 transition-all hover:bg-slate-50/50"
                    >
                      <TableCell className="px-4">
                        <Checkbox
                          checked={selectedBrands.has(brand.id)}
                          onCheckedChange={() => handleSelectBrand(brand.id)}
                          className="scale-75"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-8 w-8 rounded-lg border border-slate-100 bg-white p-1 shadow-sm transition-transform group-hover:scale-110">
                            <Image
                              src={brand.logo.url}
                              alt={brand.logo.alt}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="max-w-[140px] truncate text-[11px] font-bold uppercase leading-none tracking-tight text-slate-900">
                            {brand.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-[10px] font-bold uppercase tabular-nums tracking-widest text-indigo-600 decoration-indigo-200 hover:underline"
                          onClick={() => setViewingFollowers(brand)}
                        >
                          {brand.followers.toLocaleString('ru-RU')}
                        </Button>
                      </TableCell>
                      <TableCell className="text-[10px] font-bold uppercase tabular-nums tracking-tight text-slate-400">
                        {brand.startDate
                          ? format(new Date(brand.startDate), 'dd MMM yyyy', { locale: ru })
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'h-3.5 rounded border px-1.5 text-[7px] font-bold uppercase tracking-widest shadow-sm transition-all',
                            brand.subscriptionTier === 'Elite'
                              ? 'border-indigo-100 bg-indigo-50 text-indigo-600'
                              : brand.subscriptionTier === 'Pro'
                                ? 'border-blue-100 bg-blue-50 text-blue-600'
                                : 'border-slate-100 bg-slate-50 text-slate-400'
                          )}
                        >
                          {brand.subscriptionTier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] font-bold tabular-nums text-slate-900">
                        {productCount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="h-3.5 rounded border-emerald-100 bg-emerald-50 px-1.5 text-[7px] font-bold uppercase tracking-widest text-emerald-600 shadow-sm"
                        >
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 transition-all group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-slate-400 transition-all hover:bg-slate-900 hover:text-white"
                            onClick={() => setViewingFinancials(brand)}
                          >
                            <BarChart2 className="h-3.5 w-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="text-[10px] font-bold uppercase tracking-widest"
                            >
                              <DropdownMenuItem className="gap-2">Edit Entity</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setViewingFollowers(brand)}
                                className="gap-2"
                              >
                                <Users className="h-3 w-3" /> Followers
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-rose-600 focus:text-rose-600">
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 opacity-60">
                Displaying {filteredBrands.length} of {brands.length} partners
              </span>
              <div className="flex gap-1">
                <button
                  className="h-6 rounded-md border border-slate-200 bg-white px-2.5 text-[8px] font-bold uppercase tracking-widest text-slate-400 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
                  disabled
                >
                  PREV
                </button>
                <button className="h-6 rounded-md border border-slate-200 bg-white px-2.5 text-[8px] font-bold uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50">
                  NEXT
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {viewingFinancials && (
        <BrandFinancialsDialog
          brand={viewingFinancials}
          isOpen={!!viewingFinancials}
          onOpenChange={(open) => !open && setViewingFinancials(null)}
        />
      )}
      {viewingFollowers && (
        <BrandFollowersDialog
          brand={viewingFollowers}
          isOpen={!!viewingFollowers}
          onOpenChange={(open) => !open && setViewingFollowers(null)}
        />
      )}
    </>
  );
}
