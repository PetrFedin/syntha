'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check, Info, Sparkles, Globe, Heart, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const mockBrands = [
  {
    id: 'b1',
    name: 'CYBER-GEN',
    origin: 'Seoul, KR',
    style: 'Techwear / Avant-garde',
    description:
      'Лидер в области функциональной моды с использованием переработанных материалов. Идеальное попадание в ваш сегмент Tech-High.',
    dnaMatch: 98,
    image: 'https://images.unsplash.com/photo-1550246140-5119ae4790b8?q=80&w=800',
    stats: { retailers: 15, avgMargin: '72%', leadTime: '45 days' },
  },
  {
    id: 'b2',
    name: 'NORDIC SILK',
    origin: 'Copenhagen, DK',
    style: 'Minimalist / Luxury',
    description:
      'Премиальный шелк и минималистичный крой. Высокий спрос у вашей аудитории в категории "Вечерние платья".',
    dnaMatch: 94,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800',
    stats: { retailers: 42, avgMargin: '68%', leadTime: '30 days' },
  },
  {
    id: 'b3',
    name: 'TERRA FORM',
    origin: 'Saint Petersburg, RU',
    style: 'Sustainable / Outdoor',
    description:
      'Экологичная одежда для города и природы. Соответствует вашему тренду на ESG-осознанность.',
    dnaMatch: 89,
    image: 'https://images.unsplash.com/photo-1523381235212-d73f80385227?q=80&w=800',
    stats: { retailers: 28, avgMargin: '65%', leadTime: '60 days' },
  },
];

export function ShopB2bPartnersDiscoverLegacyPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number | null>(null);
  const { toast } = useToast();

  const currentBrand = mockBrands[currentIndex];

  const handleSwipe = (dir: 'left' | 'right') => {
    if (dir === 'right') {
      toast({
        title: 'Мэтч! ❤️',
        description: `Запрос на связь отправлен бренду ${currentBrand.name}. Мы сообщим, когда они откроют доступ к лайншиту.`,
      });
    }

    setDirection(dir === 'right' ? 1 : -1);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mockBrands.length);
      setDirection(null);
    }, 300);
  };

  return (
    <div className="flex min-h-[calc(100vh-100px)] flex-col gap-4 px-4 py-4">
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center overflow-hidden">
        <header className="mb-8 space-y-2 text-center">
          <Badge className="border-none bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            AI-поиск брендов
          </Badge>
          <h1 className="text-sm font-black uppercase tracking-tighter text-slate-900">
            Найдите ваш идеальный бренд
          </h1>
          <p className="text-sm font-medium text-slate-400">
            Листайте вправо, чтобы запросить сотрудничество, влево — чтобы пропустить.
          </p>
        </header>

        <div className="relative aspect-[3/4] w-full max-w-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                x: direction === 1 ? 500 : direction === -1 ? -500 : 0,
                rotate: direction === 1 ? 20 : direction === -1 ? -20 : 0,
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 - currentIndex }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <Card className="relative h-full w-full overflow-hidden rounded-xl border-none bg-white shadow-2xl">
                <div className="absolute inset-0">
                  <Image
                    src={currentBrand.image}
                    alt={currentBrand.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                </div>

                <div className="absolute left-6 right-6 top-4 z-10 flex items-center justify-between">
                  <Badge className="flex items-center gap-2 border-white/30 bg-white/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                    <Globe className="h-3 w-3" /> {currentBrand.origin}
                  </Badge>
                  <div className="flex items-center gap-2 rounded-full border-2 border-white bg-indigo-600 px-3 py-1.5 shadow-lg">
                    <Sparkles className="h-3 w-3 text-white" />
                    <span className="text-xs font-black text-white">
                      {currentBrand.dnaMatch}% Match
                    </span>
                  </div>
                </div>

                <CardContent className="absolute bottom-0 left-0 right-0 z-10 space-y-4 p-4 text-white">
                  <div className="space-y-1">
                    <h2 className="text-sm font-black uppercase leading-none tracking-tighter">
                      {currentBrand.name}
                    </h2>
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-400">
                      {currentBrand.style}
                    </p>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-white/70">
                    {currentBrand.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                    <div className="text-center">
                      <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-white/40">
                        Retailers
                      </p>
                      <p className="text-xs font-black">{currentBrand.stats.retailers}</p>
                    </div>
                    <div className="border-x border-white/10 text-center">
                      <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-white/40">
                        Avg Margin
                      </p>
                      <p className="text-xs font-black text-emerald-400">
                        {currentBrand.stats.avgMargin}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-white/40">
                        Lead Time
                      </p>
                      <p className="text-xs font-black">{currentBrand.stats.leadTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSwipe('left')}
            className="group h-20 w-20 rounded-full border-2 border-slate-100 bg-white text-slate-400 shadow-xl transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500"
          >
            <X className="h-10 w-10 transition-transform group-hover:rotate-90" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 transition-all hover:text-indigo-600"
          >
            <Info className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSwipe('right')}
            className="group h-20 w-20 rounded-full border-2 border-indigo-100 bg-indigo-50 text-indigo-600 shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-600 hover:text-white"
          >
            <Check className="h-10 w-10 transition-transform group-hover:scale-125" />
          </Button>
        </div>

        <div className="mt-8 flex gap-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-[10px] font-black uppercase text-slate-400">12 сохраненных</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase text-slate-400">
              3 новых предложения
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
