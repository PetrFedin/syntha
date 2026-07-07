'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Download,
  Share2,
  Sparkles,
  Maximize2,
  Shirt,
  User,
  Palette,
  CheckCircle2,
  Info,
  Brain,
  Zap,
  Loader2,
  Heart,
  RefreshCcw,
  ChevronRight,
  ChevronDown,
  Check,
  Camera,
  MapPin,
  Terminal,
  Activity,
  Layers,
  Settings2,
  Globe,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUIState } from '@/providers/ui-state';
import { motion, Reorder } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Mock Images for AI Generation
const MOCK_LOOK_IMAGES = {
  woman: {
    studio:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    street:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
    editorial:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
  },
  man: {
    studio:
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=800',
    street:
      'https://images.unsplash.com/photo-1488161628813-fa4466f658b3?auto=format&fit=crop&q=80&w=800',
    editorial:
      'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&q=80&w=800',
  },
  boy: {
    studio:
      'https://images.unsplash.com/photo-1622244099803-7531845e2f3a?auto=format&fit=crop&q=80&w=800',
    street:
      'https://images.unsplash.com/photo-1519457431-75514b723006?auto=format&fit=crop&q=80&w=800',
    editorial:
      'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&q=80&w=800',
  },
  girl: {
    studio:
      'https://images.unsplash.com/photo-1621452137023-9c84aa590f88?auto=format&fit=crop&q=80&w=800',
    street:
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800',
    editorial:
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800',
  },
};

