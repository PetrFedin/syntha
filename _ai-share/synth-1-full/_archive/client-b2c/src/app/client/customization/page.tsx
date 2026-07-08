'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  ChevronRight,
  ChevronLeft,
  Check,
  Ruler,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Info,
  Scan,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import {
  MOCK_CUSTOMIZATION_PROJECTS,
  MOCK_BODY_MEASUREMENTS,
} from '@/lib/logic/customization-utils';
import { CustomOption } from '@/lib/types/customization';
import Link from 'next/link';

export default function CustomizationHubPage() {
  const [step, setStep] = useState<'project' | 'configure' | 'measure' | 'review'>('project');
  const [selectedProject, setSelectedProject] = useState(MOCK_CUSTOMIZATION_PROJECTS[0]);
  const [config, setConfig] = useState<{
    fabric: CustomOption | null;
    button: CustomOption | null;
    pocket: CustomOption | null;
    collar: CustomOption | null;
  }>({
    fabric: selectedProject.availableOptions.fabrics[0],
    button: selectedProject.availableOptions.buttons[0],
    pocket: selectedProject.availableOptions.pockets[0],
    collar: selectedProject.availableOptions.collars[0],
  });

  const totalPrice =
    selectedProject.basePrice +
    (config.fabric?.priceDelta || 0) +
    (config.button?.priceDelta || 0) +
    (config.pocket?.priceDelta || 0) +
    (config.collar?.priceDelta || 0);

  const handleOptionSelect = (type: keyof typeof config, option: CustomOption) => {
    setConfig((prev) => ({ ...prev, [type]: option }));
  };

  return (
    <div className="bg-bg-surface2/80 min-h-screen pb-20">
      {/* Header */}
      <div className="border-border-subtle sticky top-0 z-30 border-b bg-white">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase italic tracking-tighter">
                Mass Customization Hub
              </h1>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
                Индивидуальный пошив P3
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {[
              { id: 'project', label: 'Выбор модели' },
              { id: 'configure', label: 'Дизайн' },
              { id: 'measure', label: 'Мерки' },
              { id: 'review', label: 'Заказ' },
            ].map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black',
                    step === s.id
                      ? 'bg-accent-primary shadow-accent-primary/15 text-white shadow-lg'
                      : 'bg-bg-surface2 text-text-muted'
                  )}
                >
                  {i + 1}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-black uppercase tracking-widest',
                    step === s.id ? 'text-accent-primary' : 'text-text-muted'
                  )}
                >
                  {s.label}
                </span>
                {i < 3 && <ChevronRight className="text-text-muted ml-2 h-3 w-3" />}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-text-muted text-[8px] font-black uppercase leading-none tracking-widest">
                Итого
              </p>
              <p className="text-accent-primary text-sm font-black tracking-tighter">
                {totalPrice.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <Button className="bg-text-primary hover:bg-text-primary/90 h-10 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
              Купить
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-4">
        <AnimatePresence mode="wait">
          {step === 'project' && (
            <motion.div
              key="project"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
            >
              {MOCK_CUSTOMIZATION_PROJECTS.map((project) => (
                <Card
                  key={project.id}
                  className="group cursor-pointer overflow-hidden rounded-xl border-none shadow-sm transition-all hover:shadow-2xl"
                  onClick={() => {
                    setSelectedProject(project);
                    setStep('configure');
                  }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="from-text-primary absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 w-full p-4">
                      <p className="text-accent-primary mb-1 text-[10px] font-black uppercase tracking-widest">
                        Tailored for You
                      </p>
                      <h3 className="mb-4 text-sm font-black uppercase italic leading-none tracking-tighter text-white">
                        {project.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black italic text-white">
                          от {project.basePrice.toLocaleString('ru-RU')} ₽
                        </span>
                        <div className="group-hover:bg-accent-primary flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md transition-colors">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Feature info */}
              <Card className="border-accent-primary/30 bg-accent-primary/10 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center lg:col-span-2">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-3xl bg-white shadow-xl">
                  <Sparkles className="text-accent-primary h-8 w-8" />
                </div>
                <h2 className="text-accent-primary mb-4 text-base font-black uppercase italic tracking-tighter">
                  Магия идеальной посадки
                </h2>
                <p className="text-text-secondary mb-8 max-w-md text-sm leading-relaxed">
                  Мы объединили традиционное мастерство индпошива с технологиями 3D-сканирования
                  тела. Больше никаких примерок и переделок — только вещь, созданная специально для
                  вас.
                </p>
                <div className="flex gap-3">
                  <Badge className="text-accent-primary border-accent-primary/20 h-8 bg-white px-4 font-black uppercase tracking-widest">
                    3D Scan Tech
                  </Badge>
                  <Badge className="text-accent-primary border-accent-primary/20 h-8 bg-white px-4 font-black uppercase tracking-widest">
                    AI Pattern Generator
                  </Badge>
                  <Badge className="text-accent-primary border-accent-primary/20 h-8 bg-white px-4 font-black uppercase tracking-widest">
                    Global CMT Network
                  </Badge>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'configure' && (
            <motion.div
              key="configure"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 gap-3 lg:grid-cols-12"
            >
              {/* Product Preview */}
              <div className="sticky top-24 lg:col-span-7 xl:col-span-8">
                <Card className="relative aspect-[4/5] overflow-hidden rounded-xl border-none bg-white shadow-2xl">
                  <img
                    src={selectedProject.image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-8 top-4 max-w-xs rounded-3xl border border-white/50 bg-white/80 p-4 shadow-xl backdrop-blur-md">
                    <p className="text-accent-primary mb-2 text-[10px] font-black uppercase tracking-[0.2em]">
                      Live Configuration
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-text-muted uppercase tracking-widest">Ткань:</span>
                        <span className="text-text-primary">{config.fabric?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-text-muted uppercase tracking-widest">Лацкан:</span>
                        <span className="text-text-primary">{config.collar?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-text-muted uppercase tracking-widest">Карманы:</span>
                        <span className="text-text-primary">{config.pocket?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                    <Button
                      size="icon"
                      className="bg-text-primary/10 hover:bg-text-primary/90 text-text-primary h-12 w-12 rounded-2xl border border-white/20 backdrop-blur-md"
                    >
                      <Maximize2 className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      className="bg-text-primary/10 hover:bg-text-primary/90 text-text-primary h-12 w-12 rounded-2xl border border-white/20 backdrop-blur-md"
                    >
                      <Sparkles className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Configuration Controls */}
              <div className="space-y-6 lg:col-span-5 xl:col-span-4">
                <div className="border-border-subtle rounded-xl border bg-white p-4 shadow-sm">
                  <h2 className="mb-6 text-sm font-black uppercase italic tracking-tighter">
                    Настройте детали
                  </h2>

                  <Tabs defaultValue="fabric">
                    {/* cabinetSurface v1 */}
                    <TabsList
                      className={cn(cabinetSurface.tabsList, 'mb-8 h-12 w-full flex-nowrap p-1')}
                    >
                      <TabsTrigger
                        value="fabric"
                        className={cn(
                          cabinetSurface.tabsTrigger,
                          'h-10 min-h-0 flex-1 text-[9px] font-black tracking-widest'
                        )}
                      >
                        Ткань
                      </TabsTrigger>
                      <TabsTrigger
                        value="collar"
                        className={cn(
                          cabinetSurface.tabsTrigger,
                          'h-10 min-h-0 flex-1 text-[9px] font-black tracking-widest'
                        )}
                      >
                        Крой
                      </TabsTrigger>
                      <TabsTrigger
                        value="details"
                        className={cn(
                          cabinetSurface.tabsTrigger,
                          'h-10 min-h-0 flex-1 text-[9px] font-black tracking-widest'
                        )}
                      >
                        Детали
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="fabric" className={cabinetSurface.cabinetProfileTabPanel}>
                      <p className="text-text-muted mb-4 text-[10px] font-black uppercase tracking-widest">
                        Выберите основной материал
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedProject.availableOptions.fabrics.map((fabric) => (
                          <div
                            key={fabric.id}
                            onClick={() => handleOptionSelect('fabric', fabric)}
                            className={cn(
                              'relative cursor-pointer rounded-2xl border-2 p-4 transition-all',
                              config.fabric?.id === fabric.id
                                ? 'border-accent-primary bg-accent-primary/10 shadow-md'
                                : 'border-border-subtle hover:border-border-default'
                            )}
                          >
                            <div className="mb-3 h-12 w-full overflow-hidden rounded-xl">
                              <img src={fabric.image} className="h-full w-full object-cover" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-tight">
                              {fabric.name}
                            </p>
                            <p className="text-text-muted text-[9px] font-bold">
                              +{fabric.priceDelta} ₽
                            </p>
                            {config.fabric?.id === fabric.id && (
                              <div className="bg-accent-primary absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-white">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="collar" className={cabinetSurface.cabinetProfileTabPanel}>
                      <p className="text-text-muted mb-4 text-[10px] font-black uppercase tracking-widest">
                        Тип лацкана и воротника
                      </p>
                      <div className="space-y-3">
                        {selectedProject.availableOptions.collars.map((collar) => (
                          <div
                            key={collar.id}
                            onClick={() => handleOptionSelect('collar', collar)}
                            className={cn(
                              'flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all',
                              config.collar?.id === collar.id
                                ? 'border-accent-primary bg-accent-primary/10 shadow-md'
                                : 'border-border-subtle hover:border-border-default'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-bg-surface2 flex h-10 w-10 items-center justify-center rounded-xl">
                                <Scissors className="text-text-muted h-4 w-4" />
                              </div>
                              <span className="text-[11px] font-black uppercase tracking-widest">
                                {collar.name}
                              </span>
                            </div>
                            <span className="text-accent-primary text-[10px] font-bold">
                              +{collar.priceDelta} ₽
                            </span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* More tabs content... */}
                    <TabsContent value="details" className={cabinetSurface.cabinetProfileTabPanel}>
                      <p className="text-text-muted mb-4 text-[10px] font-black uppercase tracking-widest">
                        Пуговицы и карманы
                      </p>
                      {/* Simplified for brevity */}
                      <div className="space-y-3">
                        {selectedProject.availableOptions.pockets.map((pocket) => (
                          <div
                            key={pocket.id}
                            onClick={() => handleOptionSelect('pocket', pocket)}
                            className={cn(
                              'flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all',
                              config.pocket?.id === pocket.id
                                ? 'border-accent-primary bg-accent-primary/10 shadow-md'
                                : 'border-border-subtle hover:border-border-default'
                            )}
                          >
                            <span className="text-[11px] font-black uppercase tracking-widest">
                              {pocket.name}
                            </span>
                            <span className="text-accent-primary text-[10px] font-bold">
                              +{pocket.priceDelta} ₽
                            </span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-12 flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="border-border-default h-12 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                      onClick={() => setStep('project')}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Назад
                    </Button>
                    <Button
                      className="bg-accent-primary hover:bg-accent-primary h-12 flex-[2] rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl"
                      onClick={() => setStep('measure')}
                    >
                      Перейти к меркам <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'measure' && (
            <motion.div
              key="measure"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="mx-auto max-w-4xl"
            >
              <Card className="bg-text-primary overflow-hidden rounded-xl border-none text-white shadow-2xl">
                <div className="grid md:grid-cols-2">
                  <div className="border-r border-white/10 p-4">
                    <div className="bg-accent-primary mb-8 flex h-12 w-12 items-center justify-center rounded-3xl shadow-2xl">
                      <Scan className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mb-4 text-base font-black uppercase italic leading-none tracking-tighter">
                      3D AI Body Scan
                    </h2>
                    <p className="mb-8 text-sm font-medium leading-relaxed text-white/60">
                      Мы используем данные вашего последнего 3D-сканирования. Точность до 1.5 мм
                      гарантирует, что вещь сядет идеально без единой примерки.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                          <Check className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
                            Последний скан
                          </p>
                          <p className="text-[11px] font-bold">
                            {new Date(MOCK_BODY_MEASUREMENTS.scannedAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="bg-accent-primary/20 text-accent-primary flex h-10 w-10 items-center justify-center rounded-xl">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
                            Точность (Confidence)
                          </p>
                          <p className="text-[11px] font-bold">
                            {(MOCK_BODY_MEASUREMENTS.confidenceScore * 100).toFixed(0)}% Высокая
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 flex gap-3">
                      <Button
                        className="text-text-primary hover:bg-bg-surface2 h-12 flex-1 rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest"
                        onClick={() => setStep('review')}
                      >
                        Использовать эти данные
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 w-12 rounded-2xl border-white/20 bg-transparent text-white"
                      >
                        <Scan className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-accent-primary/10 flex flex-col items-center justify-center p-4">
                    <div className="relative aspect-square w-full max-w-[300px]">
                      {/* Human Avatar Simulation */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <div className="bg-accent-primary/50 absolute h-[250px] w-px" />
                        <div className="bg-accent-primary/50 absolute h-px w-[150px]" />
                      </div>
                      <div className="border-accent-primary/30 absolute inset-0 animate-pulse rounded-full border-2" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="bg-accent-primary/40 mb-1 h-12 w-10 rounded-t-full opacity-40" />
                        <div className="bg-accent-primary/40 h-32 w-20 rounded-2xl opacity-40" />
                        <div className="mt-1 flex gap-1">
                          <div className="bg-accent-primary/40 h-20 w-8 rounded-b-xl opacity-40" />
                          <div className="bg-accent-primary/40 h-20 w-8 rounded-b-xl opacity-40" />
                        </div>
                      </div>

                      {/* Measurement pointers */}
                      <div className="absolute -right-4 top-1/4 flex items-center gap-2">
                        <div className="bg-accent-primary/40 h-[2px] w-12" />
                        <span className="text-[10px] font-black italic">
                          {MOCK_BODY_MEASUREMENTS.chest} cm
                        </span>
                      </div>
                      <div className="absolute -left-4 top-1/2 flex items-center gap-2">
                        <span className="text-[10px] font-black italic">
                          {MOCK_BODY_MEASUREMENTS.waist} cm
                        </span>
                        <div className="bg-accent-primary/40 h-[2px] w-12" />
                      </div>
                      <div className="absolute -right-4 bottom-1/4 flex items-center gap-2">
                        <div className="bg-accent-primary/40 h-[2px] w-12" />
                        <span className="text-[10px] font-black italic">
                          {MOCK_BODY_MEASUREMENTS.armLength} cm
                        </span>
                      </div>
                    </div>
                    <p className="text-accent-primary mt-8 text-[9px] font-black uppercase tracking-[0.3em]">
                      3D Avatar Verified
                    </p>
                  </div>
                </div>
              </Card>
              <div className="mt-8 flex justify-center">
                <Button
                  variant="link"
                  className="text-text-muted text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setStep('configure')}
                >
                  <ChevronLeft className="mr-2 h-3 w-3" /> Изменить конфигурацию
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto grid max-w-4xl grid-cols-1 gap-3 md:grid-cols-3"
            >
              <div className="space-y-6 md:col-span-2">
                <Card className="rounded-xl border-none bg-white p-3 shadow-sm">
                  <h2 className="mb-8 text-sm font-black uppercase italic tracking-tighter">
                    Резюме заказа
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl shadow-xl">
                        <img src={selectedProject.image} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-accent-primary mb-1 text-[10px] font-black uppercase tracking-widest">
                          {selectedProject.brandId}
                        </p>
                        <h3 className="text-base font-black uppercase italic tracking-tight">
                          {selectedProject.name}
                        </h3>
                      </div>
                    </div>

                    <div className="border-border-subtle grid grid-cols-2 gap-3 border-t pt-6">
                      <div>
                        <p className="text-text-muted mb-2 text-[9px] font-black uppercase tracking-widest">
                          Конфигурация
                        </p>
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold">{config.fabric?.name}</p>
                          <p className="text-[11px] font-bold">{config.collar?.name}</p>
                          <p className="text-[11px] font-bold">{config.pocket?.name}</p>
                          <p className="text-[11px] font-bold">{config.button?.name}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-text-muted mb-2 text-[9px] font-black uppercase tracking-widest">
                          Параметры тела
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                          <span className="text-text-muted">
                            Рост: {MOCK_BODY_MEASUREMENTS.height} см
                          </span>
                          <span className="text-text-muted">
                            Грудь: {MOCK_BODY_MEASUREMENTS.chest} см
                          </span>
                          <span className="text-text-muted">
                            Талия: {MOCK_BODY_MEASUREMENTS.waist} см
                          </span>
                          <span className="text-text-muted">
                            Бедра: {MOCK_BODY_MEASUREMENTS.hips} см
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-accent-primary/10 flex items-center gap-3 rounded-xl border-none p-4 shadow-sm">
                  <div className="text-accent-primary flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">
                      AI Quality Check
                    </h4>
                    <p className="text-text-secondary text-[11px] font-medium">
                      Ваша конфигурация проверена AI-стилистом. Сочетаемость материалов и кроя —
                      100%.
                    </p>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-text-primary rounded-xl border-none p-4 text-white shadow-xl">
                  <h3 className="mb-6 text-base font-black uppercase italic tracking-tight">
                    Оплата
                  </h3>
                  <div className="mb-8 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Модель
                      </span>
                      <span className="font-bold">
                        {selectedProject.basePrice.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Опции
                      </span>
                      <span className="font-bold">
                        {(totalPrice - selectedProject.basePrice).toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Доставка
                      </span>
                      <span className="text-[10px] font-black uppercase text-emerald-400">
                        Бесплатно
                      </span>
                    </div>
                    <div className="my-4 h-px bg-white/10" />
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-black uppercase italic tracking-tighter">
                        Итого
                      </span>
                      <span className="text-accent-primary text-sm font-black italic tracking-tighter">
                        {totalPrice.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>

                  <Button className="bg-accent-primary hover:bg-accent-primary shadow-accent-primary/40 h-10 w-full rounded-2xl text-[11px] font-black uppercase tracking-widest text-white shadow-xl">
                    Оформить заказ
                  </Button>
                  <p className="mt-6 text-center text-[9px] font-bold uppercase leading-relaxed tracking-widest text-white/30">
                    Нажимая кнопку, вы подтверждаете заказ на индивидуальный пошив по вашим меркам.
                  </p>
                </Card>

                <div className="border-border-subtle flex flex-col items-center rounded-xl border bg-white p-4 text-center">
                  <p className="text-text-muted mb-4 text-[9px] font-black uppercase tracking-widest">
                    Ожидаемая дата готовности
                  </p>
                  <p className="text-base font-black italic tracking-tighter">20 Марта 2024</p>
                  <Badge className="bg-bg-surface2 text-text-primary mt-4 border-none px-4 py-1 text-[8px] font-black uppercase tracking-widest">
                    14 дней на пошив
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
