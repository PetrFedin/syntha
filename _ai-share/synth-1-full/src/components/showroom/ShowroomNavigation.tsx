'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  ShoppingBag,
  BarChart3,
  Layers,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Tag,
  Orbit,
  Scan,
  Package,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { VisualConstellation } from './VisualConstellation';
import { DigitalTwinRunway } from './DigitalTwinRunway';
import { VisualAssortmentPlanner } from '@/components/b2b/AssortmentPlanner';
import { WholesaleCollectionExplorer } from '@/components/b2b/WholesaleCollectionExplorer';
import { WholesaleOrderMatrix } from '@/components/b2b/WholesaleOrderMatrix';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { cn } from '@/lib/cn';

interface ShowroomNavigationProps {
  viewRole: string;
  showroomTab: string;
  setShowroomTab: (tab: string) => void;
  showroomViewMode: string;
  setShowroomViewMode: (mode: any) => void;
  toast: any;
  carousels: any[];
  showroomLayout?: 'default' | 'platform-core';
}

export const ShowroomNavigation: React.FC<ShowroomNavigationProps> = ({
  viewRole,
  showroomTab,
  setShowroomTab,
  showroomViewMode,
  setShowroomViewMode,
  toast,
  carousels,
  showroomLayout = 'default',
}) => {
  const slim = showroomLayout === 'platform-core';
  const { isConstellationOpen, setIsConstellationOpen } = useUIState();
  const { addB2bActivityLog, assortmentPlan } = useB2BState();
  const [isRunwayOpen, setIsRunwayOpen] = React.useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = React.useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = React.useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = React.useState(false);

  const tabs = [
    { id: 'all', title: 'Маркетрум', desc: 'Цифровая витрина товаров и готовых образов.' },
    {
      id: 'outlet',
      title: 'Аутлет',
      desc: 'Специальные предложения: товары прошлых коллекций с эксклюзивными скидками',
    },
    ...(viewRole === 'b2b'
      ? [
          {
            id: 'kickstarter',
            title: 'ЛАБОРАТОРИЯ',
            desc: 'Лимитированные серии и предпроизводство',
          },
        ]
      : []),
  ];

  return (
    <div className="relative mb-10 flex flex-col gap-3">
      {/* Feature Overlays */}
      <AnimatePresence>
        {isConstellationOpen && (
          <VisualConstellation onClose={() => setIsConstellationOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRunwayOpen && <DigitalTwinRunway onClose={() => setIsRunwayOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isMatrixOpen && (
          <WholesaleOrderMatrix collectionId="current" onClose={() => setIsMatrixOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCollectionsOpen && (
          <div className="fixed inset-0 z-[120] overflow-y-auto bg-white">
            <WholesaleCollectionExplorer />
            <Button
              onClick={() => setIsCollectionsOpen(false)}
              className="bg-text-primary fixed right-8 top-4 z-[130] h-12 w-12 rounded-2xl text-white shadow-2xl"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPlannerOpen && <VisualAssortmentPlanner onClose={() => setIsPlannerOpen(false)} />}
      </AnimatePresence>

      <div className="flex items-start justify-between">
        {/* Title & Badge Block */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-text-primary flex h-8 w-8 items-center justify-center rounded-xl transition-all">
              {showroomTab === 'outlet' ? (
                <Tag className="h-4 w-4 text-white" />
              ) : (
                <LayoutGrid className="h-4 w-4 text-white" />
              )}
            </div>
            {!slim ? (
            <Badge
              variant="outline"
              className="border-border-default text-text-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-normal"
            >
              {showroomTab === 'kickstarter'
                ? 'Лаборатория'
                : showroomTab === 'outlet'
                  ? 'Аутлет'
                  : 'Витрина'}
            </Badge>
            ) : null}
          </div>
          <h2 className="text-text-primary text-2xl font-bold uppercase leading-tight tracking-tight md:text-4xl">
            {tabs.find((t) => t.id === showroomTab)?.title}
          </h2>
          <p className="text-text-muted max-w-none whitespace-nowrap text-xs font-medium">
            {tabs.find((t) => t.id === showroomTab)?.desc}
          </p>
        </div>

        {/* Feature & Scroll Buttons */}
        <div className="flex items-center gap-3">
          <div className="border-border-subtle flex items-center gap-2 border-r pr-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-border-default hover:border-accent-primary hover:bg-accent-primary/10 text-text-muted hover:text-accent-primary group h-9 w-9 rounded-xl transition-all"
                    onClick={() => {
                      setIsConstellationOpen(true);
                      if (viewRole === 'b2b') {
                        addB2bActivityLog({
                          type: 'view_product',
                          actor: { id: 'retailer-1', name: 'Premium Store', type: 'retailer' },
                          target: {
                            id: 'constellation',
                            name: 'Neural Style Map',
                            type: 'product',
                          },
                          details: 'Launched Visual Constellation Exploration.',
                        });
                      }
                      toast({
                        title: 'AI Visual Constellation',
                        description: 'Запуск нейронной карты стилей... Переход в 3D пространство.',
                      });
                    }}
                  >
                    <Orbit className="h-3 w-3 transition-transform duration-500 group-hover:rotate-90" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-text-primary border-none text-[10px] font-black uppercase tracking-widest text-white">
                  Neural_Style_Map
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-border-default text-text-muted group h-9 w-9 rounded-xl transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                    onClick={() => {
                      setIsRunwayOpen(true);
                      if (viewRole === 'b2b') {
                        addB2bActivityLog({
                          type: 'view_product',
                          actor: { id: 'retailer-1', name: 'Premium Store', type: 'retailer' },
                          target: { id: 'runway', name: 'Digital Twin Runway', type: 'product' },
                          details: 'Activated Virtual Runway simulation.',
                        });
                      }
                      toast({
                        title: 'Digital Twin Runway',
                        description: 'Активация вашего цифрового двойника. Подиум готов.',
                      });
                    }}
                  >
                    <Scan className="h-3 w-3 transition-transform group-hover:scale-110" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-text-primary border-none text-[10px] font-black uppercase tracking-widest text-white">
                  Virtual_Runway
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-border-default hover:border-text-primary hover:bg-bg-surface2 text-text-muted hover:text-text-primary group h-9 w-9 rounded-xl transition-all"
                    onClick={() => setIsCollectionsOpen(true)}
                  >
                    <Package className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-text-primary border-none text-[10px] font-black uppercase tracking-widest text-white">
                  Collections_Registry
                </TooltipContent>
              </Tooltip>

              {viewRole === 'b2b' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-border-default hover:border-accent-primary hover:bg-accent-primary/10 text-text-muted hover:text-accent-primary group relative h-9 w-9 rounded-xl transition-all"
                      onClick={() => setIsPlannerOpen(true)}
                    >
                      <Layers className="h-3 w-3 transition-transform group-hover:scale-110" />
                      {assortmentPlan.length > 0 && (
                        <span className="bg-accent-primary animate-pulse-subtle absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black text-white shadow-lg">
                          {assortmentPlan.length}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-text-primary border-none text-[10px] font-black uppercase tracking-widest text-white">
                    Assortment_Planner
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="text-text-muted hover:text-text-primary p-1 transition-colors"
              onClick={() =>
                document
                  .getElementById('showroom-scroll')
                  ?.scrollBy({ left: -400, behavior: 'smooth' })
              }
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
            <button
              className="text-text-muted hover:text-text-primary p-1 transition-colors"
              onClick={() =>
                document
                  .getElementById('showroom-scroll')
                  ?.scrollBy({ left: 400, behavior: 'smooth' })
              }
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Row - Similar to Ecosystem style, aligned Left */}
      <div className="flex flex-col gap-3">
        <div className="bg-bg-surface2 border-border-subtle flex w-fit items-center gap-1.5 rounded-2xl border p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setShowroomTab(tab.id as any);
                if (tab.id === 'all') setShowroomViewMode('products');
                if (tab.id === 'outlet') setShowroomViewMode('products');
                if (tab.id === 'kickstarter') setShowroomViewMode('products');
              }}
              className={cn(
                'btn-tab min-w-[140px]',
                showroomTab === tab.id ? 'btn-tab-active' : 'btn-tab-inactive'
              )}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Sub-navigation (Small buttons under the section info) */}
        <div className="bg-bg-surface2/80 border-border-subtle/50 flex w-fit flex-wrap items-center gap-1.5 rounded-2xl border p-1.5">
          <button
            onClick={() => setShowroomViewMode('products')}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[11px] font-bold uppercase tracking-normal shadow-sm transition-all',
              showroomViewMode === 'products'
                ? 'text-text-primary border-border-default bg-white'
                : 'text-text-muted hover:text-text-secondary border-transparent bg-white/50'
            )}
          >
            <LayoutGrid className="h-3 w-3" />
            Витрина
          </button>
          <button
            onClick={() => setShowroomViewMode('looks')}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[11px] font-bold uppercase tracking-normal shadow-sm transition-all',
              showroomViewMode === 'looks'
                ? 'text-text-primary border-border-default bg-white'
                : 'text-text-muted hover:text-text-secondary border-transparent bg-white/50'
            )}
          >
            <Sparkles className="h-3 w-3" />
            Образы
          </button>

          {showroomTab === 'outlet' && (
            <div className="text-text-muted border-border-default ml-2 flex items-center gap-2 border-l px-5 py-2 text-[8px] font-black uppercase tracking-widest">
              Архивные коллекции
            </div>
          )}
          {showroomTab === 'kickstarter' && (
            <div className="text-text-muted border-border-default ml-2 flex items-center gap-2 border-l px-5 py-2 text-[8px] font-black uppercase tracking-widest">
              Проекты лаборатории
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
