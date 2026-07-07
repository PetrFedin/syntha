'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  MapPin,
  Leaf,
  Droplets,
  ShieldCheck,
  QrCode,
  History,
  Info,
  ChevronRight,
  Calculator,
  ExternalLink,
  Zap,
  CheckCircle2,
  Package,
  Calendar,
  Building2,
  Share2,
  Scissors,
  Layers,
  Sparkles,
  Heart,
  ShoppingCart,
  ArrowLeft,
} from 'lucide-react';
import { getProductPassport, MATERIAL_SOURCES } from '@/lib/logic/passport-utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/**
 * Digital Product Passport (DPP) Public View
 * Публичная страница истории вещи для конечного клиента.
 */

export default function ProductPassportPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = React.use(paramsPromise);
  const passport = getProductPassport(params.id) || getProductPassport('PASS-9921')!;
  const sources = MATERIAL_SOURCES[passport.id] || [];

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      {/* Mobile-Friendly Header */}
      <div className="sticky top-0 z-50 border-b border-slate-100 bg-white px-6 py-4 shadow-sm">
        <div className="container relative mx-auto flex flex-col items-center space-y-3 text-center">
          {/* Back Button */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-slate-50"
            >
              <Link href="/brand/products">
                <ArrowLeft className="h-4 w-4 text-slate-400" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Digital Product Passport
          </div>
          <h1 className="font-headline text-sm font-black uppercase tracking-tighter">
            {passport.name}
          </h1>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="h-5 border-emerald-100 bg-emerald-50 px-2 text-[8px] font-black uppercase text-emerald-600"
            >
              Authentic & Verified
            </Badge>
            <span className="text-[10px] font-black uppercase text-slate-300">
              SKU: {passport.sku}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-8 max-w-2xl space-y-4 px-4">
        {/* Visual Header / Gallery Mock */}
        <Card className="overflow-hidden rounded-xl border-none bg-white shadow-xl shadow-slate-200/50">
          <div className="group relative flex aspect-[4/5] items-center justify-center bg-slate-100">
            <Package className="h-20 w-20 text-slate-200" />
            <div className="absolute right-6 top-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
            </div>
          </div>
        </Card>

        {/* Origin & Production Section */}
        <div className="space-y-4">
          <h3 className="ml-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Origin & Supply Chain
          </h3>
          <Card className="space-y-4 rounded-xl border-none p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50">
                <Globe className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-tight">
                  Made in {passport.originCountry}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  {passport.factoryName}, {passport.factoryLocation}
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-50 pt-6">
              <p className="text-[10px] font-black uppercase text-slate-400">
                Material Traceability
              </p>
              {sources.map((source, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-white">
                      <Layers className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{source.material}</p>
                      <p className="text-[9px] font-medium uppercase text-slate-400">
                        {source.origin} • {source.supplier}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="border-transparent bg-emerald-50 text-[8px] font-black uppercase text-emerald-600"
                  >
                    {source.sustainabilityScore}% ESG
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Environmental Impact */}
        <div className="space-y-4">
          <h3 className="ml-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Environmental Impact
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="space-y-3 rounded-xl border-none bg-slate-900 p-4 text-white shadow-sm">
              <div className="flex items-center gap-2 text-indigo-400">
                <Leaf className="h-4 w-4" />
                <span className="text-[8px] font-black uppercase tracking-widest">
                  Carbon Footprint
                </span>
              </div>
              <p className="text-sm font-black">{passport.carbonFootprint} kg</p>
              <p className="text-[10px] font-bold uppercase tracking-tight text-white/40">
                CO2 PER ITEM
              </p>
            </Card>
            <Card className="space-y-3 rounded-xl border border-none border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-600">
                <Droplets className="h-4 w-4" />
                <span className="text-[8px] font-black uppercase tracking-widest">Water Usage</span>
              </div>
              <p className="text-sm font-black text-slate-900">
                {isMounted ? passport.waterUsage.toLocaleString() : '—'} L
              </p>
              <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
                LITERS PER ITEM
              </p>
            </Card>
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-4">
          <h3 className="ml-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Verified Certifications
          </h3>
          <div className="flex flex-wrap gap-2">
            {passport.certifications.map((cert, i) => (
              <Badge
                key={i}
                className="h-10 gap-2 rounded-full border border-indigo-100 bg-white px-6 text-[9px] font-black uppercase text-indigo-600 shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {cert}
              </Badge>
            ))}
          </div>
        </div>

        {/* Composition & Care */}
        <div className="space-y-4">
          <h3 className="ml-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Care & Circularity
          </h3>
          <Card className="space-y-4 rounded-xl border-none p-4 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-indigo-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Composition
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {passport.composition.map((mat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-sm font-black">{mat.percentage}%</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400">{mat.material}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 border-t border-slate-50 pt-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Care Instructions
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {passport.careInstructions.map((instr, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-indigo-300" />
                      <span className="text-xs font-medium text-slate-600">{instr}</span>
                    </div>
                  ))}
                </div>
              </div>

              {passport.repairGuideUrl && (
                <Button
                  variant="outline"
                  className="h-12 w-full gap-2 rounded-2xl border-slate-100 text-[10px] font-black uppercase"
                >
                  <History className="h-4 w-4" /> Repair & Care Guide
                  <ExternalLink className="ml-auto h-3 w-3 opacity-40" />
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Blockchain Proof */}
        {passport.blockchainHash && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <QrCode className="h-32 w-32 text-slate-900" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Blockchain Verified
              </p>
              <p className="font-mono text-[9px] text-slate-300">{passport.blockchainHash}</p>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/80 p-4 backdrop-blur-xl">
          <div className="container mx-auto flex max-w-2xl gap-3">
            <Button className="h-10 flex-1 gap-2 rounded-2xl bg-slate-900 text-[10px] font-black uppercase text-white">
              <ShoppingCart className="h-4 w-4" /> В гардероб
            </Button>
            <Button variant="outline" className="h-10 w-10 rounded-2xl border-slate-200">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
