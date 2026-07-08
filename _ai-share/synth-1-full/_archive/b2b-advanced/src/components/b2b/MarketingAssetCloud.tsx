'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  Download,
  Share2,
  Search,
  Filter,
  Plus,
  ImageIcon,
  Video,
  Tag,
  Maximize2,
  Trash2,
  Copy,
  Instagram,
  Zap,
  Globe,
  LayoutGrid,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import type { BrandAsset } from '@/lib/types/b2b';
import { cn } from '@/lib/cn';

export function MarketingAssetCloud() {
  const { marketingAssets } = useB2BState();
  const [selectedAsset, setSelectedAsset] = useState<BrandAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen space-y-4 bg-slate-50 p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
              <Cloud className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-indigo-100 text-[9px] font-black uppercase tracking-widest text-indigo-600"
            >
              CONTENT_SYNC_v4.1
            </Badge>
          </div>
          <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900 md:text-sm">
            Brand Marketing
            <br />
            Asset Cloud
          </h2>
          <p className="max-w-md text-left text-xs font-medium text-slate-400">
            Direct access to high-fidelity campaign assets, social media templates, and studio
            content. Download or sync directly to your retail platforms.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-2xl border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest"
          >
            <Globe className="h-4 w-4" /> Global Sync Settings
          </Button>
          <Button className="h-10 gap-2 rounded-2xl bg-slate-900 px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200">
            <Plus className="h-4 w-4" /> Загрузить материалы
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Browser */}
        <div className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Поиск: тег, стиль, кампания…"
                className="h-12 rounded-xl border-none bg-slate-50 pl-12 shadow-none focus-visible:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 px-4">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400">
                <Filter className="h-4 w-4" />
              </Button>
              <div className="mx-2 h-6 w-[1px] bg-slate-100" />
              <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md bg-white shadow-sm"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                  <Filter className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {marketingAssets.map((asset) => (
              <Card
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={cn(
                  'group cursor-pointer overflow-hidden rounded-xl border-none shadow-xl shadow-slate-200/50 transition-all',
                  selectedAsset?.id === asset.id
                    ? 'ring-4 ring-indigo-600'
                    : 'bg-white hover:scale-[1.02]'
                )}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={asset.thumbnail} className="h-full w-full object-cover" />
                  <div className="absolute left-4 top-4">
                    <Badge className="border-none bg-black/50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                      {asset.type}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl bg-white text-slate-900"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl bg-white text-slate-900"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="mb-2 truncate text-xs font-black uppercase text-slate-900">
                    {asset.title}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.map((tag) => (
                      <span key={tag} className="text-[7px] font-black uppercase text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Inspector */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            {selectedAsset ? (
              <motion.div
                key={selectedAsset.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Card className="space-y-4 rounded-xl border-none bg-white p-3 shadow-2xl shadow-slate-200/50">
                  <div className="space-y-4">
                    <div className="aspect-[4/5] overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-2xl">
                      <img src={selectedAsset.thumbnail} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-1 text-center">
                      <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                        {selectedAsset.title}
                      </h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Type: {selectedAsset.type} • 1080x1350
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-50 pt-4">
                    <h4 className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Integrations
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button className="h-10 gap-2 rounded-2xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700">
                        <Instagram className="h-4 w-4" /> Instagram Sync
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 gap-2 rounded-2xl border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-900"
                      >
                        <Zap className="h-4 w-4 fill-amber-500 text-amber-500" /> Shopify Push
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button className="h-10 w-full gap-2 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">
                      <Download className="h-4 w-4" /> Скачать Hi-Res
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedAsset(null)}
                      className="h-10 w-full text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                      Close Inspector
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="relative space-y-4 overflow-hidden rounded-xl border-none bg-indigo-600 p-3 text-white shadow-xl shadow-slate-200/50">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <Cloud className="h-32 w-32" />
                </div>
                <div className="relative z-10 space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-tight">AI Content node</h3>
                  <p className="text-xs font-medium uppercase leading-relaxed text-white/60">
                    Use our AI Studio to automatically resize campaign shots for your local store's
                    digital screens or social media dimensions.
                  </p>
                  <div className="space-y-4 rounded-3xl border border-white/10 bg-white/10 p-4 pt-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase">
                      <span>Cloud Storage</span>
                      <span>42% Used</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '42%' }}
                        className="h-full bg-white shadow-[0_0_10px_white]"
                      />
                    </div>
                  </div>
                  <Button className="h-10 w-full gap-2 rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-2xl">
                    Open AI Studio <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
