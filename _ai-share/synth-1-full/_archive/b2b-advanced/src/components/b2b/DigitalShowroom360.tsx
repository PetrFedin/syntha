'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Info,
  ZoomIn,
  ZoomOut,
  Scan,
  Box,
  Cpu,
  Shield,
  Wind,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useB2BState } from '@/providers/b2b-state';
import allProductsData from '@/lib/products';
import { cn } from '@/lib/cn';
import { getMetricValueToneClass } from '@/lib/ui/semantic-data-tones';

interface DigitalShowroom360Props {
  onClose: () => void;
  brandId?: string;
}

export function DigitalShowroom360({ onClose, brandId = 'brand-1' }: DigitalShowroom360Props) {
  const { addB2bOrderItem } = useB2BState();
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [activeStyle, setActiveStyle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Mock 360 images (sequence of frames)
  const frames = [
    'https://images.unsplash.com/photo-1539109132304-372874a581ad?q=80&w=1200',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1200',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200',
    'https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=1200',
  ];

  const hotspots = [
    {
      id: 'h1',
      productId: '1',
      x: 45,
      y: 30,
      label: 'Cyber Tech Parka',
      details: 'Graphene Reinforced',
    },
    {
      id: 'h2',
      productId: '2',
      x: 65,
      y: 70,
      label: 'Neural Cargo',
      details: 'Adaptive Silhouette',
    },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRotating) {
      interval = setInterval(() => {
        setRotation((prev) => (prev + 1) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isAutoRotating) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    setRotation(Math.floor(x * 360));
  };

  const currentFrame = frames[Math.floor((rotation / 360) * frames.length)];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-black text-white">
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/50 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
            <Scan className="h-6 w-6 text-black" />
          </div>
          <div>
            <Badge className="bg-accent-primary mb-1 border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
              Interactive_Showroom_v1.2
            </Badge>
            <h2 className="text-sm font-black uppercase leading-none tracking-tighter">
              NEURAL_NOMAD_360°
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              FPS
            </span>
            <span className="text-xs font-black text-emerald-400">120.0</span>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-white/10 text-white transition-all hover:bg-white hover:text-black"
          >
            <Plus className="h-6 w-6 rotate-45" />
          </Button>
        </div>
      </div>

      {/* Main Viewer */}
      <div className="relative flex flex-1 items-center justify-center bg-[#0a0a0a]">
        {/* Background Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div
          ref={containerRef}
          className="relative flex h-full w-full cursor-grab items-center justify-center active:cursor-grabbing"
          onMouseEnter={() => setIsAutoRotating(false)}
          onMouseLeave={() => setIsAutoRotating(true)}
          onMouseMove={handleMouseMove}
        >
          <motion.div
            className="relative flex h-[80%] w-[80%] items-center justify-center"
            style={{ scale: zoom }}
            animate={{ rotateY: 0 }}
          >
            <img
              src={currentFrame}
              className="max-h-full max-w-full rounded-3xl object-contain shadow-[0_0_100px_rgba(255,255,255,0.1)]"
              draggable={false}
            />

            {/* Hotspots */}
            {showHotspots &&
              hotspots.map((hs) => (
                <motion.div
                  key={hs.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute z-20"
                  style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                >
                  <div
                    className="group relative"
                    onMouseEnter={() => setSelectedHotspot(hs.id)}
                    onMouseLeave={() => setSelectedHotspot(null)}
                  >
                    <div className="flex h-6 w-6 animate-pulse cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-2xl">
                      <Plus className="h-4 w-4" />
                    </div>

                    <AnimatePresence>
                      {selectedHotspot === hs.id && (
                        <motion.div
                          initial={{ opacity: 0, x: 20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 10, scale: 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.95 }}
                          className="absolute left-full top-1/2 z-30 ml-4 w-64 -translate-y-1/2 rounded-xl bg-white p-4 text-black shadow-2xl"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-black px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">
                                STYLE_REF_{hs.productId}
                              </Badge>
                              <ShoppingCart className="text-text-muted h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-black uppercase leading-tight tracking-tighter">
                                {hs.label}
                              </h4>
                              <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest">
                                {hs.details}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                className="h-10 flex-1 rounded-xl bg-black text-[9px] font-black uppercase tracking-widest text-white"
                                onClick={() => {
                                  const prod = allProductsData.find((p) => p.id === hs.productId);
                                  if (prod) addB2bOrderItem(prod, 'L', 1);
                                }}
                              >
                                Configure Order
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>

        {/* UI Overlays: Left Controls */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 space-y-4">
          {[
            { icon: Cpu, label: 'Fiber_Analysis', color: 'indigo' },
            { icon: Shield, label: 'Thermal_Scan', color: 'emerald' },
            { icon: Wind, label: 'Air_Flow', color: 'amber' },
            { icon: Box, label: 'Wireframe', color: 'slate' },
          ].map((tool, i) => (
            <Button
              key={i}
              variant="ghost"
              className="group flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-0 transition-all hover:bg-white hover:text-black"
            >
              <tool.icon className={cn('h-6 w-6', getMetricValueToneClass(tool.color))} />
              <span
                className={cn(
                  'text-[7px] font-black uppercase opacity-0 transition-opacity group-hover:opacity-100',
                  getMetricValueToneClass(tool.color)
                )}
              >
                {tool.label}
              </span>
            </Button>
          ))}
        </div>

        {/* UI Overlays: Right Zoom/Rotation Info */}
        <div className="absolute bottom-40 right-10 space-y-6">
          <div className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                Rotation_Angle
              </p>
              <div className="flex items-center gap-3">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="bg-accent-primary h-full"
                    style={{ width: `${(rotation / 360) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-black text-white">{rotation}°</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                Optical_Zoom
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-lg bg-white/10 p-0 hover:bg-white hover:text-black"
                  onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="font-mono text-xs font-black text-white">{zoom.toFixed(1)}x</span>
                <Button
                  variant="ghost"
                  className="h-8 w-8 rounded-lg bg-white/10 p-0 hover:bg-white hover:text-black"
                  onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              className={cn(
                'h-10 w-full gap-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all',
                showHotspots
                  ? 'bg-accent-primary border-accent-primary text-white'
                  : 'border-white/10 bg-white/5 text-white/40'
              )}
              onClick={() => setShowHotspots(!showHotspots)}
            >
              <Info className="h-4 w-4" />
              {showHotspots ? 'Hide Tags' : 'Show Tags'}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Thumbnails / Selector */}
      <div className="border-t border-white/10 bg-black/50 p-4 backdrop-blur-3xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pb-4">
            {frames.map((frame, i) => (
              <button
                key={i}
                onClick={() => setActiveStyle(i)}
                className={cn(
                  'relative aspect-[4/5] w-32 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-500',
                  activeStyle === i
                    ? 'border-accent-primary scale-105'
                    : 'border-transparent opacity-40 hover:opacity-100'
                )}
              >
                <img src={frame} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase tracking-widest text-white/60">
                  Style_0{i + 1}
                </span>
              </button>
            ))}
          </div>

          <div className="w-80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Global_Status
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Syntha_Live_Sync
              </span>
            </div>
            <Button className="h-10 w-full gap-3 rounded-2xl bg-white text-[11px] font-black uppercase tracking-widest text-black shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02]">
              Add Selected to Assortment <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
