'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Navigation,
  ChevronRight,
  MapPin,
  Scan,
  Smartphone,
  Compass,
  Search,
  X,
  Camera,
  Box,
  Info,
  Zap,
  ShoppingCart,
  Map as MapIcon,
  Maximize2,
} from 'lucide-react';
import { MOCK_WAYPOINTS, MOCK_ITEMS, MOCK_ROUTES } from '@/lib/logic/ar-navigation-utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function ARNavigationPage() {
  const [isARActive, setIsARActive] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [activeWaypoint, setActiveWaypoint] = useState<string | null>(null);

  return (
    <div className="bg-text-primary relative flex min-h-screen flex-col text-white">
      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.client.home}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-md transition-all hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-sm font-black uppercase italic tracking-tight">
              Syntha AR Navigator
            </h1>
            <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
              <MapPin className="text-accent-primary h-2.5 w-2.5" /> Tverskaya St. Store 12
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-accent-primary flex h-6 items-center gap-1 border-none px-2 text-[8px] font-black uppercase tracking-widest text-white">
            <div className="h-1 w-1 animate-ping rounded-full bg-white" /> AR Live
          </Badge>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
            <Smartphone className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Experience View */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {!isARActive ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-4 text-center duration-700 animate-in fade-in">
            <div className="relative">
              <div className="bg-accent-primary/20 border-accent-primary/30 flex h-32 w-32 animate-pulse items-center justify-center rounded-xl border">
                <Box className="text-accent-primary h-12 w-12" />
              </div>
              <div className="text-accent-primary absolute -right-4 -top-4 flex h-12 w-12 rotate-12 items-center justify-center rounded-2xl bg-white shadow-2xl">
                <Smartphone className="h-6 w-6" />
              </div>
            </div>
            <div className="max-w-sm space-y-3">
              <h2 className="text-sm font-black uppercase tracking-tight">
                Погрузитесь в <span className="text-accent-primary italic">AR Шоппинг</span>
              </h2>
              <p className="text-sm font-medium leading-relaxed text-white/60">
                Используйте камеру для навигации, поиска товаров и открытия скрытых предложений
                прямо в зале.
              </p>
            </div>

            <div className="grid w-full max-w-md grid-cols-1 gap-3">
              <Button
                onClick={() => setIsARActive(true)}
                className="bg-accent-primary hover:bg-accent-primary group flex h-12 items-center justify-center gap-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-[0_20px_40px_-15px_rgba(79,70,229,0.5)] transition-all"
              >
                <Scan className="h-6 w-6 transition-transform group-hover:scale-110" /> Запустить AR
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl border-white/10 bg-white/5 text-[9px] font-black uppercase text-white/60 hover:text-white"
                >
                  <MapIcon className="mr-2 h-4 w-4" /> 2D Карта
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl border-white/10 bg-white/5 text-[9px] font-black uppercase text-white/60 hover:text-white"
                >
                  <Compass className="mr-2 h-4 w-4" /> Маршруты
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex-1">
            {/* Simulated Camera Feed */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop"
                className="h-full w-full object-cover opacity-40 blur-[2px] grayscale"
                alt="AR Feed"
              />
              <div className="from-text-primary absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />

              {/* Scan Reticle */}
              <div className="absolute left-1/2 top-1/2 flex h-64 w-64 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border-2 border-white/10">
                <div className="bg-accent-primary/40 animate-scan absolute top-1/2 h-1 w-full -translate-y-1/2" />
              </div>

              {/* AR Waypoints Floating */}
              <div
                className="bg-accent-primary/90 group absolute left-1/3 top-1/4 animate-bounce cursor-pointer rounded-3xl border border-white/20 p-4 shadow-2xl backdrop-blur-xl"
                onClick={() => setActiveWaypoint('w2')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-white/60">Локация</p>
                    <p className="text-xs font-black uppercase">Новинки Сезона</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              <div className="absolute bottom-1/3 right-1/4 cursor-pointer rounded-3xl border border-white/20 bg-emerald-600/90 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white/20">
                    <img src={MOCK_ITEMS[0].image} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-white/60">Discovery</p>
                    <p className="text-xs font-black uppercase">Костюм "Tech Noir"</p>
                  </div>
                  <Badge className="h-5 bg-white text-[8px] font-black text-emerald-600">
                    -15%
                  </Badge>
                </div>
              </div>
            </div>

            {/* AR Overlay Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 space-y-6 p-4">
              {/* Route Indicator */}
              <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="bg-accent-primary flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg">
                    <Navigation className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[10px] font-black uppercase text-white/40">
                      Маршрут: Новинки
                    </p>
                    <p className="text-sm font-black uppercase italic tracking-tight">
                      Следуйте за стрелкой (20м)
                    </p>
                  </div>
                </div>
                <div className="animate-spin-slow flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20">
                  <div className="bg-accent-primary h-6 w-1.5 origin-bottom rotate-45 rounded-full" />
                </div>
              </div>

              {/* Bottom Quick Actions */}
              <div className="grid grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="group flex h-12 flex-col items-center justify-center gap-1 rounded-3xl border-white/10 bg-white/10 backdrop-blur-md"
                >
                  <Search className="h-5 w-5 text-white/60 transition-colors group-hover:text-white" />
                  <span className="text-[8px] font-black uppercase">Поиск</span>
                </Button>
                <Button
                  variant="outline"
                  className="group flex h-12 flex-col items-center justify-center gap-1 rounded-3xl border-white/10 bg-white/10 backdrop-blur-md"
                >
                  <ShoppingCart className="h-5 w-5 text-white/60 transition-colors group-hover:text-white" />
                  <span className="text-[8px] font-black uppercase">Корзина</span>
                </Button>
                <Button
                  variant="outline"
                  className="group flex h-12 flex-col items-center justify-center gap-1 rounded-3xl border-white/10 bg-white/10 backdrop-blur-md"
                >
                  <Info className="h-5 w-5 text-white/60 transition-colors group-hover:text-white" />
                  <span className="text-[8px] font-black uppercase">Гид</span>
                </Button>
                <Button
                  onClick={() => setIsARActive(false)}
                  className="flex h-12 flex-col items-center justify-center gap-1 rounded-3xl bg-rose-600 text-white hover:bg-rose-500"
                >
                  <Maximize2 className="h-5 w-5" />
                  <span className="text-[8px] font-black uppercase">Выход</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% {
            transform: translateY(-32px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(32px);
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan 2s infinite ease-in-out;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
}
