'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Scan,
  HelpCircle,
  ChevronRight,
  Shirt,
  RotateCcw,
  BellRing,
  ShoppingCart,
  CheckCircle,
  Sparkles,
  Zap,
  Star,
  Layers,
  ShoppingBag,
  Info,
  Maximize,
  ArrowLeftRight,
  UserCheck,
  Settings2,
  Monitor,
  Plus,
} from 'lucide-react';
import { FittingRoomItem, FittingRoomRequest } from '@/lib/types/retail';
import { cn } from '@/lib/utils';

/**
 * Smart Fitting Room Interface (Mirror OS)
 * Интерфейс умного зеркала в примерочной.
 */

export default function SmartMirrorPage() {
  const [sessionItems, setSessionItems] = useState<FittingRoomItem[]>([
    {
      id: 'item-1',
      productId: 'p-1',
      variantId: 'v-1',
      sku: 'BL-SLK-M',
      name: 'Silk Satin Blouse',
      size: 'S',
      color: 'Ivory',
      price: 125,
      imageUrl: '/products/blouse-ivory.jpg',
      status: 'brought_in',
    },
    {
      id: 'item-2',
      productId: 'p-2',
      variantId: 'v-2',
      sku: 'TRS-WOL-M',
      name: 'Wide-Leg Wool Trousers',
      size: '38',
      color: 'Charcoal',
      price: 185,
      imageUrl: '/products/trousers-charcoal.jpg',
      status: 'brought_in',
    },
  ]);

  const [activeItem, setActiveItem] = useState<FittingRoomItem | null>(sessionItems[0]);
  const [requests, setRequests] = useState<FittingRoomRequest[]>([]);
  const [isCallingAssistant, setIsCallingAssistant] = useState(false);

  const requestAlternativeSize = (item: FittingRoomItem, size: string) => {
    const newRequest: FittingRoomRequest = {
      id: `REQ-${Date.now()}`,
      type: 'size_change',
      status: 'pending',
      itemId: item.id,
      targetSize: size,
      timestamp: new Date().toISOString(),
    };
    setRequests([...requests, newRequest]);
  };

  const callAssistant = () => {
    setIsCallingAssistant(true);
    setTimeout(() => setIsCallingAssistant(false), 3000);
  };

  return (
    <CabinetPageContent
      maxWidth="full"
      className="!mx-0 flex min-h-screen flex-col gap-3 overflow-hidden bg-black !px-4 !py-4 font-sans text-white"
    >
      {/* Mirror Header */}
      <header className="flex items-center justify-between border-b border-white/10 pb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Sparkles className="text-accent-primary h-8 w-8" />
          </div>
          <div>
            <h1 className="font-headline text-base font-black uppercase italic tracking-tighter">
              Synth-1 Mirror
            </h1>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40">
              Smart Fitting Suite 04
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={callAssistant}
            className={cn(
              'h-12 gap-3 rounded-full border-2 px-8 text-xs font-black uppercase transition-all',
              isCallingAssistant
                ? 'bg-accent-primary border-accent-primary animate-pulse text-white'
                : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
            )}
          >
            <BellRing className="h-5 w-5" />
            {isCallingAssistant ? 'Assistant Summoned' : 'Call Assistant'}
          </Button>
          <Button className="h-12 w-12 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Settings2 className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-12 gap-3 overflow-hidden">
        {/* Left Column: Items in Room */}
        <div className="custom-scrollbar col-span-4 space-y-6 overflow-y-auto pr-4">
          <h3 className="mb-6 text-[10px] font-black uppercase tracking-widest text-white/40">
            Items in Room
          </h3>
          <div className="space-y-4">
            {sessionItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={cn(
                  'cursor-pointer rounded-xl border-2 p-4 transition-all',
                  activeItem?.id === item.id
                    ? 'border-white bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                    : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                )}
              >
                <div className="flex gap-3">
                  <div className="h-28 w-20 overflow-hidden rounded-2xl bg-black/10">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover opacity-80"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-black uppercase leading-tight">{item.name}</p>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'h-5 text-[9px] font-black uppercase',
                          activeItem?.id === item.id
                            ? 'border-black text-black'
                            : 'border-white/20 text-white/60'
                        )}
                      >
                        Size: {item.size}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          'h-5 text-[9px] font-black uppercase',
                          activeItem?.id === item.id
                            ? 'border-black text-black'
                            : 'border-white/20 text-white/60'
                        )}
                      >
                        {item.color}
                      </Badge>
                    </div>
                    <p className="text-sm font-black">${item.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center/Main Column: Active Item Details & AI Stylist */}
        <div className="col-span-8 flex flex-col gap-3 overflow-hidden">
          {activeItem ? (
            <div className="grid flex-1 grid-cols-2 gap-3 overflow-hidden">
              {/* Item Focus */}
              <div className="flex flex-col space-y-4">
                <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="absolute right-10 top-3 flex flex-col gap-3">
                    <Button
                      variant="ghost"
                      className="h-12 w-12 rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl hover:bg-black/60"
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="mb-8 h-80 w-64 overflow-hidden rounded-3xl bg-white/5 shadow-2xl">
                    <img
                      src={activeItem.imageUrl}
                      alt={activeItem.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <h2 className="mb-2 text-base font-black uppercase italic tracking-tighter">
                    {activeItem.name}
                  </h2>
                  <div className="mb-8 flex gap-3">
                    <span className="text-accent-primary text-sm font-black uppercase italic tracking-widest">
                      {activeItem.sku}
                    </span>
                    <span className="text-white/20">/</span>
                    <span className="text-sm font-black uppercase tracking-widest text-white/40">
                      {activeItem.color}
                    </span>
                  </div>

                  <div className="grid w-full grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="mb-1 text-[9px] font-black uppercase text-white/40">In Stock</p>
                      <p className="text-sm font-black text-emerald-400">Low (2 left)</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="mb-1 text-[9px] font-black uppercase text-white/40">
                        Sustainability
                      </p>
                      <p className="text-accent-primary text-sm font-black">92% Echo</p>
                    </div>
                  </div>
                </div>

                {/* 3D Body Scan Integration (New Feature) */}
                <Card className="bg-accent-primary/20 border-accent-primary/30 group relative overflow-hidden rounded-xl border-2 p-4">
                  <div className="absolute -bottom-4 -right-4 opacity-10 transition-transform group-hover:scale-110">
                    <Scan className="h-24 w-24 text-white" />
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="text-accent-primary h-5 w-5" />
                      <h4 className="text-sm font-black uppercase italic tracking-tight">
                        Digital Twin Sync
                      </h4>
                    </div>
                    <Badge className="bg-accent-primary h-5 border-none px-2 text-[8px] font-black uppercase text-white">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <UserCheck className="text-accent-primary h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white/80">3D Body Scan (v2.4) Loaded</p>
                      <div className="mt-2 flex gap-3">
                        <div className="text-[10px] font-black uppercase text-white/40">
                          Chest: <span className="text-white">94.2cm</span>
                        </div>
                        <div className="text-[10px] font-black uppercase text-white/40">
                          Waist: <span className="text-white">78.5cm</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="text-accent-primary h-9 rounded-xl bg-white px-4 text-[9px] font-black uppercase transition-transform hover:scale-105 active:scale-95"
                    >
                      Recalibrate
                    </Button>
                  </div>
                </Card>

                {/* Actions Grid */}
                <div className="grid h-32 grid-cols-2 gap-3">
                  <Button
                    onClick={() => requestAlternativeSize(activeItem, 'M')}
                    className="hover:bg-accent-primary flex h-full flex-col gap-2 rounded-xl bg-white text-xs font-black uppercase text-black transition-all hover:text-white"
                  >
                    <ArrowLeftRight className="mb-1 h-5 w-5" />
                    Change Size
                  </Button>
                  <Button className="flex h-full flex-col gap-2 rounded-xl border border-white/10 bg-white/5 text-xs font-black uppercase text-white hover:bg-white/10">
                    <RotateCcw className="mb-1 h-5 w-5" />
                    Try Other Color
                  </Button>
                </div>
              </div>

              {/* AI Styling Column */}
              <div className="flex flex-col gap-3">
                <Card className="from-accent-primary/40 group relative flex-1 space-y-6 overflow-hidden rounded-xl border border-none border-white/10 bg-gradient-to-br to-black p-4 backdrop-blur-xl">
                  <div className="absolute right-0 top-0 p-4 opacity-20 transition-opacity group-hover:opacity-40">
                    <Zap className="text-accent-primary h-24 w-24" />
                  </div>

                  <div className="flex items-center gap-3">
                    <Sparkles className="text-accent-primary h-6 w-6" />
                    <h3 className="text-sm font-black uppercase italic tracking-tight">
                      AI Stylist Insight
                    </h3>
                  </div>

                  <p className="text-sm font-medium leading-relaxed text-white/70">
                    "This {activeItem.name} in {activeItem.color} works perfectly with the Charcoal
                    Wide-Leg Trousers you brought in. For a complete look, consider adding the
                    **Silver Link Belt** and **Pointed Toe Pumps**."
                  </p>

                  <div className="space-y-4 pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Complete the look
                    </h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Silver Link Belt', price: 45, icon: Layers },
                        { name: 'Pointed Toe Pumps', price: 165, icon: ShoppingBag },
                      ].map((suggestion, i) => (
                        <div
                          key={i}
                          className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                              <suggestion.icon className="text-accent-primary h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-[11px] font-black uppercase">{suggestion.name}</p>
                              <p className="text-xs font-bold text-white/40">${suggestion.price}</p>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white text-black opacity-0 transition-all group-hover:opacity-100"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="flex items-center justify-between rounded-xl border border-none border-emerald-500/20 bg-emerald-500/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                        Mirror Checkout
                      </p>
                      <p className="text-sm font-black uppercase italic">Add all to Bag</p>
                    </div>
                  </div>
                  <Button className="h-12 w-12 rounded-full border-none bg-emerald-500 text-white hover:bg-emerald-600">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center space-y-6 text-center">
              <div className="flex h-32 w-32 animate-pulse items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Scan className="h-12 w-12 text-white/20" />
              </div>
              <div className="space-y-2">
                <h2 className="text-sm font-black uppercase italic">Ready for Scanning</h2>
                <p className="mx-auto max-w-xs text-sm text-white/40">
                  Bring items close to the mirror to automatically display details and styling
                  advice.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Active Requests Bar */}
      {requests.length > 0 && (
        <footer className="fixed bottom-12 left-12 right-12 z-50">
          <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-10">
            <div className="flex items-center gap-3 pl-4">
              <RotateCcw className="text-accent-primary animate-spin-slow h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Active Requests ({requests.length})
              </span>
            </div>
            <div className="custom-scrollbar-hide flex flex-1 gap-3 overflow-x-auto">
              {requests.map((req) => (
                <Badge
                  key={req.id}
                  className="h-10 gap-3 whitespace-nowrap rounded-full border-none bg-white px-6 text-[9px] font-black uppercase text-black"
                >
                  <div className="bg-accent-primary h-2 w-2 animate-pulse rounded-full" />
                  Bring {req.targetSize} {sessionItems.find((i) => i.id === req.itemId)?.name}
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              className="h-10 rounded-full px-6 text-[9px] font-black uppercase text-white/40 hover:text-white"
            >
              Clear All
            </Button>
          </div>
        </footer>
      )}
    </CabinetPageContent>
  );
}

// Add these to global CSS or as style tag
const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .animate-spin-slow {
    animation: spin 3s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