export default function LookBuilderPage() {
  const { toast } = useToast();
  const { addCartItem, addLookboard, addProductToLookboard } = useUIState();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bgRemovedItems, setBgRemovedItems] = useState<string[]>([]);

  // New States for Advanced Features
  const [selectedModel, setSelectedModel] = useState<'man' | 'woman' | 'boy' | 'girl'>('woman');
  const [activeModelGroup, setActiveModelGroup] = useState<'adult' | 'child'>('adult');
  const [isGeneratingLook, setIsGeneratingLook] = useState(false);
  const [generatedLookUrl, setGeneratedLookUrl] = useState<string | null>(null);
  const [renderStatus, setRenderStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  // AI Pipeline States
  const [generationStyle, setGenerationStyle] = useState<'studio' | 'street' | 'editorial'>(
    'studio'
  );
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [renderQuality, setFitQuality] = useState(85);

  const GENERATION_STYLES = [
    {
      id: 'studio',
      name: 'Studio Editorial',
      icon: Camera,
      desc: 'Чистый белый фон, профессиональный свет',
    },
    {
      id: 'street',
      name: 'Street Style',
      icon: MapPin,
      desc: 'Городская локация, естественные тени',
    },
    {
      id: 'editorial',
      name: 'Vogue Cover',
      icon: Globe,
      desc: 'Высокая контрастность, журнальный рендер',
    },
  ];

  // Filter state
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [showSynthaOnly, setShowSynthaOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { wishlist } = useUIState();

  const brandsList = Array.from(new Set(products.map((p) => p.brand))).sort();
  const categoriesList = ['Clothing', 'Footwear', 'Accessories'];

  useEffect(() => {
    // Sync activeModelGroup with selectedModel on mount
    if (selectedModel === 'boy' || selectedModel === 'girl') {
      setActiveModelGroup('child');
    } else {
      setActiveModelGroup('adult');
    }
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/data/products.json');
        const data = (await res.json()) as Product[];
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const categoryMatch =
      activeCategories.length === 0 || activeCategories.some((cat) => p.category.includes(cat));

    // Model/Audience Filter Logic
    let audienceMatch = false;
    if (selectedModel === 'man') {
      audienceMatch = p.audience === 'Мужской' || p.audience === 'Унисекс';
    } else if (selectedModel === 'woman') {
      audienceMatch = p.audience === 'Женский' || p.audience === 'Унисекс';
    } else if (selectedModel === 'boy') {
      audienceMatch =
        p.audience === 'Детский' || p.audience === 'Мальчики' || p.audience === 'Новорожденные';
    } else if (selectedModel === 'girl') {
      audienceMatch =
        p.audience === 'Детский' || p.audience === 'Девочки' || p.audience === 'Новорожденные';
    }

    const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
    const synthaMatch = !showSynthaOnly || p.isPromoted || parseInt(p.id) % 3 === 0;
    const favoriteMatch = !showFavoritesOnly || wishlist.some((item) => item.id === p.id);

    return categoryMatch && audienceMatch && brandMatch && synthaMatch && favoriteMatch;
  });

  const checkCategoryConflict = (product: Product, currentItems: Product[]) => {
    const name = product.name.toLowerCase();
    const cat = product.category.toLowerCase();
    const subcat = (product.subcategory || '').toLowerCase();

    const isDress = name.includes('платье') || name.includes('dress') || subcat.includes('dress');
    const isSkirt = name.includes('юбка') || name.includes('skirt') || subcat.includes('skirt');
    const isPants =
      name.includes('брюки') ||
      name.includes('джинсы') ||
      name.includes('pants') ||
      name.includes('jeans') ||
      subcat.includes('pants');
    const isShorts = name.includes('шорты') || name.includes('shorts') || subcat.includes('shorts');
    const isOuterwear =
      cat.includes('верхняя') ||
      cat.includes('outerwear') ||
      name.includes('куртка') ||
      name.includes('пальто') ||
      name.includes('jacket') ||
      name.includes('coat');
    const isFootwear =
      cat.includes('обувь') ||
      cat.includes('footwear') ||
      name.includes('кроссовки') ||
      name.includes('ботинки') ||
      name.includes('shoes');

    for (const item of currentItems) {
      const itemName = item.name.toLowerCase();
      const itemCat = item.category.toLowerCase();
      const itemSubcat = (item.subcategory || '').toLowerCase();

      const existingDress =
        itemName.includes('платье') || itemName.includes('dress') || itemSubcat.includes('dress');
      const existingSkirt =
        itemName.includes('юбка') || itemName.includes('skirt') || itemSubcat.includes('skirt');
      const existingPants =
        itemName.includes('брюки') ||
        itemName.includes('джинсы') ||
        itemName.includes('pants') ||
        itemName.includes('jeans') ||
        itemSubcat.includes('pants');
      const existingShorts =
        itemName.includes('шорты') || itemName.includes('shorts') || itemSubcat.includes('shorts');
      const existingOuterwear =
        itemCat.includes('верхняя') ||
        itemCat.includes('outerwear') ||
        itemName.includes('куртка') ||
        itemName.includes('пальто') ||
        itemName.includes('jacket') ||
        itemName.includes('coat');
      const existingFootwear =
        itemCat.includes('обувь') ||
        itemCat.includes('footwear') ||
        itemName.includes('кроссовки') ||
        itemName.includes('ботинки') ||
        itemName.includes('shoes');

      if (isDress && (existingSkirt || existingPants || existingShorts))
        return 'Нельзя добавить платье, если уже выбрана юбка или брюки.';
      if ((isSkirt || isPants || isShorts) && existingDress)
        return 'Нельзя добавить юбку или брюки к платью.';
      if (isOuterwear && existingOuterwear)
        return 'Можно выбрать только один предмет верхней одежды.';
      if (isFootwear && existingFootwear) return 'Можно выбрать только одну пару обуви.';
      if (isPants && (existingShorts || existingPants))
        return 'Брюки/джинсы конфликтуют с уже выбранным низом.';
      if (isShorts && (existingPants || existingShorts))
        return 'Шорты конфликтуют с уже выбранным низом.';
    }
    return null;
  };

  const addToLook = (product: Product) => {
    if (selectedItems.find((item) => item.id === product.id)) {
      toast({
        title: 'Товар уже в образе',
        description: 'Вы уже добавили этот предмет на холст.',
        variant: 'destructive',
      });
      return;
    }

    const conflictError = checkCategoryConflict(product, selectedItems);
    if (conflictError) {
      toast({
        title: 'Конфликт категорий',
        description: conflictError,
        variant: 'destructive',
      });
      return;
    }

    setSelectedItems([...selectedItems, product]);
    setGeneratedLookUrl(null);
    toast({
      title: 'Добавлено в образ',
      description: `${product.name} успешно добавлен в конструктор.`,
    });
  };

  const generateAILook = () => {
    if (selectedItems.length < 2) {
      toast({
        title: 'Мало вещей',
        description: 'Добавьте хотя бы 2-3 предмета для генерации образа на модели.',
        variant: 'destructive',
      });
      return;
    }

    setRenderStatus('processing');
    setIsGeneratingLook(true);
    setGenerationLogs([]);
    setGeneratedLookUrl(null);

    const logs = [
      'Инициализация AI Pipeline v4.2...',
      'Загрузка текстур выбранных SKU...',
      'Анализ физических свойств ткани...',
      `Подбор освещения под стиль: ${generationStyle.toUpperCase()}`,
      `Масштабирование под модель: ${selectedModel.toUpperCase()}`,
      'Генерация теней и окклюзии...',
      'Neural Fusion: Сборка финального кадра...',
      'DLSS Rendering complete.',
    ];

    let currentLogIndex = 0;
    const logInterval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setGenerationLogs((prev) => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(logInterval);

        // Finalize generation with stability delay
        setTimeout(() => {
          const rawUrl = (MOCK_LOOK_IMAGES as any)[selectedModel][generationStyle];
          const finalUrl = `${rawUrl}&t=${Date.now()}`;

          setGeneratedLookUrl(finalUrl);
          setRenderStatus('success');
          setIsGeneratingLook(false);
          setFitQuality(Math.round(Math.random() * 5 + 94));

          toast({
            title: 'Генерация завершена',
            description: 'Ваш образ готов в выбранном стиле.',
          });
        }, 800);
      }
    }, 500);
  };

  const removeFromLook = (productId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== productId));
    setBgRemovedItems(bgRemovedItems.filter((id) => id !== productId));
  };

  const totalLookPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const handleSaveLook = () => {
    if (selectedItems.length === 0) return;
    const newLb = addLookboard(
      `Look: ${new Date().toLocaleDateString()}`,
      'Generated from Live Look Builder'
    );
    selectedItems.forEach((item) => {
      addProductToLookboard(item, newLb.id);
    });
    toast({
      title: 'Look Saved',
      description: 'Ваш образ успешно сохранен в профиле.',
    });
  };

  const handleBuyLook = () => {
    selectedItems.forEach((item) => {
      addCartItem(item, item.sizes?.[0]?.name || 'One Size');
    });
    toast({
      title: 'Look added to cart',
      description: `All ${selectedItems.length} items have been added to your bag.`,
    });
  };

  const handleShareLook = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Ссылка на ваш образ скопирована.',
    });
  };

  return (
    <div className="bg-bg-surface2 min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6">
        <header className="mb-12 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <Badge className="bg-accent-primary mb-3 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
              AI Creative Studio
            </Badge>
            <h1 className="text-text-primary text-sm font-black uppercase leading-none tracking-tight">
              Live Look <span className="text-accent-primary">Builder</span>
            </h1>
            <p className="text-text-secondary mt-4 max-w-xl font-medium">
              Создайте профессиональный образ с помощью нейронного рендеринга. Выберите вещи,
              настройте стиль съемки и запустите генерацию.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="border-border-subtle relative mr-4 flex rounded-2xl border bg-white p-1 shadow-sm">
              {[
                { id: 'woman', label: 'Женщина', group: 'adult' },
                { id: 'man', label: 'Мужчина', group: 'adult' },
                { id: 'child', label: 'Ребенок', group: 'child' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    if (m.id === 'child') {
                      setActiveModelGroup('child');
                      if (selectedModel !== 'boy' && selectedModel !== 'girl') {
                        setSelectedModel('boy');
                        setSelectedItems([]);
                        setGeneratedLookUrl(null);
                      }
                    } else {
                      setActiveModelGroup('adult');
                      setSelectedModel(m.id as any);
                      setSelectedItems([]);
                      setGeneratedLookUrl(null);
                    }
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all',
                    (m.id === 'child' ? activeModelGroup === 'child' : selectedModel === m.id)
                      ? 'bg-text-primary text-white shadow-lg'
                      : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  {m.id === 'child' ? (
                    <Plus
                      className={cn('h-3 w-3', activeModelGroup === 'child' ? 'rotate-45' : '')}
                    />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  {m.label}
                </button>
              ))}

              {activeModelGroup === 'child' && (
                <div className="border-border-subtle absolute left-0 right-0 top-full z-50 mt-2 flex rounded-2xl border bg-white p-1 shadow-xl duration-300 animate-in slide-in-from-top-2">
                  {[
                    { id: 'boy', label: 'Мальчик' },
                    { id: 'girl', label: 'Девочка' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedModel(c.id as any);
                        setSelectedItems([]);
                        setGeneratedLookUrl(null);
                      }}
                      className={cn(
                        'flex-1 rounded-xl py-2 text-[8px] font-black uppercase tracking-widest transition-all',
                        selectedModel === c.id
                          ? 'bg-accent-primary text-white shadow-md'
                          : 'text-text-muted hover:bg-bg-surface2'
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleSaveLook}
              className="border-border-default h-12 rounded-2xl px-6 text-[10px] font-bold uppercase tracking-widest"
            >
              <Download className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            <Button
              variant="outline"
              onClick={handleShareLook}
              className="border-border-default h-12 rounded-2xl px-6 text-[10px] font-bold uppercase tracking-widest"
            >
              <Share2 className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </header>

        <div className="grid items-start gap-3 lg:grid-cols-12">
          {/* Left Side: Controls & Catalog */}
          <div className="space-y-6 lg:col-span-4">
            {/* AI Generator Control Panel */}
            <div className="space-y-4">
              <Card className="bg-text-primary group relative overflow-hidden rounded-xl border-none p-4 text-white shadow-2xl">
                <Sparkles className="absolute -right-4 -top-4 h-32 w-32 text-white opacity-[0.03] transition-transform duration-700 group-hover:scale-110" />
                <div className="relative z-10 space-y-6">
                  <header className="space-y-2">
                    <Badge className="bg-accent-primary flex w-fit items-center gap-1 border-none px-2 py-0.5 text-[8px] font-black uppercase text-white">
                      <Settings2 className="h-2 w-2" /> AI Engine v4.2
                    </Badge>
                    <h3 className="text-sm font-black uppercase italic leading-none tracking-tight">
                      Look <br /> Pipeline
                    </h3>
                  </header>

                  <div className="space-y-3">
                    <p className="text-text-secondary text-[8px] font-black uppercase tracking-widest">
                      1. Стиль генерации
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {GENERATION_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setGenerationStyle(style.id as any)}
                          className={cn(
                            'group/style flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                            generationStyle === style.id
                              ? 'border-accent-primary shadow-accent-primary/20 bg-white/10 shadow-lg'
                              : 'border-white/5 bg-white/5 hover:bg-white/10'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                              generationStyle === style.id
                                ? 'bg-accent-primary text-white'
                                : 'text-text-muted bg-white/10'
                            )}
                          >
                            <style.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-tight">
                              {style.name}
                            </p>
                            <p className="text-text-secondary mt-0.5 text-[8px] font-medium leading-none">
                              {style.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={generateAILook}
                    disabled={isGeneratingLook || selectedItems.length < 2}
                    className="text-text-primary hover:bg-accent-primary h-10 w-full rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20 transition-all hover:text-white"
                  >
                    {isGeneratingLook ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="fill-text-primary mr-2 h-4 w-4 group-hover:fill-white" />
                    )}
                    Запустить рендеринг
                  </Button>
                </div>
              </Card>

              {/* Technical Logs */}
              <Card className="bg-text-primary group relative overflow-hidden rounded-xl border border-none border-white/5 p-4 text-emerald-500 shadow-2xl">
                <div className="mb-4 flex items-center justify-between border-b border-emerald-500/20 pb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Neural Log
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/20" />
                  </div>
                </div>

                <div className="scrollbar-hide h-[100px] space-y-2 overflow-y-auto font-mono text-[9px] leading-tight">
                  {generationLogs.length === 0 ? (
                    <p className="italic text-emerald-500/40">Waiting for SKU analysis...</p>
                  ) : (
                    generationLogs.map((log, i) => (
                      <div
                        key={i}
                        className="flex gap-2 duration-300 animate-in fade-in slide-in-from-left-2"
                      >
                        <span className="text-emerald-500/30">
                          [{new Date().toLocaleTimeString('en-GB', { hour12: false })}]
                        </span>
                        <span className="text-emerald-400">&gt; {log}</span>
                      </div>
                    ))
                  )}
                  {isGeneratingLook && (
                    <div className="flex animate-pulse items-center gap-2 text-emerald-400">
                      <span>&gt; processing...</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-emerald-500/10 pt-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-emerald-500/40">
                      Confidence
                    </p>
                    <p className="text-xs font-black">{renderQuality}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-emerald-500/40">Steps</p>
                    <p className="text-xs font-black">50/50</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Catalog Card */}
            <div className="border-border-subtle rounded-xl border bg-white p-4 shadow-xl">
              <div className="mb-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-text-primary text-xs font-black uppercase italic tracking-widest">
                    Inventory: {selectedModel}
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-accent-primary/20 text-accent-primary text-[8px] font-black"
                  >
                    v4.0 Ready
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-border-subtle h-10 w-full justify-between rounded-xl text-[9px] font-black uppercase tracking-widest"
                      >
                        {activeCategories.length === 0
                          ? 'Категории'
                          : `Cat (${activeCategories.length})`}
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 rounded-xl p-1" align="start">
                      {categoriesList.map((cat) => (
                        <DropdownMenuCheckboxItem
                          key={cat}
                          checked={activeCategories.includes(cat)}
                          onCheckedChange={(checked) => {
                            setActiveCategories((prev) =>
                              checked ? [...prev, cat] : prev.filter((c) => c !== cat)
                            );
                          }}
                          className="rounded-lg text-[9px] font-black uppercase tracking-widest"
                        >
                          {cat}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-border-subtle h-10 w-full justify-between rounded-xl text-[9px] font-black uppercase tracking-widest"
                      >
                        {selectedBrands.length === 0
                          ? 'Бренды'
                          : `Brands (${selectedBrands.length})`}
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="scrollbar-hide max-h-[300px] w-56 overflow-y-auto rounded-xl p-1"
                      align="end"
                    >
                      {brandsList.map((brand) => (
                        <DropdownMenuCheckboxItem
                          key={brand}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={(checked) => {
                            setSelectedBrands((prev) =>
                              checked ? [...prev, brand] : prev.filter((b) => b !== brand)
                            );
                          }}
                          className="rounded-lg text-[9px] font-black uppercase tracking-widest"
                        >
                          {brand}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="scrollbar-hide grid max-h-[400px] grid-cols-2 gap-3 overflow-y-auto pr-2">
                {isLoading
                  ? Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="bg-bg-surface2 aspect-[3/4] animate-pulse rounded-2xl"
                        />
                      ))
                  : filteredProducts.map((product) => {
                      const conflictMsg = checkCategoryConflict(product, selectedItems);
                      return (
                        <button
                          key={product.id}
                          disabled={!!conflictMsg}
                          onClick={() => addToLook(product)}
                          className={cn(
                            'bg-bg-surface2 group relative aspect-[3/4] overflow-hidden rounded-2xl border text-left transition-all',
                            conflictMsg
                              ? 'border-border-subtle cursor-not-allowed opacity-40 grayscale'
                              : 'border-border-subtle hover:border-accent-primary'
                          )}
                        >
                          <Image
                            src={product.images?.[0]?.url || (product as any).image}
                            alt={product.name}
                            fill
                            className="object-contain p-4 drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                          <div className="absolute bottom-2 left-2 right-2 translate-y-2 opacity-0 transition-transform group-hover:translate-y-0 group-hover:opacity-100">
                            <p className="truncate rounded-md bg-black/40 p-1 text-[7px] font-black uppercase text-white backdrop-blur-sm">
                              {product.name}
                            </p>
                          </div>
                          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            <Plus className="text-text-primary h-2 w-2" />
                          </div>
                        </button>
                      );
                    })}
              </div>
            </div>
          </div>

          {/* Right: Main Canvas */}
          <div className="space-y-4 lg:col-span-8">
            <div className="border-border-subtle relative flex min-h-[850px] flex-col overflow-hidden rounded-xl border bg-white shadow-2xl">
              {/* Technical Grid Overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              <div className="relative z-10 flex h-full flex-col p-4">
                <div className="mb-12 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-text-primary flex h-12 w-12 items-center justify-center rounded-2xl text-white">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                        Workspace / {selectedModel.toUpperCase()}
                      </p>
                      <h3 className="text-text-primary text-base font-black uppercase italic tracking-tight">
                        Composition Canvas
                      </h3>
                    </div>
                  </div>

                  {selectedItems.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                          Estimated Total
                        </p>
                        <p className="text-text-primary text-sm font-black italic">
                          {totalLookPrice.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      <Button
                        onClick={handleBuyLook}
                        className="bg-accent-primary hover:bg-accent-primary shadow-accent-primary/15 h-10 rounded-2xl px-8 text-[11px] font-black uppercase tracking-widest text-white shadow-lg"
                      >
                        <Zap className="mr-2 h-4 w-4 fill-white" /> Check Out Look
                      </Button>
                    </div>
                  )}
                </div>

                {selectedItems.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-40 text-center">
                    <div className="bg-bg-surface2 mb-8 flex h-24 w-24 items-center justify-center rounded-xl transition-transform duration-500 group-hover:rotate-12">
                      <Shirt className="text-text-muted h-10 w-10" />
                    </div>
                    <h2 className="text-text-muted text-base font-black uppercase italic tracking-tight">
                      Canvas <br /> Waiting
                    </h2>
                    <p className="text-text-muted mt-4 max-w-sm text-[10px] font-medium uppercase tracking-widest">
                      Select items to begin neural fitting process
                    </p>
                  </div>
                ) : (
                  <div className="grid flex-1 items-start gap-3 lg:grid-cols-2">
                    {/* Selected Items Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {selectedItems.map((item) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={item.id}
                          className="bg-bg-surface2 border-border-subtle hover:border-accent-primary/30 group relative aspect-[3/4] overflow-hidden rounded-xl border shadow-sm transition-all duration-500"
                        >
                          <Image
                            src={item.images?.[0]?.url || (item as any).image}
                            alt={item.name}
                            fill
                            className="object-contain p-4 drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute right-4 top-4 flex gap-2">
                            <button
                              onClick={() => removeFromLook(item.id)}
                              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-rose-500 opacity-0 backdrop-blur-sm transition-all hover:bg-rose-500 hover:text-white group-hover:opacity-100"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="absolute bottom-4 left-6 right-6 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                            <p className="text-accent-primary mb-0.5 text-[8px] font-black uppercase">
                              {item.brand}
                            </p>
                            <h4 className="truncate text-[10px] font-black uppercase leading-tight tracking-tight">
                              {item.name}
                            </h4>
                          </div>
                        </motion.div>
                      ))}

                      <button
                        className="border-border-subtle text-text-muted hover:border-accent-primary/20 hover:text-accent-primary/40 group flex aspect-[3/4] flex-col items-center justify-center rounded-xl border-4 border-dashed transition-all"
                        onClick={() =>
                          toast({
                            title: 'Continue exploring',
                            description: 'Select more items from the catalog.',
                          })
                        }
                      >
                        <Plus className="mb-2 h-8 w-8 transition-transform group-hover:scale-110" />
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          Add SKU
                        </span>
                      </button>
                    </div>

                    {/* AI Preview Area */}
                    <div className="sticky top-0 h-full">
                      <div className="bg-text-primary group/preview relative aspect-[3/4] overflow-hidden rounded-[3.5rem] border-8 border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
                        {/* 1. Loading State */}
                        {renderStatus === 'processing' && (
                          <div className="bg-text-primary absolute inset-0 z-[30] flex flex-col items-center justify-center p-4 text-center">
                            <div className="flex flex-col items-center space-y-4">
                              <div className="relative">
                                <Loader2 className="text-accent-primary h-24 w-24 animate-spin" />
                                <Activity className="text-accent-primary absolute inset-0 m-auto h-8 w-8 animate-pulse" />
                              </div>
                              <div className="space-y-3">
                                <p className="animate-pulse text-[10px] font-black uppercase tracking-[0.4em] text-white">
                                  Neural Fusion v5.2
                                </p>
                                <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
                                  <motion.div
                                    className="bg-accent-primary h-full"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 4.5, ease: 'linear' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. Success State (The Image) */}
                        {renderStatus === 'success' && generatedLookUrl && (
                          <motion.div
                            key={generatedLookUrl}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-text-primary absolute inset-0 z-[100]"
                            style={{
                              backgroundImage: `url(${generatedLookUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                            }}
                          >
                            {/* Technical Overlays (Always on top) */}
                            <div className="pointer-events-none absolute inset-0 z-[110]">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />

                              <div className="absolute left-8 top-4 flex flex-col gap-2">
                                <Badge className="bg-accent-primary border-none px-3 py-1 text-[8px] font-black uppercase text-white shadow-xl">
                                  STABLE DIFFUSION v5.2
                                </Badge>
                                <Badge className="border-none bg-white/20 px-3 py-1 text-[8px] font-black uppercase text-white backdrop-blur-md">
                                  STYLE: {generationStyle.toUpperCase()}
                                </Badge>
                                <Badge className="border-none bg-emerald-500/80 px-3 py-1 text-[8px] font-black uppercase text-white backdrop-blur-md">
                                  CONFIDENCE: {renderQuality}%
                                </Badge>
                              </div>

                              <div className="pointer-events-auto absolute bottom-10 left-10 right-10 flex items-end justify-between">
                                <div className="space-y-4">
                                  <div className="flex flex-col gap-1">
                                    <p className="text-accent-primary text-[10px] font-black uppercase italic tracking-widest">
                                      Neural Fusion Result
                                    </p>
                                    <h4 className="text-base font-black uppercase italic tracking-tighter text-white">
                                      Professional Shoot
                                    </h4>
                                  </div>
                                  <div className="flex -space-x-3">
                                    {selectedItems.map((item, i) => (
                                      <div
                                        key={i}
                                        className="border-text-primary relative h-12 w-12 overflow-hidden rounded-full border-2 bg-white shadow-2xl"
                                      >
                                        <img
                                          src={item.images?.[0]?.url || (item as any).image}
                                          alt={item.name}
                                          className="h-full w-full object-contain p-2"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRenderStatus('idle');
                                    setGeneratedLookUrl(null);
                                  }}
                                  className="text-text-primary hover:bg-accent-primary h-12 rounded-2xl bg-white px-8 text-[9px] font-black uppercase shadow-2xl transition-all hover:text-white"
                                >
                                  <RefreshCcw className="mr-2 h-3 w-3" /> Reset Pipeline
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* 3. Idle State */}
                        {renderStatus === 'idle' && (
                          <div className="absolute inset-0 z-[10] flex flex-col items-center justify-center p-4 text-center text-white/20">
                            <div className="space-y-6">
                              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform duration-700 group-hover/preview:scale-110">
                                <Sparkles className="h-12 w-12 text-white/20" />
                              </div>
                              <h3 className="text-base font-black uppercase italic tracking-tight text-white">
                                Ready for <br /> Fusion
                              </h3>
                              <p className="mx-auto max-w-[200px] text-[8px] font-bold uppercase leading-relaxed tracking-widest text-white/30">
                                Click "Запустить рендеринг" to start neural processing
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Advisor Bottom Bar */}
            <Card className="to-text-primary group relative overflow-hidden rounded-xl border-none bg-gradient-to-r from-indigo-900 p-4 text-white shadow-2xl">
              <Brain className="absolute -right-4 -top-4 h-32 w-32 text-white opacity-[0.03] transition-transform duration-700 group-hover:scale-110" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-md">
                  <Palette className="text-accent-primary h-10 w-10" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge className="border-none bg-emerald-500 text-[8px] font-black uppercase text-white">
                      Composition Perfect
                    </Badge>
                    <p className="text-accent-primary text-[10px] font-black uppercase italic tracking-widest">
                      Stylist v4.2 Analysis
                    </p>
                  </div>
                  <h4 className="text-base font-black uppercase italic tracking-tight">
                    {selectedItems.length === 0 ? 'Ready for Analysis' : 'Balanced Aesthetics'}
                  </h4>
                  <p className="text-text-muted max-w-2xl text-xs font-medium leading-relaxed">
                    {selectedItems.length === 0
                      ? 'Добавьте вещи, чтобы наш алгоритм проанализировал цветовую гармонию, сочетаемость текстур и актуальность силуэта.'
                      : "Выбранная комбинация демонстрирует высокую степень цветовой гармонии (94%). Рекомендуем использовать 'Street Style' рендеринг для подчеркивания текстур ткани."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
