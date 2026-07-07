'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Maximize2,
  Move,
  Smartphone,
  RotateCcw,
  X,
  Smartphone as MobileIcon,
  Layers,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

interface ARWholesaleViewerProps {
  product: any;
  onClose: () => void;
}

export function ARWholesaleViewer({ product, onClose }: ARWholesaleViewerProps) {
  const [viewMode, setViewMode] = useState<'floor' | 'rack'>('floor');

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black p-4">
      {/* Header Overlay */}
      <div className="absolute left-8 right-8 top-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tighter text-white">
              Оптовое AR-Превью
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Просмотр в пространстве вашего магазина
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-2xl bg-white/10 text-white"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Simulated AR Viewport */}
      <div className="bg-text-primary relative h-full max-h-[800px] w-full max-w-[500px] overflow-hidden rounded-xl border-8 border-white/10 shadow-2xl">
        <div className="absolute inset-0 opacity-60">
          <img
            src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1200"
            className="h-full w-full object-cover"
            alt="Store background"
          />
        </div>

        {/* 3D Product Placeholder */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative h-full max-h-[500px] w-80"
          >
            <div className="absolute bottom-20 left-1/2 h-8 w-48 -translate-x-1/2 rounded-full bg-black/40 blur-xl" />
            <img
              src={product?.images[0]?.url}
              alt={product?.name}
              className="h-full w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            />

            {/* Hotspots */}
            <div className="bg-accent-primary/80 absolute left-1/4 top-1/4 flex h-6 w-6 animate-pulse items-center justify-center rounded-full border-2 border-white text-[8px] font-black text-white">
              <Sparkles className="h-3 w-3" />
            </div>
          </motion.div>
        </div>

        {/* AR UI Controls */}
        <div className="absolute bottom-12 left-1/2 flex w-full -translate-x-1/2 flex-col items-center gap-3 px-8">
          <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl">
            <Button
              variant={viewMode === 'floor' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-10 rounded-xl text-[10px] font-black uppercase tracking-widest',
                viewMode === 'floor' ? 'text-text-primary bg-white' : 'text-white'
              )}
              onClick={() => setViewMode('floor')}
            >
              <MobileIcon className="mr-2 h-3.5 w-3.5" /> На пол
            </Button>
            <Button
              variant={viewMode === 'rack' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-10 rounded-xl text-[10px] font-black uppercase tracking-widest',
                viewMode === 'rack' ? 'text-text-primary bg-white' : 'text-white'
              )}
              onClick={() => setViewMode('rack')}
            >
              <Layers className="mr-2 h-3.5 w-3.5" /> На рейку
            </Button>
          </div>

          <div className="grid w-full grid-cols-3 gap-3">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-md">
              <p className="mb-1 text-[8px] font-black uppercase text-white/50">Масштаб</p>
              <p className="text-sm font-black text-white">1:1</p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-md">
              <p className="mb-1 text-[8px] font-black uppercase text-white/50">Освещение</p>
              <p className="text-accent-primary text-sm font-black">Авто</p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-md">
              <p className="mb-1 text-[8px] font-black uppercase text-white/50">Текстура</p>
              <p className="text-sm font-black text-white">UHD</p>
            </div>
          </div>
        </div>

        {/* Depth Scanning Overlay */}
        <div className="border-accent-primary/30 pointer-events-none absolute inset-0 rounded-xl border-2">
          <div className="absolute left-0 top-0 h-20 w-20 rounded-tl-[3rem] border-l-4 border-t-4 border-white/50" />
          <div className="absolute right-0 top-0 h-20 w-20 rounded-tr-[3rem] border-r-4 border-t-4 border-white/50" />
          <div className="absolute bottom-0 left-0 h-20 w-20 rounded-bl-[3rem] border-b-4 border-l-4 border-white/50" />
          <div className="absolute bottom-0 right-0 h-20 w-20 rounded-br-[3rem] border-b-4 border-r-4 border-white/50" />
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 max-w-xs text-center text-white/40">
        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest">
          Наведите камеру на свободную поверхность для калибровки и размещения модели.
        </p>
      </div>
    </div>
  );
}
