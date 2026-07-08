'use client';

import React from 'react';
import { Maximize2, Trash2, Plus, Compass, Zap, Video } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PIMMediaTabProps {
  selectedProduct: any;
}

export function PIMMediaTab({ selectedProduct }: PIMMediaTabProps) {
  return (
    <div className="space-y-4 text-left animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-4">
        <h4 className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          Image Gallery
        </h4>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-bg-surface2 group relative aspect-square overflow-hidden rounded-3xl"
            >
              <img
                src={`https://placehold.co/400x400/f8fafc/64748b?text=SHOT_${i}`}
                className="h-full w-full object-cover"
                alt={`Shot ${i}`}
              />
              <div className="bg-text-primary/40 absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-primary h-10 w-10 rounded-xl bg-white"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl bg-white text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <button className="border-border-subtle hover:border-accent-primary/30 hover:bg-bg-surface2 flex aspect-square flex-col items-center justify-center gap-2 rounded-3xl border-4 border-dashed transition-all">
            <div className="bg-bg-surface2 flex h-12 w-12 items-center justify-center rounded-2xl">
              <Plus className="text-text-muted h-6 w-6" />
            </div>
            <span className="text-text-muted text-[10px] font-black uppercase">Add Media</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-text-muted text-[10px] font-black uppercase tracking-widest">
            3D Master Assets
          </h4>
          <Badge className="bg-accent-primary border-none text-[8px] font-black text-white">
            USDZ / GLB SUPPORTED
          </Badge>
        </div>
        <Card className="bg-bg-surface2 group flex items-center justify-between rounded-xl border-none p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-accent-primary flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Compass className="animate-spin-slow h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-text-primary text-sm font-black uppercase">
                {selectedProduct.sku}_Master.glb
              </p>
              <p className="text-text-muted text-[9px] font-bold uppercase">
                Size: 12.4 MB • Last Sync: 4h ago
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-border-default h-10 rounded-xl bg-white text-[9px] font-black uppercase tracking-widest"
            >
              Open Configurator
            </Button>
            <Button className="bg-text-primary h-10 rounded-xl px-6 text-[9px] font-black uppercase tracking-widest text-white">
              Manage Textures
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h4 className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          Video Lookbook
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-bg-surface2 group relative aspect-video overflow-hidden rounded-xl border-none shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1539109132304-372874a581ad?q=80&w=800"
              className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
            />
            <div className="bg-text-primary/40 absolute inset-0 flex items-center justify-center">
              <div className="text-text-primary flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white shadow-xl transition-transform hover:scale-110">
                <Video className="h-5 w-5" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <p className="text-[10px] font-black uppercase text-white">Main Campaign Shot</p>
              <Badge className="border-none bg-white/20 text-[8px] font-black text-white backdrop-blur-md">
                0:15
              </Badge>
            </div>
          </Card>
          <button className="border-border-subtle hover:border-accent-primary/30 hover:bg-bg-surface2 flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border-4 border-dashed transition-all">
            <div className="bg-bg-surface2 flex h-12 w-12 items-center justify-center rounded-2xl">
              <Plus className="text-text-muted h-6 w-6" />
            </div>
            <span className="text-text-muted text-[10px] font-black uppercase">
              Upload Campaign Video
            </span>
          </button>
        </div>
      </div>

      <div className="bg-text-primary flex items-center justify-between rounded-xl p-4 text-white">
        <div className="space-y-1">
          <h4 className="text-base font-black uppercase tracking-tight">AI Asset Studio</h4>
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/50">
            Generate lifestyle content from 3D models automatically
          </p>
        </div>
        <Button className="bg-accent-primary hover:bg-accent-primary shadow-accent-primary/20 h-12 gap-2 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
          Launch AI Generator <Zap className="h-4 w-4 fill-white" />
        </Button>
      </div>
    </div>
  );
}
