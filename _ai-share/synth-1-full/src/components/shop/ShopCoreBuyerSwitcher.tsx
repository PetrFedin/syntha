'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { ChevronDown, Store } from 'lucide-react';

/** Переключатель демо-магазина (shop1 / shop2) для multi-tenant checkout. */
export function ShopCoreBuyerSwitcher() {
  const { buyerId, buyerLabelRu, presets, setBuyerId, ready } = useShopCoreBuyerId();

  if (!ready) {
    return (
      <Badge
        variant="outline"
        className="text-[10px]"
        data-testid="shop-b2b-buyer-switcher-loading"
      >
        Магазин…
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-[10px] font-semibold"
          data-testid="shop-b2b-buyer-switcher"
        >
          <Store className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="max-w-[12rem] truncate">{buyerLabelRu}</span>
          <ChevronDown className="h-3 w-3 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[14rem]">
        {presets.map((preset) => (
          <DropdownMenuItem
            key={preset.id}
            data-testid={`shop-b2b-buyer-option-${preset.id}`}
            className={preset.id === buyerId ? 'bg-bg-surface2 font-semibold' : undefined}
            onClick={() => setBuyerId(preset.id)}
          >
            {preset.labelRu}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
