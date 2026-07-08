'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  ChevronRight,
  X,
  Maximize2,
  Share2,
  Download,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

interface Hotspot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  productId: string;
  productName: string;
  price: number;
}

interface LookbookPage {
  id: string;
  imageUrl: string;
  title: string;
  hotspots: Hotspot[];
}

export function WholesaleLookbook({
  onShopProduct,
}: {
  onShopProduct: (productId: string) => void;
}) {
  const [activePage, setActivePage] = useState(0);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  const pages: LookbookPage[] = [
    {
      id: 'p1',
      title: 'Neural Nomad - Opening Look',
      imageUrl:
        'https://images.unsplash.com/photo-1539109132304-372874a581ad?auto=format&fit=crop&q=80&w=1200',
      hotspots: [
        { id: 'h1', x: 45, y: 30, productId: '1', productName: 'Cyber Tech Parka', price: 12400 },
        { id: 'h2', x: 55, y: 75, productId: '2', productName: 'Neural Cargo Pants', price: 8900 },
      ],
    },
    {
      id: 'p2',
      title: 'Structural Silence',
      imageUrl:
        'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=1200',
      hotspots: [
        {
          id: 'h3',
          x: 40,
          y: 40,
          productId: '3',
          productName: 'Minimalist Overcoat',
          price: 15600,
        },
      ],
    },
  ];

  return (
    <div className="bg-text-primary flex h-full flex-col overflow-hidden rounded-xl shadow-2xl">
      {/* Header */}
      <div className="bg-text-primary/50 flex items-center justify-between border-b border-white/10 p-4 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-accent-primary h-4 w-4" />
            <Badge
              variant="outline"
              className="border-accent-primary/30 text-accent-primary text-[8px] font-black uppercase tracking-widest"
            >
              INTERACTIVE_LOOKBOOK_v1
            </Badge>
          </div>
          <h3 className="text-base font-black uppercase tracking-tight text-white">
            {pages[activePage].title}
          </h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-white/50 hover:bg-white/10 hover:text-white"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-white/50 hover:bg-white/10 hover:text-white"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Viewport */}
      <div className="group relative flex-1 overflow-hidden bg-black">
        <motion.img
          key={pages[activePage].id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          src={pages[activePage].imageUrl}
          className="h-full w-full object-cover"
        />

        {/* Hotspots */}
        {pages[activePage].hotspots.map((hs) => (
          <button
            key={hs.id}
            onClick={() => setSelectedHotspot(hs)}
            style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
            className="hover:bg-accent-primary hover:border-accent-primary/40 group/hs absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/20 backdrop-blur-md transition-all hover:scale-125"
          >
            <div className="h-2 w-2 rounded-full bg-white" />
            <div className="absolute inset-0 animate-ping rounded-full border border-white/30 opacity-20" />
          </button>
        ))}

        {/* Hotspot Popup */}
        <AnimatePresence>
          {selectedHotspot && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              style={{ left: `${selectedHotspot.x}%`, top: `${selectedHotspot.y + 5}%` }}
              className="border-border-subtle absolute z-10 min-w-[200px] -translate-x-1/2 rounded-2xl border bg-white p-4 shadow-2xl"
            >
              <button
                onClick={() => setSelectedHotspot(null)}
                className="text-text-muted hover:text-text-primary absolute right-2 top-2 flex h-6 w-6 items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>

              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="text-text-primary text-[10px] font-black uppercase leading-tight">
                    {selectedHotspot.productName}
                  </h4>
                  <p className="text-accent-primary text-[12px] font-black">
                    {selectedHotspot.price.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
                <Button
                  onClick={() => {
                    onShopProduct(selectedHotspot.productId);
                    setSelectedHotspot(null);
                  }}
                  className="bg-text-primary h-8 w-full gap-2 rounded-lg text-[8px] font-black uppercase tracking-widest text-white"
                >
                  Shop the look <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-3 rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur-xl">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setActivePage(i)}
              className={cn(
                'h-2 w-12 rounded-full transition-all',
                activePage === i ? 'bg-white' : 'bg-white/20 hover:bg-white/40'
              )}
            />
          ))}
        </div>

        {/* Sidebar info toggle */}
        <div className="absolute right-10 top-1/2 flex -translate-y-1/2 flex-col gap-3">
          <Button
            variant="outline"
            className="h-12 w-12 rounded-full border-white/10 bg-black/20 p-0 text-white backdrop-blur-md"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="h-12 w-12 rounded-full border-white/10 bg-black/20 p-0 text-white backdrop-blur-md"
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer / Thumbnail strip */}
      <div className="bg-text-primary/50 flex h-32 items-center gap-3 overflow-x-auto border-t border-white/10 p-4 backdrop-blur-md">
        {pages.map((page, i) => (
          <button
            key={page.id}
            onClick={() => setActivePage(i)}
            className={cn(
              'h-20 w-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all',
              activePage === i
                ? 'border-accent-primary scale-105'
                : 'border-transparent opacity-50 hover:opacity-100'
            )}
          >
            <img src={page.imageUrl} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
