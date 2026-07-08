'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Orbit,
  Maximize2,
  Scan,
  Layers,
  Box,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight,
  Plus,
  ShoppingCart,
  Eye,
  Camera,
  Play,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { cn } from '@/lib/cn';

export function VRShowroomModule() {
  const [activeView, setActiveAnalysis] = useState<'3d' | 'ar' | 'tour'>('3d');

  return (
    <div className="bg-text-primary min-h-screen space-y-4 p-4 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary flex h-8 w-8 items-center justify-center rounded-xl">
              <Orbit className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-accent-primary/30 text-accent-primary bg-accent-primary/5 text-[9px] font-black uppercase tracking-widest backdrop-blur-md"
            >
              VR_Ecosystem_v5.0
            </Badge>
          </div>
          <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-white md:text-sm">
            Virtual Reality
            <br />
            Showroom
          </h2>
          <p className="text-text-muted max-w-md text-left text-xs font-medium">
            Immersive wholesale experience. Walk through digital twins of our physical showrooms,
            examine textures in 8K, and place orders in 3D.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
            {[
              { id: '3d', label: '3D Orbit', icon: Maximize2 },
              { id: 'ar', label: 'AR Projection', icon: Scan },
              { id: 'tour', label: 'VR Tour', icon: Camera },
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveAnalysis(tab.id as any)}
                className={cn(
                  'h-10 gap-2 rounded-xl px-5 text-[9px] font-black uppercase tracking-widest transition-all',
                  activeView === tab.id
                    ? 'text-text-primary bg-white shadow-xl'
                    : 'text-text-muted bg-transparent hover:text-white'
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Main VR Viewport */}
        <div className="lg:col-span-8">
          <div className="from-text-primary to-text-primary group relative aspect-video cursor-crosshair overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br shadow-2xl">
            {/* Mock VR Scene */}
            <img
              src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1200"
              className="h-full w-full object-cover opacity-40 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="bg-accent-primary absolute inset-0 animate-pulse rounded-full opacity-20 blur-[100px]" />
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/20 backdrop-blur-sm transition-all group-hover:scale-110">
                  <Play className="h-8 w-8 fill-white text-white" />
                </div>
              </div>
            </div>

            {/* Overlays */}
            <div className="absolute left-8 top-4 flex flex-col gap-2">
              <Badge className="border-none bg-emerald-500 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white">
                Streaming Live: 8K Ready
              </Badge>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 backdrop-blur-md">
                <div className="bg-accent-primary h-1.5 w-1.5 animate-pulse rounded-full" />
                <span className="text-accent-primary text-[8px] font-black uppercase tracking-widest">
                  Headset Connected
                </span>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
              <div className="space-y-4">
                <div className="max-w-sm space-y-2 rounded-[1.5rem] border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-tight">
                      Active Perspective
                    </h4>
                    <Eye className="text-text-muted h-3 w-3" />
                  </div>
                  <p className="text-text-muted text-[10px] font-medium leading-relaxed">
                    Main Hall Cluster: Cyber Tech Core. Hover to inspect individual SKU details.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="text-text-primary hover:bg-bg-surface2 h-10 w-10 rounded-2xl bg-white p-0 shadow-2xl">
                  <Maximize2 className="h-6 w-6" />
                </Button>
                <Button className="bg-accent-primary shadow-accent-primary/40 h-10 gap-2 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">
                  Enter Full Immersion <Zap className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* VR HUD Controls Sidebar */}
        <div className="space-y-4 lg:col-span-4">
          <Card className="space-y-4 rounded-xl border border-none border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
            <h3 className="text-accent-primary text-sm font-black uppercase tracking-widest">
              Environment HUD
            </h3>

            <div className="space-y-6">
              {[
                { label: 'Texture Detail', val: 'Ultra', icon: Layers },
                { label: 'Lighting Sync', val: 'RTX-ON', icon: Sparkles },
                { label: 'Physics Engine', val: 'Active', icon: Box },
              ].map((control, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <control.icon className="text-text-muted h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {control.label}
                    </span>
                  </div>
                  <span className="text-accent-primary text-[10px] font-bold">{control.val}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="text-text-secondary ml-2 text-[10px] font-black uppercase tracking-widest">
                Quick Commands
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-[8px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                >
                  Snapshot <Camera className="ml-2 h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-[8px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                >
                  Sync All <Zap className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-accent-primary space-y-6 rounded-xl border-none p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight">Security Anchor</h4>
            </div>
            <p className="text-[11px] font-medium leading-relaxed text-white/80">
              All interactions within the VR showroom are recorded and cryptographically signed for
              order verification and auditing.
            </p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-accent-primary/40 text-[9px] font-black uppercase tracking-widest">
                Digital Signature: ACTIVE
              </span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
