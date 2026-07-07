'use client';

import React, { useState, useMemo, useEffect, forwardRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  Heart,
  Scale,
  Search,
  ShoppingCart,
  Leaf,
  Sparkles,
  View,
  Star,
  Share2,
  Bot,
  Bell,
  X,
  Minus,
  Plus,
  PlusCircle,
  Repeat,
  Edit2,
  AlertCircle,
  Clock,
  Check,
  Droplets,
  Info,
  Truck,
  Undo2,
  Shirt,
  PlayCircle,
  Instagram,
  Send,
  Youtube,
  Calendar,
  Users,
  Percent,
  Newspaper,
  Building,
  Briefcase,
  Handshake,
  Mail,
  MapPin,
  Globe,
  Phone,
  Palette,
  Trello,
} from 'lucide-react';
import { useUIState } from '@/providers/ui-state';
import type {
  Product,
  WishlistCollection,
  ColorInfo,
  SizeAvailabilityStatus,
  ProductReview,
  CartItem,
  Brand,
} from '@/lib/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { QuickViewDialog } from '@/components/quick-view-dialog';
import { Separator } from '@/components/ui/separator';
import { SimilarProductsDialog } from '@/components/similar-products-dialog';
import { WardrobeCompatibilityDialog } from '@/components/wardrobe/wardrobe-compatibility-dialog';
import { SizeGuideDialog } from '@/components/size-guide-dialog';
import Product3dViewer from '@/components/product-3d-viewer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ProductImageViewer } from '@/components/product-image-viewer';
import { NotifyMeDialog } from '@/components/notify-me-dialog';
import { UnsubscribeDialog } from '@/components/unsubscribe-dialog';
import { ManageCartItemDialog } from '@/components/manage-cart-item-dialog';
import { BestsellerRankingDialog } from '@/components/bestseller-ranking-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { CommunityLooksPreview } from '@/components/community-looks-preview';
import { ArViewerDialog } from '@/components/ar-viewer';
import PriceComparisonTable from '@/components/price-comparison-table';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import ProductCard from '@/components/product-card';
import { products } from '@/lib/products';
import { ProductReviewsDialog } from '@/components/product-reviews-dialog';
import { UIStateProvider } from '@/providers/ui-state';
import { Skeleton } from '@/components/ui/skeleton';
import { brands } from '@/lib/placeholder-data';
import BrandCard from '@/components/brand-card';
import BrandListItem from '@/components/brand-list-item';
import BrandProfilePage from '@/app/b/[brandId]/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';

function parseComposition(composition: any): { material: string; percentage: number }[] {
  if (Array.isArray(composition)) {
    return composition as { material: string; percentage: number }[];
  }
  if (typeof composition === 'string') {
    const parts = composition.match(/(\\d+%)\\s*([^,]+)/g);
    if (parts) {
      return parts
        .map((part) => {
          const match = part.match(/(\\d+)%\\s*(.*)/);
          if (match) {
            return { percentage: parseInt(match[1], 10), material: match[2].trim() };
          }
          return { material: part, percentage: 0 };
        })
        .filter((p) => p.material);
    }
    return [{ material: composition, percentage: 100 }];
  }
  return [];
}

const GridPreview = ({
  settings,
  product,
  onQuickViewClick,
}: {
  settings: Record<string, boolean>;
  product: any;
  onQuickViewClick: () => void;
}) => {
  const { toast } = useToast();
  const [activeColor, setActiveColor] = useState(product.availableColors[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [isLiked, setIsLiked] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const colorImage = product.images.find((img: any) => img.colorName === activeColor.name);
    setActiveImage(colorImage?.url || product.image || null);
    setSelectedSize(undefined);
  }, [activeColor, product.image, product.images]);

  const handleAddToCart = () => {
    if (selectedSize) {
      toast({
        title: 'Добавлено в корзину (симуляция)',
        description: `${product.name} (${activeColor.name}, ${selectedSize})`,
      });
    }
  };

  return (
    <TooltipProvider>
      <Card className="group flex h-full flex-col overflow-hidden bg-card shadow-xl transition-shadow duration-300 ease-in-out">
        {settings.image && (
          <AspectRatio ratio={4 / 5} className="relative overflow-hidden bg-muted">
            {activeImage && (
              <Image
                src={activeImage}
                alt="Пример товара"
                fill
                className="object-cover"
                sizes="300px"
              />
            )}
            <div className="absolute right-2 top-2 z-10 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {settings.wishlist_button && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 bg-background/50 backdrop-blur-sm"
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={cn('h-4 w-4', isLiked && 'fill-red-500 text-red-500')} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>В избранное</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {settings.compare_button && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 bg-background/50 backdrop-blur-sm"
                    >
                      <Scale className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Сравнить</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {settings.share_button && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 bg-background/50 backdrop-blur-sm"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Поделиться</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="absolute left-2 top-2 flex flex-col items-start gap-2">
              {settings.old_price && settings.discount_badge && (
                <Badge variant="destructive">-{product.discount}</Badge>
              )}
              {settings.promo_badge && (
                <Badge variant="default" className="bg-accent text-accent-foreground">
                  Промо
                </Badge>
              )}
            </div>
            <div className="absolute bottom-2 right-2 z-10 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {settings.quick_view_button && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="h-8 bg-background/80 text-foreground shadow-md backdrop-blur-sm hover:bg-background"
                      onClick={onQuickViewClick}
                    >
                      <Search className="mr-2 h-4 w-4" /> Быстрый просмотр
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Быстрый просмотр</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </AspectRatio>
        )}
        <CardContent className="flex flex-grow flex-col p-4">
          <div className="min-h-[60px] flex-grow">
            {settings.brand && (
              <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>
            )}
            {settings.product_name && (
              <h3 className="mt-1 text-base font-semibold leading-tight">{product.name}</h3>
            )}
          </div>
          {settings.color_swatches && (
            <div className="mt-2 flex items-center gap-2">
              {product.availableColors.map((color: any) => (
                <Tooltip key={color.hex}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        'h-5 w-5 rounded-full border-2',
                        activeColor.hex === color.hex
                          ? 'border-primary ring-2 ring-primary ring-offset-1'
                          : 'border-border/50'
                      )}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => {
                        setActiveColor(color);
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
          {settings.size_selector && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => {
                  const sizeInfo = activeColor.sizeAvailability.find((s: any) => s.size === size);
                  const isAvailable =
                    sizeInfo && sizeInfo.status === 'in_stock' && sizeInfo.quantity > 0;
                  const isSelected = selectedSize === size;
                  return (
                    <Button
                      key={size}
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      className={cn(
                        'h-8 w-12',
                        !isAvailable && 'text-muted-foreground line-through'
                      )}
                      onClick={() =>
                        isAvailable && setSelectedSize((s) => (s === size ? undefined : size))
                      }
                      disabled={!isAvailable}
                    >
                      {size}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
          {settings.price && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-semibold">{product.price}</p>
                {settings.old_price && (
                  <p className="text-sm text-muted-foreground line-through">{product.oldPrice}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        {settings.add_to_cart_button && (
          <CardFooter className="p-4 pt-0">
            <Button className="w-full" disabled={!selectedSize} onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Добавить в корзину
            </Button>
          </CardFooter>
        )}
      </Card>
    </TooltipProvider>
  );
};

const ListPreview = ({
  settings,
  product,
}: {
  settings: Record<string, boolean>;
  product: any;
}) => {
  return (
    <Card className="group w-full overflow-hidden bg-card transition-shadow duration-300 ease-in-out hover:shadow-2xl">
      <div className="flex">
        {settings.image && (
          <div className="relative aspect-[3/4] w-1/4 bg-muted">
            <Image
              src={product.image}
              alt="Пример товара"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 15vw"
            />
            <div className="absolute left-2 top-2 flex flex-col items-start gap-2">
              {settings.old_price && settings.discount_badge && (
                <Badge variant="destructive">-{product.discount}</Badge>
              )}
              {settings.promo_badge && (
                <Badge variant="default" className="bg-accent text-accent-foreground">
                  Промо
                </Badge>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between">
            <div>
              {settings.brand && (
                <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
              )}
              {settings.product_name && (
                <h3 className="mt-1 font-headline text-base leading-tight transition-colors hover:text-accent">
                  {product.name}
                </h3>
              )}
              {settings.rating && (
                <div className="mt-2 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                      )}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground">(124)</span>
                </div>
              )}
            </div>
            <div className="text-right">
              {settings.price && <p className="text-sm font-semibold">{product.price}</p>}
              {settings.old_price && (
                <p className="text-sm text-muted-foreground line-through">{product.oldPrice}</p>
              )}
            </div>
          </div>
          {settings.description && (
            <p className="mt-2 line-clamp-2 max-w-prose flex-grow text-sm text-muted-foreground">
              {product.description}
            </p>
          )}
          {settings.ai_stylist_recommendation && (
            <p className="mt-2 flex items-center gap-1.5 text-xs italic text-muted-foreground">
              <Bot className="h-3 w-3" />
              Сочетается с джинсами и белыми кедами
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {settings.sustainability_badge && (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs font-normal">
                <Leaf className="h-3 w-3" />
                {product.sustainability}
              </Badge>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              {settings.color_swatches && (
                <div className="flex items-center gap-2">
                  {product.availableColors.map((color: any) => (
                    <span
                      key={color.hex}
                      className="h-5 w-5 rounded-full border"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    ></span>
                  ))}
                </div>
              )}
              {settings.available_sizes && (
                <div className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                  Размеры: {product.sizes.join(', ')}
                </div>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {settings.wishlist_button && (
                <Button size="sm" variant="ghost">
                  <Heart className="h-5 w-5" />
                </Button>
              )}
              {settings.compare_button && (
                <Button size="sm" variant="ghost">
                  <Scale className="h-5 w-5" />
                </Button>
              )}
              {settings.add_to_cart_button && (
                <Button size="sm">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Добавить
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const RecommendedProducts = ({ productId }: { productId: string }) => {
  const [recommendedItems, setRecommendedItems] = React.useState<Product[]>([]);

  React.useEffect(() => {
    // In a real app, this would be an API call to a recommendation engine
    setRecommendedItems(products.slice(10, 13));
  }, [productId]);

  if (recommendedItems.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-accent" />
          AI-стилист: с чем носить
        </h4>
        <p className="mb-4 text-xs text-muted-foreground">
          Наши алгоритмы подобрали товары, которые идеально дополнят ваш образ.
        </p>
        <Carousel opts={{ align: 'start' }} className="w-full">
          <CarouselContent className="-ml-2">
            {recommendedItems.map((item) => (
              <CarouselItem key={item.id} className="basis-1/2 pl-2">
                <div className="flex flex-col gap-2">
                  <ProductCard product={item} viewMode="grid" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </CardContent>
    </Card>
  );
};

const DetailPreview = forwardRef<
  HTMLDivElement,
  { settings: Record<string, boolean>; product: any }
>(({ settings, product: mockProduct }, ref) => {
  // This is a stripped-down version of the actual ProductPageContent for preview purposes.
  // It uses the same mock data and logic where possible.
  const { toast } = useToast();
  const {
    user,
    addCartItem,
    getCartItem,
    wishlist,
    wishlistCollections,
    addWishlistCollection,
    addWishlistItem,
    removeWishlistItem,
    subscribedSizes,
    addSubscribedSize,
    removeSubscribedSize,
    availableSubscriptions,
    removeAvailableSubscription,
    newlyAvailableSizes,
    toggleComparisonItem,
    updateCartItemQuantity,
    getProductAvailability,
    activeColorSelection,
    setActiveColorSelection,
  } = useUIState();

  const product: Product = {
    id: '1',
    slug: 'mock-product',
    name: mockProduct.name,
    brand: mockProduct.brand,
    price: 24500,
    originalPrice: 35000,
    outlet: true,
    description: mockProduct.description,
    images: mockProduct.images,
    category: 'Трикотаж',
    subcategory: 'Свитера',
    sku: mockProduct.sku,
    color: 'mock',
    season: 'mock',
    sustainability: ['Переработанные материалы'],
    wardrobeCompatibility: { score: 75, comment: '' },
    sizes: mockProduct.sizes.map((s: string) => ({ name: s })),
    availableColors: mockProduct.availableColors,
    rating: 4.5,
    reviewCount: 124,
    bestsellerRank: 3,
    hasAR: true,
    composition: '80% Кашемир, 20% Шелк',
  };

  const activeColor = React.useMemo(() => {
    const selection =
      activeColorSelection?.productId === product.id ? activeColorSelection.colorName : undefined;
    const color = product.availableColors?.find((c) => c.name === selection);
    return color || product.availableColors?.[0];
  }, [product, activeColorSelection]);

  const imagesForCurrentColor = React.useMemo(() => {
    if (!activeColor || !product.images) return product.images;
    const colorImages = mockProduct.images.filter((img: any) => img.colorName === activeColor.name);
    return colorImages.length > 0
      ? colorImages.map((img: any) => ({ ...img, url: img.url, alt: img.alt }))
      : mockProduct.images.map((img: any) => ({ ...img, url: img.url, alt: img.alt }));
  }, [activeColor, mockProduct.images, product.images]);

  const [activeImage, setActiveImage] = useState(imagesForCurrentColor[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isSimilarProductsOpen, setIsSimilarProductsOpen] = useState(false);
  const [isCompatibilityOpen, setIsCompatibilityOpen] = useState(false);
  const [isBestsellerOpen, setIsBestsellerOpen] = useState(false);
  const [is3dOpen, setIs3dOpen] = useState(false);
  const [isArOpen, setIsArOpen] = useState(false);
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [priceDisplayMode, setPriceDisplayMode] = useState<'plan' | 'bonus'>('plan');
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageViewerStartIndex, setImageViewerStartIndex] = useState(0);

  const [notifyDialogSize, setNotifyDialogSize] = useState<string | null>(null);
  const [manageCartItem, setManageCartItem] = useState<ReturnType<typeof getCartItem>>(undefined);
  const [unsubscribeDialogSize, setUnsubscribeDialogSize] = useState<string | null>(null);
  const [notifyDialogMode, setNotifyDialogMode] = useState<'subscribe' | 'pre_order'>('subscribe');
  const [notifyDialogPreOrderDate, setNotifyDialogPreOrderDate] = useState<string | undefined>(
    undefined
  );

  React.useEffect(() => {
    setActiveImage(imagesForCurrentColor[0]);
    setSelectedSize(undefined); // Reset size on color change
  }, [imagesForCurrentColor]);

  const isInWishlist = React.useMemo(
    () => wishlist.some((item) => item.id === product.id),
    [product.id, wishlist]
  );

  const handleAddToCart = () => {
    const allSizes = product.sizes?.map((s) => s.name) || [];
    const sizeToAdd = allSizes.length > 0 ? selectedSize : 'One Size';

    if (!sizeToAdd) {
      toast({
        variant: 'destructive',
        title: 'Размер не выбран',
        description: 'Пожалуйста, выберите размер.',
      });
      return;
    }

    addCartItem(product, sizeToAdd, quantity);
    toast({
      title: 'Товар добавлен в корзину',
      description: `${product.name} (Размер: ${sizeToAdd}, ${quantity} шт.) теперь в вашей корзине.`,
    });
  };

  const handleSelectSize = (sizeName: string) => {
    const allSizes = product.sizes?.map((s) => s.name) || [];
    if (allSizes.length === 0) return;

    const isNowAvailable = availableSubscriptions.some(
      (s) => s.productId === product.id && s.size === sizeName
    );
    if (isNowAvailable) {
      removeAvailableSubscription(product.id, sizeName);
      toast({
        title: 'Уведомление просмотрено',
        description: `Размер ${sizeName} снова в наличии!`,
      });
    }

    const isNewlyAvailable = newlyAvailableSizes.some(
      (s) => s.productId === product.id && s.size === sizeName
    );
    const sizeInfo = activeColor?.sizeAvailability?.find((s) => s.size === sizeName);
    const isAvailable =
      (sizeInfo?.status === 'in_stock' && (sizeInfo.quantity || 0) > 0) || isNewlyAvailable;
    const isPreOrder = sizeInfo?.status === 'pre_order';

    const cartItem = getCartItem(product.id, sizeName);
    if (cartItem) {
      setManageCartItem(cartItem);
      return;
    }

    const isSubscribed = subscribedSizes.some(
      (s) => s.productId === product.id && s.size === sizeName
    );
    if (isSubscribed) {
      setUnsubscribeDialogSize(sizeName);
      return;
    }

    if (!isAvailable) {
      setNotifyDialogSize(sizeName);
      if (isPreOrder) {
        setNotifyDialogMode('pre_order');
        setNotifyDialogPreOrderDate(sizeInfo?.preOrderDate);
      } else {
        setNotifyDialogMode('subscribe');
        setNotifyDialogPreOrderDate(undefined);
      }
      return;
    }

    setSelectedSize((current) => {
      const newSize = current === sizeName ? undefined : sizeName;
      if (newSize) {
        setQuantity(1);
      }
      return newSize;
    });
  };

  const colorInfo = activeColor;
  const sizeInfo = colorInfo?.sizeAvailability?.find((s) => s.size === selectedSize);
  const maxQuantity = sizeInfo?.status === 'in_stock' ? sizeInfo.quantity : undefined;

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) {
        setSelectedSize(undefined); // Unselect size if quantity is 0
        return 1;
      }
      if (maxQuantity !== undefined && newQuantity > maxQuantity) return maxQuantity;
      return newQuantity;
    });
  };

  const handleToggleWishlist = (collectionId: string) => {
    addWishlistItem(product, collectionId);
    const collectionName = wishlistCollections.find((c) => c.id === collectionId)?.name || '';
    toast({
      title: 'Добавлено в избранное',
      description: `${product.name} добавлено в "${collectionName}"`,
    });
  };

  const handleCreateNewCollection = async () => {
    if (newCollectionName.trim() === '') return;
    const newCollection = await addWishlistCollection(newCollectionName);
    addWishlistItem(product, newCollection.id);
    toast({
      title: 'Подборка создана',
      description: `Товар добавлен в новую подборку "${newCollectionName}"`,
    });
    setIsNewCollectionOpen(false);
    setNewCollectionName('');
  };

  const handleTogglePriceDisplay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPriceDisplayMode((prev) => (prev === 'plan' ? 'bonus' : 'plan'));
  };

  const allSizes = mockProduct.sizes;
  const isInCart = selectedSize ? !!getCartItem(product.id, selectedSize) : false;

  const { cashbackAmount, priceWithBonuses, bonusToUse } = React.useMemo(() => {
    if (!user || product.outlet) {
      return { cashbackAmount: 0, priceWithBonuses: null, bonusToUse: 0 };
    }

    const planDetails = {
      base: { cashback: 0, bonusLimit: 0.1 },
      start: { cashback: 0.03, bonusLimit: 0.2 },
      comfort: { cashback: 0.07, bonusLimit: 0.3 },
      premium: { cashback: 0.1, bonusLimit: 0.4 },
    };

    const plan = (user.loyaltyPlan || 'base') as keyof typeof planDetails;
    const tier = planDetails[plan];
    const cashback = product.price * tier.cashback;
    const maxBonusToUse = product.price * tier.bonusLimit;
    const bonusToUse = Math.min(user.loyaltyPoints || 0, maxBonusToUse);
    const finalPrice = product.price - bonusToUse;

    return {
      cashbackAmount: Math.round(cashback),
      priceWithBonuses: Math.round(finalPrice),
      bonusToUse: Math.round(bonusToUse),
    };
  }, [user, product, priceDisplayMode]);

  const availability = getProductAvailability(product, activeColor);

  const handleOpenImageViewer = (index: number) => {
    setImageViewerStartIndex(index);
    setIsImageViewerOpen(true);
  };

  const composition = React.useMemo(
    () => parseComposition(product.composition),
    [product.composition]
  );

  const details = [
    { label: 'Артикул', value: product.sku, condition: settings.sku },
    { label: 'Сезон', value: product.season, condition: true },
    {
      label: 'Состав',
      value: composition.map((c) => `${c.material} ${c.percentage}%`).join(', ') || 'не указан',
      condition: settings.composition,
    },
    { label: 'Уход', value: 'Только ручная стирка', condition: settings.care_info },
  ];

  const handleConfirmSubscription = () => {
    if (notifyDialogSize) {
      if (notifyDialogMode === 'subscribe') {
        addSubscribedSize(product.id, notifyDialogSize);
        toast({
          title: `Вы подписались на размер ${notifyDialogSize}`,
          description: 'Мы сообщим, когда он появится в наличии.',
        });
      } else {
        // pre_order
        toast({
          title: 'Предзаказ оформлен',
          description: `Мы сообщим, когда ${product.name} размера ${notifyDialogSize} поступит в продажу.`,
        });
      }
      setNotifyDialogSize(null);
    }
  };

  const handleConfirmUnsubscribe = () => {
    if (unsubscribeDialogSize) {
      removeSubscribedSize(product.id, unsubscribeDialogSize);
      toast({
        title: 'Подписка отменена',
        description: `Вы больше не будете получать уведомления о поступлении размера ${unsubscribeDialogSize}.`,
      });
      setUnsubscribeDialogSize(null);
    }
  };

  return (
    <>
      <div className="grid gap-3 p-4 md:grid-cols-2 md:p-4 lg:gap-3" ref={ref}>
        {/* Image Gallery */}
        {settings.image && (
          <div className="flex flex-col gap-3">
            <div
              className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-lg border"
              onClick={() =>
                handleOpenImageViewer(
                  imagesForCurrentColor.findIndex(
                    (img: { id: string }) => img.id === activeImage.id
                  )
                )
              }
            >
              <Image
                src={activeImage?.url || imagesForCurrentColor[0].url}
                alt={activeImage?.alt || ''}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute left-3 top-3 flex items-center gap-2">
                {settings.promo_badge && product.isPromoted && (
                  <Badge variant="default" className="bg-accent text-sm text-accent-foreground">
                    Промо
                  </Badge>
                )}
                {settings.discount_badge && product.outlet && product.originalPrice && (
                  <Badge variant="destructive">
                    -
                    {(
                      ((product.originalPrice - product.price) / product.originalPrice) *
                      100
                    ).toFixed(0)}
                    %
                  </Badge>
                )}
              </div>
              {settings.bestseller_rank && product.bestsellerRank && (
                <Badge
                  variant="destructive"
                  className="absolute right-3 top-3 cursor-pointer text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBestsellerOpen(true);
                  }}
                >
                  #{product.bestsellerRank} в категории
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {imagesForCurrentColor.map((image: { id: string; url: string; alt: string }) => (
                <div
                  key={image.id}
                  className={cn(
                    'relative aspect-square w-full cursor-pointer overflow-hidden rounded-md border-2',
                    activeImage.id === image.id ? 'border-primary' : 'border-transparent'
                  )}
                  onClick={() => setActiveImage(image)}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Product Info */}
        <div className="py-4">
          {settings.brand && <p className="font-medium text-muted-foreground">{product.brand}</p>}
          {settings.product_name && (
            <h1 className="mt-1 font-headline text-base font-bold lg:text-sm">{product.name}</h1>
          )}

          {settings.rating && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-5 w-5',
                      i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
              <button
                className="text-sm text-muted-foreground underline hover:text-primary"
                onClick={() => setIsReviewsOpen(true)}
              >
                ({product.reviewCount} отзывов)
              </button>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              {settings.price && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="cursor-pointer text-base font-bold text-primary">
                        {product.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </TooltipTrigger>
                    {cashbackAmount > 0 && (
                      <TooltipContent>
                        <p>Начислим {cashbackAmount.toLocaleString('ru-RU')} кэшбэк-бонусов</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
              {settings.old_price && product.outlet && product.originalPrice && (
                <p className="text-base text-muted-foreground line-through">
                  {product.originalPrice.toLocaleString('ru-RU')} ₽
                </p>
              )}
            </div>

            {priceWithBonuses !== null && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-green-600">
                      <span>
                        {priceDisplayMode === 'plan'
                          ? `+ ${cashbackAmount.toLocaleString('ru-RU')} Б`
                          : `${priceWithBonuses.toLocaleString('ru-RU')} ₽`}
                      </span>
                      <button
                        onClick={handleTogglePriceDisplay}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Repeat className="h-4 w-4" />
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {priceDisplayMode === 'plan'
                        ? `Начислим ${cashbackAmount.toLocaleString('ru-RU')} кэшбэк-бонусов по вашему тарифу "${user?.loyaltyPlan}"`
                        : `Цена при списании ${bonusToUse.toLocaleString('ru-RU')} бонусов.`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {settings.availability_status && (
              <div className="flex items-center gap-2">
                <availability.icon className={cn('h-4 w-4', availability.className)} />
                <span className="text-sm font-medium">{availability.text}</span>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {settings.color_swatches &&
            product.availableColors &&
            product.availableColors.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Цвет: <span className="font-semibold text-foreground">{activeColor?.name}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color) => (
                    <TooltipProvider key={color.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              'h-8 w-8 rounded-full border-2',
                              activeColor?.id === color.id
                                ? 'border-primary ring-2 ring-primary ring-offset-2'
                                : 'border-border/50'
                            )}
                            style={{ backgroundColor: color.hex }}
                            onClick={() =>
                              setActiveColorSelection({
                                productId: product.id,
                                colorName: color.name,
                              })
                            }
                            aria-label={`Выбрать цвет ${color.name}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{color.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )}

          {settings.size_selector && allSizes.length > 0 && (
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Выберите размер</h3>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setIsSizeGuideOpen(true)}
                >
                  AI Гид по размерам
                </Button>
              </div>
              <TooltipProvider>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((sizeName: string) => {
                    const isNewlyAvailable = newlyAvailableSizes.some(
                      (s) => s.productId === product.id && s.size === sizeName
                    );
                    const isNowAvailable = availableSubscriptions.some(
                      (s) => s.productId === product.id && s.size === sizeName
                    );
                    const sizeInfo = activeColor?.sizeAvailability?.find(
                      (s) => s.size === sizeName
                    );
                    const isAvailable =
                      (sizeInfo?.status === 'in_stock' && (sizeInfo.quantity || 0) > 0) ||
                      isNewlyAvailable;
                    const isPreOrder = sizeInfo?.status === 'pre_order';

                    const isSelected = selectedSize === sizeName;
                    const cartItem = getCartItem(product.id, sizeName);
                    const isSubscribed = subscribedSizes.some(
                      (s) => s.productId === product.id && s.size === sizeName
                    );

                    return (
                      <Tooltip key={sizeName}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isSelected || !!cartItem ? 'default' : 'outline'}
                            className={cn(
                              'relative h-10 w-12',
                              !isAvailable &&
                                !cartItem &&
                                !isNowAvailable &&
                                !isPreOrder &&
                                product.availability !== 'coming_soon' &&
                                'text-muted-foreground/50 line-through decoration-muted-foreground/50',
                              isSubscribed &&
                                'border-green-300 bg-green-100 text-green-800 hover:bg-green-200',
                              isNowAvailable &&
                                !isSelected &&
                                'animate-pulse border-blue-300 bg-blue-100 text-blue-800'
                            )}
                            onClick={() => handleSelectSize(sizeName)}
                            disabled={
                              !isAvailable &&
                              !cartItem &&
                              !isNowAvailable &&
                              !isPreOrder &&
                              product.availability !== 'coming_soon'
                            }
                          >
                            {cartItem && (
                              <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                {cartItem.quantity}
                              </div>
                            )}
                            {isSubscribed && (
                              <Bell className="absolute -right-1.5 -top-1.5 h-4 w-4 text-green-700" />
                            )}
                            {isNowAvailable && !isSelected && (
                              <Check className="absolute -right-1.5 -top-1.5 h-4 w-4 text-blue-700" />
                            )}
                            {sizeName}
                          </Button>
                        </TooltipTrigger>
                        {!isAvailable && !cartItem && !isPreOrder && (
                          <TooltipContent>
                            <p>Сообщить о поступлении</p>
                          </TooltipContent>
                        )}
                        {isPreOrder && !cartItem && (
                          <TooltipContent>
                            <p>Оформить предзаказ</p>
                          </TooltipContent>
                        )}
                        {isSubscribed && (
                          <TooltipContent>
                            <p>Отказаться от ожидания</p>
                          </TooltipContent>
                        )}
                        {isNowAvailable && (
                          <TooltipContent>
                            <p>Товар снова в наличии!</p>
                          </TooltipContent>
                        )}
                        {cartItem && (
                          <TooltipContent>
                            <p>Изменить количество в корзине</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>
          )}

          <div className="mt-6 space-y-4 border-t pt-6 text-sm text-muted-foreground">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {details
                .filter((d) => d.condition && d.value)
                .map((detail) => (
                  <React.Fragment key={detail.label}>
                    <div className="font-medium text-foreground">{detail.label}</div>
                    <div>{detail.value}</div>
                  </React.Fragment>
                ))}
            </div>
          </div>

          {settings.wardrobe_compatibility && product.wardrobeCompatibility && (
            <Button
              variant="link"
              className="mt-2 text-muted-foreground"
              onClick={() => setIsCompatibilityOpen(true)}
            >
              Совместимость с гардеробом: {product.wardrobeCompatibility.score}%
            </Button>
          )}

          {settings.add_to_cart_button && (
            <div className="mt-8 flex items-center gap-2">
              {selectedSize ? (
                <>
                  <div className="flex items-center gap-1 rounded-md border p-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleQuantityChange(-1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      readOnly
                      value={quantity}
                      className="h-9 w-12 border-none p-0 text-center font-bold focus-visible:ring-0"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleQuantityChange(1)}
                      disabled={maxQuantity !== undefined && quantity >= maxQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Добавить
                  </Button>
                </>
              ) : (
                <Button size="lg" className="flex-1" disabled={allSizes.length > 0}>
                  Выберите размер
                </Button>
              )}
              {settings.wishlist_button && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-11 w-11"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <Heart
                        className={cn('h-5 w-5', isInWishlist && 'fill-current text-red-500')}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-1">
                    <div className="space-y-1">
                      <p className="p-2 text-sm font-semibold">Добавить в избранное</p>
                      {wishlistCollections.map((c) => (
                        <Button
                          key={c.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleToggleWishlist(c.id)}
                        >
                          {c.name}
                        </Button>
                      ))}
                      <Button
                        variant="secondary"
                        className="mt-1 w-full justify-start"
                        onClick={() => setIsNewCollectionOpen(true)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Новая подборка
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              {settings.compare_button && (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-11 w-11"
                  onClick={() => toggleComparisonItem(product)}
                >
                  <Scale className="h-5 w-5" />
                </Button>
              )}
              {settings.share_button && (
                <Button size="icon" variant="outline" className="h-11 w-11">
                  <Share2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {settings['3d_viewer_button'] && product.hasAR && (
              <Button size="lg" variant="outline" onClick={() => setIs3dOpen(true)}>
                <View className="mr-2 h-5 w-5 text-accent" /> Просмотр в 3D
              </Button>
            )}
            {settings.ar_button && product.hasAR && (
              <Button size="lg" variant="outline" onClick={() => setIsArOpen(true)}>
                <Sparkles className="mr-2 h-5 w-5 text-accent" /> Digital-Примерка
              </Button>
            )}
          </div>
        </div>
      </div>

      {settings.community_looks && <CommunityLooksPreview productId={product.id} />}
      {settings.price_comparison && (
        <div className="my-16">
          <PriceComparisonTable productId={product.id} />
        </div>
      )}
      {settings.recommendations && <RecommendedProducts productId={product.id} />}
      {settings.reviews_block && (
        <div className="mt-16">
          <ProductReviewsDialog
            product={product}
            isOpen={isReviewsOpen}
            onOpenChange={setIsReviewsOpen}
          />
        </div>
      )}

      {isReviewsOpen && (
        <ProductReviewsDialog
          product={product}
          isOpen={isReviewsOpen}
          onOpenChange={setIsReviewsOpen}
        />
      )}
      {isSizeGuideOpen && (
        <SizeGuideDialog
          product={product}
          isOpen={isSizeGuideOpen}
          onOpenChange={setIsSizeGuideOpen}
        />
      )}
      {isSimilarProductsOpen && (
        <SimilarProductsDialog
          product={product}
          isOpen={isSimilarProductsOpen}
          onOpenChange={setIsSimilarProductsOpen}
        />
      )}
      {isCompatibilityOpen && (
        <WardrobeCompatibilityDialog
          product={product}
          isOpen={isCompatibilityOpen}
          onOpenChange={setIsCompatibilityOpen}
        />
      )}
      {isBestsellerOpen && (
        <BestsellerRankingDialog
          product={product}
          isOpen={isBestsellerOpen}
          onOpenChange={setIsBestsellerOpen}
        />
      )}
      {product.hasAR && is3dOpen && (
        <Product3dViewer product={product} isOpen={is3dOpen} onOpenChange={setIs3dOpen} />
      )}
      {product.hasAR && isArOpen && (
        <ArViewerDialog product={product} isOpen={isArOpen} onOpenChange={setIsArOpen} />
      )}
      <Dialog open={isNewCollectionOpen} onOpenChange={setIsNewCollectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новую подборку</DialogTitle>
            <DialogDescription>
              Введите название для вашей новой подборки в избранном.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="Например, 'Летние образы'"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCollectionOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateNewCollection}>Создать и добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ProductImageViewer
        productName={product.name}
        images={imagesForCurrentColor}
        isOpen={isImageViewerOpen}
        onOpenChange={setIsImageViewerOpen}
        startIndex={imageViewerStartIndex}
      />
      {notifyDialogSize && (
        <NotifyMeDialog
          product={product}
          size={notifyDialogSize}
          mode={notifyDialogMode}
          preOrderDate={notifyDialogPreOrderDate}
          isOpen={!!notifyDialogSize}
          onOpenChange={(open) => !open && setNotifyDialogSize(null)}
          onConfirm={handleConfirmSubscription}
        />
      )}
      {manageCartItem && (
        <ManageCartItemDialog
          product={product}
          cartItem={manageCartItem}
          isOpen={!!manageCartItem}
          onOpenChange={(open) => !open && setManageCartItem(undefined)}
          onUpdate={(quantity) => {
            if (manageCartItem) {
              updateCartItemQuantity(manageCartItem.id, quantity, manageCartItem.selectedSize);
            }
          }}
          onRemove={() => {
            // In a real app, you'd call a remove function here.
          }}
        />
      )}
      {unsubscribeDialogSize && (
        <UnsubscribeDialog
          product={product}
          size={unsubscribeDialogSize}
          isOpen={!!unsubscribeDialogSize}
          onOpenChange={(open) => !open && setUnsubscribeDialogSize(null)}
          onConfirm={handleConfirmUnsubscribe}
        />
      )}
    </>
  );
});
DetailPreview.displayName = 'DetailPreview';

export default function ProductDisplayInfoPage() {
  const [productDisplayData, setProductDisplayData] = React.useState<any | null>(null);
  const [brandDisplayData, setBrandDisplayData] = React.useState<any | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const [productDisplaySettings, setProductDisplaySettings] = React.useState<
    Record<string, Record<string, boolean>>
  >({ grid: {}, list: {}, detail: {} });
  const [brandDisplaySettings, setBrandDisplaySettings] = React.useState<
    Record<string, Record<string, boolean>>
  >({ grid: {}, list: {}, detail: {} });

  const [activePreview, setActivePreview] = useState<'grid' | 'list' | 'detail'>('detail');
  const [activeBrandPreview, setActiveBrandPreview] = useState<'grid' | 'list' | 'detail'>(
    'detail'
  );

  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [productsRes, brandsRes] = await Promise.all([
          fetch('/data/product-display-data.json'),
          fetch('/data/brand-display-data.json'),
        ]);

        const productData = (await productsRes.json()) as {
          parameters: { items: any[] }[];
        };
        setProductDisplayData(productData);

        const brandData = (await brandsRes.json()) as {
          parameters: { items: any[] }[];
        };
        setBrandDisplayData(brandData);

        const initialProductSettings: Record<string, Record<string, boolean>> = {
          grid: {},
          list: {},
          detail: {},
        };
        productData.parameters.forEach((group: any) => {
          group.items.forEach((item: any) => {
            initialProductSettings.grid[item.id] = !!item.grid;
            initialProductSettings.list[item.id] = !!item.list;
            initialProductSettings.detail[item.id] = !!item.detail;
          });
        });
        setProductDisplaySettings(initialProductSettings);

        const initialBrandSettings: Record<string, Record<string, boolean>> = {
          grid: {},
          list: {},
          detail: {},
        };
        brandData.parameters.forEach((group: any) => {
          group.items.forEach((item: any) => {
            initialBrandSettings.grid[item.id] = !!item.grid;
            initialBrandSettings.list[item.id] = !!item.list;
            initialBrandSettings.detail[item.id] = !!item.detail;
          });
        });
        setBrandDisplaySettings(initialBrandSettings);
      } catch (error) {
        console.error('Failed to fetch display data', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSettingChange = (
    type: 'product' | 'brand',
    viewId: 'grid' | 'list' | 'detail',
    paramId: string,
    checked: boolean
  ) => {
    const setSettings = type === 'product' ? setProductDisplaySettings : setBrandDisplaySettings;

    setSettings((prev) => {
      const newSettings = { ...prev };
      newSettings[viewId] = { ...newSettings[viewId], [paramId]: checked };
      if (paramId === 'old_price' && !checked) {
        newSettings[viewId].discount_badge = false;
      }
      return newSettings;
    });
  };

  const mockProduct = {
    id: '1',
    name: 'Кашемировый свитер',
    brand: 'Syntha',
    description: '',
    image: 'https://images.unsplash.com/photo-1652904875075-4534c3439c62?w=800',
    price: '24 500 ₽',
    oldPrice: '35 000 ₽',
    discount: '30%',
    sustainability: 'Переработанные материалы',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availableColors: [
      {
        id: 'color1',
        name: 'Черный',
        hex: '#000000',
        sizeAvailability: [
          { size: 'XS', status: 'in_stock', quantity: 10 },
          { size: 'S', status: 'in_stock', quantity: 5 },
          { size: 'M', status: 'out_of_stock' },
          { size: 'L', status: 'pre_order', preOrderDate: '2024-09-15' },
          { size: 'XL', status: 'out_of_stock' },
        ],
      },
      {
        id: 'color2',
        name: 'Серый',
        hex: '#808080',
        sizeAvailability: [
          { size: 'S', status: 'in_stock', quantity: 2 },
          { size: 'M', status: 'in_stock', quantity: 8 },
        ],
      },
      {
        id: 'color3',
        name: 'Бежевый',
        hex: '#F5F5DC',
        sizeAvailability: [
          { size: 'XS', status: 'in_stock', quantity: 12 },
          { size: 'S', status: 'in_stock', quantity: 15 },
          { size: 'M', status: 'in_stock', quantity: 20 },
          { size: 'L', status: 'in_stock', quantity: 10 },
          { size: 'XL', status: 'in_stock', quantity: 5 },
        ],
      },
    ],
    images: [
      {
        id: 'product-1-1',
        url: 'https://images.unsplash.com/photo-1652904875075-4534c3439c62?w=800',
        alt: 'Вязаный свитер',
        hint: 'knit sweater',
        colorName: 'Черный',
      },
      {
        id: 'product-1-2',
        url: 'https://picsum.photos/seed/prod1-2/800/1000',
        alt: 'Деталь свитера',
        hint: 'fabric detail',
        colorName: 'Черный',
      },
      {
        id: 'product-1-3',
        url: 'https://picsum.photos/seed/gray-sweater/800/1000',
        alt: 'Свитер на модели',
        hint: 'fashion model',
        colorName: 'Серый',
      },
      {
        id: 'product-1-4',
        url: 'https://picsum.photos/seed/beige-sweater/800/1000',
        alt: 'Текстура ткани',
        hint: 'sweater texture',
        colorName: 'Бежевый',
      },
    ],
  };

  const mockBrand: Brand = brands[0];
  const mockProductCount = products.filter((p) => p.brand === mockBrand.name).length;

  if (isLoading || !productDisplayData || !brandDisplayData) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6">
        <h1 className="mb-2 font-headline text-base font-bold">Структура отображения данных</h1>
        <p className="mb-8 text-muted-foreground">
          Какие параметры товара отображаются в различных представлениях.
        </p>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full animate-pulse rounded-md bg-muted" />
              <Skeleton className="h-8 w-full animate-pulse rounded-md bg-muted" />
              <Skeleton className="h-8 w-full animate-pulse rounded-md bg-muted" />
              <Skeleton className="h-8 w-full animate-pulse rounded-md bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderTable = (data: any, settings: any, type: 'product' | 'brand') => (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] font-semibold">Параметр</TableHead>
            {data.views.map((view: any) => (
              <TableHead key={view.id} className="text-center font-semibold">
                {view.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.parameters.map((group: any, groupIndex: number) => (
            <React.Fragment key={`${group.group}-${groupIndex}`}>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableCell
                  colSpan={data.views.length + 1}
                  className="font-semibold text-foreground"
                >
                  {group.group}
                </TableCell>
              </TableRow>
              {group.items.map((item: any, itemIndex: number) => (
                <TableRow key={`${groupIndex}-${item.id || itemIndex}`}>
                  <TableCell className="pl-8">
                    {item.name}
                    {item.comment && <p className="text-xs text-amber-600">{item.comment}</p>}
                  </TableCell>
                  {data.views.map((view: any) => (
                    <TableCell key={`${item.id}-${view.id}`} className="text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          id={`${type}-check-${item.id}-${view.id}`}
                          checked={!!settings[view.id]?.[item.id]}
                          onCheckedChange={(checked) =>
                            handleSettingChange(type, view.id, item.id, !!checked)
                          }
                          disabled={
                            item.disabled?.[view.id] ||
                            (item.id === 'discount_badge' && !settings[view.id]?.['old_price'])
                          }
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <UIStateProvider>
        <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4 sm:px-6">
          <header>
            <h1 className="font-headline text-base font-bold">Структура отображения данных</h1>
            <p className="text-muted-foreground">
              Настройте, какие параметры будут видны в карточках товаров и на страницах брендов.
            </p>
          </header>

          <Tabs defaultValue="products" className="w-full">
            {/* cabinetSurface v1 */}
            <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-w-0')}>
              <TabsTrigger
                value="products"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                Товары
              </TabsTrigger>
              <TabsTrigger
                value="brands"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                Бренды
              </TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Структура отображения товаров</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {renderTable(productDisplayData, productDisplaySettings, 'product')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Интерактивный предпросмотр товара</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={activePreview}
                    onValueChange={(v) => setActivePreview(v as any)}
                    className="mb-4 flex justify-center space-x-2 pt-2"
                  >
                    {productDisplayData.views.map((view: any) => (
                      <Label
                        key={view.id}
                        htmlFor={`preview-${view.id}`}
                        className={cn(
                          'flex-1 cursor-pointer rounded-md border p-2 text-center',
                          activePreview === view.id && 'bg-secondary'
                        )}
                      >
                        <RadioGroupItem
                          value={view.id}
                          id={`preview-${view.id}`}
                          className="sr-only"
                        />
                        {view.name}
                      </Label>
                    ))}
                  </RadioGroup>
                  <div className="flex items-start justify-center rounded-lg bg-secondary/30 p-4 md:p-4">
                    <div
                      className={cn(
                        'w-full transition-all duration-300',
                        activePreview === 'grid' && 'max-w-sm',
                        activePreview === 'list' && 'max-w-4xl',
                        activePreview === 'detail' && 'max-w-7xl'
                      )}
                    >
                      {activePreview === 'grid' && (
                        <GridPreview
                          settings={productDisplaySettings.grid}
                          product={mockProduct}
                          onQuickViewClick={() => setQuickViewProduct(mockProduct)}
                        />
                      )}
                      {activePreview === 'list' && (
                        <ListPreview settings={productDisplaySettings.list} product={mockProduct} />
                      )}
                      {activePreview === 'detail' && (
                        <DetailPreview
                          settings={productDisplaySettings.detail}
                          product={mockProduct}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="brands" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Структура отображения брендов</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {renderTable(brandDisplayData, brandDisplaySettings, 'brand')}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Интерактивный предпросмотр бренда</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={activeBrandPreview}
                    onValueChange={(v) => setActiveBrandPreview(v as any)}
                    className="mb-4 flex justify-center space-x-2 pt-2"
                  >
                    {brandDisplayData.views.map((view: any) => (
                      <Label
                        key={view.id}
                        htmlFor={`brand-preview-${view.id}`}
                        className={cn(
                          'flex-1 cursor-pointer rounded-md border p-2 text-center',
                          activeBrandPreview === view.id && 'bg-secondary'
                        )}
                      >
                        <RadioGroupItem
                          value={view.id}
                          id={`brand-preview-${view.id}`}
                          className="sr-only"
                        />
                        {view.name}
                      </Label>
                    ))}
                  </RadioGroup>
                  <div className="flex items-start justify-center rounded-lg bg-secondary/30 p-4 md:p-4">
                    <div
                      className={cn(
                        'w-full transition-all duration-300',
                        activeBrandPreview === 'grid' && 'max-w-sm',
                        activeBrandPreview === 'list' && 'max-w-4xl',
                        activeBrandPreview === 'detail' && 'max-w-7xl'
                      )}
                    >
                      {activeBrandPreview === 'grid' && (
                        <BrandCard
                          brand={mockBrand}
                          productCount={mockProductCount}
                          displaySettings={brandDisplaySettings.grid}
                        />
                      )}
                      {activeBrandPreview === 'list' && (
                        <BrandListItem
                          brand={mockBrand}
                          productCount={mockProductCount}
                          displaySettings={brandDisplaySettings.list}
                        />
                      )}
                      {activeBrandPreview === 'detail' && (
                        <div className="overflow-hidden rounded-lg border bg-background">
                          <BrandProfilePage
                            params={Promise.resolve({ brandId: mockBrand.slug })}
                            isPreview={true}
                            displaySettings={brandDisplaySettings.detail}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </UIStateProvider>
      <QuickViewDialog
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </>
  );
}
