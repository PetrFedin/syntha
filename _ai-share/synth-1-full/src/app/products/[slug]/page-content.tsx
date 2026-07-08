'use client';

import React, { Suspense } from 'react';
import { ProductSizeAffinityBlock } from '@/components/product/product-size-affinity-block';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Heart,
  ShoppingCart,
  Share2,
  Sparkles,
  View,
  Bell,
  Minus,
  Plus,
  Check,
  Repeat,
  Users,
  Clock,
  Star,
  Scale,
  PlusCircle,
  Droplets,
  Info,
  Truck,
  Undo2,
  Shirt,
  Glasses,
  Footprints,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/product-card';
import Product3dViewer from '@/components/product-3d-viewer';
import { useToast } from '@/hooks/use-toast';
import { useUIState } from '@/providers/ui-state';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotifyMeDialog } from '@/components/notify-me-dialog';
import { UnsubscribeDialog } from '@/components/unsubscribe-dialog';
import { ManageCartItemDialog } from '@/components/manage-cart-item-dialog';
import type { Product, UserProfile, ColorInfo, WishlistCollection, CartItem } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { WardrobeCompatibilityDialog } from '@/components/wardrobe/wardrobe-compatibility-dialog';
import { SimilarProductsDialog } from '@/components/similar-products-dialog';
import { SizeGuideDialog } from '@/components/size-guide-dialog';
import { CommunityLooksPreview } from '@/components/community-looks-preview';
import { BestsellerRankingDialog } from '@/components/bestseller-ranking-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { QuickViewDialog } from '@/components/quick-view-dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { ArViewerDialog } from '@/components/ar-viewer-dialog';
import PriceComparisonTable from '@/components/price-comparison-table';
import { ProductImageViewer } from '@/components/product-image-viewer';
import { ProductRunwayPdpMediaColumn } from '@/components/product/ProductRunwayPdpMediaColumn';
import { Skeleton } from '@/components/ui/skeleton';
import ProductReviews from '@/components/product-reviews';
import { ProductReviewsDialog } from '@/components/product-reviews-dialog';
import { ProductFitFeedbackBlock } from '@/components/product/product-fit-feedback-block';
import { ProductCareCompositionBlock } from '@/components/product/product-care-composition-block';
import { ProductSizeChartBlock } from '@/components/product/product-size-chart-block';
import { ProductFitModelBlock } from '@/components/product/product-fit-model-block';
import { ProductDropCountdown } from '@/components/product/product-drop-countdown';
import { ProductIdentifiersBlock } from '@/components/product/product-identifiers-block';
import { ProductB2BMerchStrip } from '@/components/product/product-b2b-merch-strip';
import { ProductAlterationsBlock } from '@/components/product/product-alterations-block';
import { ProductFabricSpecBlock } from '@/components/product/product-fabric-spec-block';
import { ProductReturnCareBlock } from '@/components/product/product-return-care-block';
import { ProductMaterialOriginBlock } from '@/components/product/product-material-origin-block';
import { ProductDesignDnaBlock } from '@/components/product/product-design-dna-block';
import { ProductLookbookAction } from '@/components/product/product-lookbook-action';
import { ProductStylePairingBlock } from '@/components/product/product-style-pairing-block';
import { ProductFitSentimentBlock } from '@/components/product/product-fit-sentiment-block';
import { ProductContentSyndicationBlock } from '@/components/product/product-content-syndication-block';
import { ProductFactoryQcBlock } from '@/components/product/product-factory-qc-block';
import { ProductTrendInsightBlock } from '@/components/product/product-trend-insight-block';
import { ProductHeritageBlock } from '@/components/product/product-heritage-block';
import { ProductBundleOfferBlock } from '@/components/product/product-bundle-offer-block';
import { ProductMeasurementsBlock } from '@/components/product/product-measurements-block';
import { ProductOccasionBadges } from '@/components/product/product-occasion-badges';
import { ProductWaitlistAction } from '@/components/product/product-waitlist-action';
import { ProductFabricDefectScannerBlock } from '@/components/product/product-fabric-defect-scanner-block';
import { ProductPriceOptimizationBlock } from '@/components/product/product-price-optimization-block';
import { ProductPvzEfficiencyBlock } from '@/components/product/product-pvz-efficiency-block';
import { ProductLaunchReadinessBlock } from '@/components/product/product-launch-readiness-block';
import { ProductBodyInclusivityBlock } from '@/components/product/product-body-inclusivity-block';
import { ProductCircularityBlock } from '@/components/product/product-circularity-block';
import { ProductFitMatchBlock } from '@/components/product/product-fit-match-block';
import { ProductLcaBlock } from '@/components/product/product-lca-block';
import { ProductAssetCreditsBlock } from '@/components/product/product-asset-credits-block';
import { ProductLoyaltyRewardBlock } from '@/components/product/product-loyalty-reward-block';
import { ProductProductionCapacityBlock } from '@/components/product/product-production-capacity-block';
import { ProductLongevityBlock } from '@/components/product/product-longevity-block';
import { ProductSourcingRfqBlock } from '@/components/product/product-sourcing-rfq-block';
import { ProductCostPerWearBlock } from '@/components/product/product-cost-per-wear-block';
import { ProductTraceabilityBlock } from '@/components/product/product-traceability-block';
import { ProductRiskScorecardBlock } from '@/components/product/product-risk-scorecard-block';
import { ProductWholesaleBlock } from '@/components/product/product-wholesale-block';
import { ProductReturnsPredictionBlock } from '@/components/product/product-returns-prediction-block';
import { ProductSupplierScorecardBlock } from '@/components/product/product-supplier-scorecard-block';
import { ProductLookbookPlannerBlock } from '@/components/product/product-lookbook-planner-block';
import { ProductClvPredictorBlock } from '@/components/product/product-clv-predictor-block';
import { ProductFabricWasteBlock } from '@/components/product/product-fabric-waste-block';
import { ProductHonestMarkBlock } from '@/components/product/product-honest-mark-block';
import { ProductBnplBlock } from '@/components/product/product-bnpl-calculator-block';
import { ProductRegionalStockBlock } from '@/components/product/product-regional-stock-block';
import { ProductMarketplaceMappingBlock } from '@/components/product/product-marketplace-mapping-block';
import { ProductSizeConverterBlock } from '@/components/product/product-size-converter-block';
import { ProductLocalDeliveryBlock } from '@/components/product/product-local-delivery-block';
import { ProductRetailVmBlock } from '@/components/product/product-retail-vm-block';
import { ProductSocialAttributionBlock } from '@/components/product/product-social-attribution-block';
import { ProductDigitalPassportBlock } from '@/components/product/product-digital-passport-block';
import { ProductLocalPaymentHubBlock } from '@/components/product/product-local-payment-hub-block';
import { ProductFittingAnalyticsBlock } from '@/components/product/product-fitting-analytics-block';
import { ProductLoyaltyQuestsBlock } from '@/components/product/product-loyalty-quests-block';
import { ProductEaeuTaxBlock } from '@/components/product/product-eaeu-tax-block';
import { ProductParallelImportBlock } from '@/components/product/product-parallel-import-block';
import { ProductMarketplaceSeoBlock } from '@/components/product/product-marketplace-seo-block';
import { ProductAlterationsServiceBlock } from '@/components/product/product-alterations-service-block';
import { ProductFulfillmentStrategyBlock } from '@/components/product/product-fulfillment-strategy-block';
import { ProductCustomsDutyBlock } from '@/components/product/product-customs-duty-block';
import { ProductInfluencerSeedingBlock } from '@/components/product/product-influencer-seeding-block';
import { ProductMarketplaceHealthBlock } from '@/components/product/product-marketplace-health-block';
import { ProductSeasonalFitBlock } from '@/components/product/product-seasonal-fit-block';
import { ProductAssortmentHealthBlock } from '@/components/product/product-assortment-health-block';
import { ProductPartnerTierBlock } from '@/components/product/product-partner-tier-block';
import { ProductFabricTwinBlock } from '@/components/product/product-fabric-twin-block';
import { ProductRegionalHubStockBlock } from '@/components/product/product-regional-hub-stock-block';
import { ProductB2BReservationBlock } from '@/components/product/product-b2b-reservation-block';
import { ProductHonestMarkComplianceBlock } from '@/components/product/product-honest-mark-compliance-block';
import { ProductWholesaleLoyaltyBlock } from '@/components/product/product-wholesale-loyalty-block';
import { ProductTieredPricingBlock } from '@/components/product/product-tiered-pricing-block';
import { ProductPartnerContentBlock } from '@/components/product/product-partner-content-block';
import { ProductEaeuCustomsBlock } from '@/components/product/product-eaeu-customs-block';
import { ProductPartnerPerksBlock } from '@/components/product/product-partner-perks-block';
import { ProductRegionalVelocityBlock } from '@/components/product/product-regional-velocity-block';
import { ProductB2BClaimBlock } from '@/components/product/product-b2b-claim-block';
import { ProductMarketplaceSentimentBlock } from '@/components/product/product-marketplace-sentiment-block';
import { ProductWeatherDemandBlock } from '@/components/product/product-weather-demand-block';
import { ProductStockExchangeBlock } from '@/components/product/product-stock-exchange-block';
import { ProductLoyaltyQuestBlock } from '@/components/product/product-loyalty-quest-block';
import { ProductLogisticsOptimizerBlock } from '@/components/product/product-logistics-optimizer-block';
import { ProductVMPlanogramBlock } from '@/components/product/product-vm-planogram-block';
import { ProductStorePerformanceBlock } from '@/components/product/product-store-performance-block';
import { ProductFittingRoomFeedbackBlock } from '@/components/product/product-fitting-room-feedback-block';
import { ProductStaffKnowledgeBlock } from '@/components/product/product-staff-knowledge-block';
import { ProductStoreStockSwapBlock } from '@/components/product/product-store-stock-swap-block';
import { ProductDynamicMarkdownBlock } from '@/components/product/product-dynamic-markdown-block';
import { ProductClientelingBlock } from '@/components/product/product-clienteling-block';
import { ProductPartnerCreditBlock } from '@/components/product/product-partner-credit-block';
import { ProductB2BTechPackBlock } from '@/components/product/product-b2b-tech-pack-block';
import { ProductProductionMilestonesBlock } from '@/components/product/product-production-milestones-block';
import { ProductRetailInventoryHealthBlock } from '@/components/product/product-retail-inventory-health-block';
import { ProductStaffCommissionBlock } from '@/components/product/product-staff-commission-block';
import { ProductB2BRepairBlock } from '@/components/product/product-b2b-repair-block';
import { ProductRetailContentAutopilotBlock } from '@/components/product/product-retail-content-autopilot-block';
import { ProductStaffTrainingBlock } from '@/components/product/product-staff-training-block';
import { ProductB2BFinancingBlock } from '@/components/product/product-b2b-financing-block';
import { ProductClickCollectBlock } from '@/components/product/product-click-collect-block';
import { ProductRfidStatusBlock } from '@/components/product/product-rfid-status-block';
import { ProductSupplierQcBlock } from '@/components/product/product-supplier-qc-block';
import { ProductStaffClientelingBlock } from '@/components/product/product-staff-clienteling-block';
import { ProductPreOrderAllocationBlock } from '@/components/product/product-preorder-allocation-block';
import { ProductOrderSimulationBlock } from '@/components/product/product-order-simulation-block';
import { ProductAssortmentClashBlock } from '@/components/product/product-assortment-clash-block';
import { ProductAllocationGroupBlock } from '@/components/product/product-allocation-group-block';
import { ProductOrderSplitBlock } from '@/components/product/product-order-split-block';
import { ProductPartnerPerkBlock } from '@/components/product/product-partner-perk-block';
import { ProductVirtualSampleBlock } from '@/components/product/product-virtual-sample-block';
import { ProductCapsuleIntegrityBlock } from '@/components/product/product-capsule-integrity-block';
import { ProductWholesaleMilestoneBlock } from '@/components/product/product-wholesale-milestone-block';
import { ProductCurrencySettlementBlock } from '@/components/product/product-currency-settlement-block';
import { ProductShowroomResourceBlock } from '@/components/product/product-showroom-resource-block';
import { ProductWholesaleHeatmapBlock } from '@/components/product/product-wholesale-heatmap-block';
import { ProductReorderRecommendationBlock } from '@/components/product/product-reorder-recommendation-block';
import { ProductShowroomSampleBlock } from '@/components/product/product-showroom-sample-block';
import { RegionalFulfillmentWindowBlock } from '@/components/product/product-regional-fulfillment-block';
import { ProductRegionalDemandBlock } from '@/components/product/product-regional-demand-block';
import { ProductStoreVipFittingBlock } from '@/components/product/product-store-vip-fitting-block';
import { ProductStaffShiftBlock } from '@/components/product/product-staff-shift-block';
import { ProductRepairHubBlock } from '@/components/product/product-repair-hub-block';
import { ProductSustainabilityLedgerBlock } from '@/components/product/product-sustainability-ledger-block';
import { ProductLocalCourierBlock } from '@/components/product/product-local-courier-block';
import { ProductStockTransferBlock } from '@/components/product/product-stock-transfer-block';
import { ProductB2BFactoringBlock } from '@/components/product/product-b2b-factoring-block';
import { ProductVmComplianceBlock } from '@/components/product/product-vm-compliance-block';
import { ProductSampleTrackerBlock } from '@/components/product/product-sample-tracker-block';
import { ProductEaeuPassportBlock } from '@/components/product/product-eaeu-passport-block';
import { ProductProductionLeadTimeBlock } from '@/components/product/product-production-leadtime-block';
import { ProductLogisticsRoutingBlock } from '@/components/product/product-logistics-routing-block';
import { ProductFittingRoomQueueBlock } from '@/components/product/product-fitting-queue-block';
import { ProductMaterialReservationBlock } from '@/components/product/product-material-reservation-block';
import { ProductDistributorStockBlock } from '@/components/product/product-distributor-stock-block';
import { ProductRegionalPriceLadderBlock } from '@/components/product/product-regional-price-ladder-block';
import { FashionPdpQuickLinks } from '@/components/product/fashion-pdp-quick-links';
import { ProductSustainabilityStrip } from '@/components/product/product-sustainability-strip';
import { ProductExperiencePdpSection } from '@/components/product-experience/product-experience-pdp-section';
import {
  productShowsFootwear360,
  productShowsGlassesTryOn,
} from '@/lib/product-experience/resolvers';
import { ProductGlassesTryOnDialog } from '@/components/product-experience/product-glasses-try-on-dialog';
import { ProductFootwearExperienceDialog } from '@/components/product-experience/product-footwear-experience-dialog';
function parseComposition(composition: unknown): { material: string; percentage: number }[] {
  if (Array.isArray(composition)) {
    return composition as { material: string; percentage: number }[];
  }
  if (typeof composition === 'string') {
    const parts = composition.match(/(\d+%)\s*([^,]+)/g);
    if (parts) {
      return parts
        .map((part) => {
          const match = part.match(/(\d+)%\s*(.*)/);
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

export default function ProductPageContent({
  product,
  isQuickView = false,
}: {
  product: Product;
  isQuickView?: boolean;
}) {
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

  const activeColor = useMemo(() => {
    const selection =
      activeColorSelection?.productId === product.id ? activeColorSelection.colorName : undefined;
    const color = product.availableColors?.find((c) => c.name === selection);
    return color || product.availableColors?.[0];
  }, [product, activeColorSelection]);

  const imagesForCurrentColor = useMemo(() => {
    if (!activeColor || !product.images) return product.images;
    const colorImages = product.images.filter((img) => img.colorName === activeColor.name);
    return colorImages.length > 0 ? colorImages : product.images;
  }, [product.images, activeColor]);

  const [activeImage, setActiveImage] = useState(imagesForCurrentColor[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [notifyDialogSize, setNotifyDialogSize] = useState<string | null>(null);
  const [manageCartItem, setManageCartItem] = useState<ReturnType<typeof getCartItem>>(undefined);
  const [unsubscribeDialogSize, setUnsubscribeDialogSize] = useState<string | null>(null);
  const [priceDisplayMode, setPriceDisplayMode] = useState<'plan' | 'bonus'>('plan');
  const [notifyDialogMode, setNotifyDialogMode] = useState<'subscribe' | 'pre_order'>('subscribe');
  const [notifyDialogPreOrderDate, setNotifyDialogPreOrderDate] = useState<string | undefined>(
    undefined
  );
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isSimilarProductsOpen, setIsSimilarProductsOpen] = useState(false);
  const [isCompatibilityOpen, setIsCompatibilityOpen] = useState(false);
  const [isBestsellerOpen, setIsBestsellerOpen] = useState(false);
  const [is3dOpen, setIs3dOpen] = useState(false);
  const [isArOpen, setIsArOpen] = useState(false);
  const [isGlassesTryOnOpen, setIsGlassesTryOnOpen] = useState(false);
  const [isFootwear360Open, setIsFootwear360Open] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageViewerStartIndex, setImageViewerStartIndex] = useState(0);

  const isInWishlist = useMemo(
    () => wishlist.some((item) => item.id === product.id),
    [product.id, wishlist]
  );

  useEffect(() => {
    setActiveImage(imagesForCurrentColor[0]);
    setSelectedSize(undefined); // Reset size on color change
  }, [imagesForCurrentColor]);

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const response = await fetch('/data/products.json');
        const products = (await response.json()) as Product[];
        // In a real app, this would be an API call to a recommendation engine
        setRelatedProducts(products.slice(10, 14));
      } catch (error) {
        console.error('Failed to fetch products for look page:', error);
      }
    }
    if (!isQuickView) {
      fetchRelatedProducts();
    }
  }, [product.id, product.category, isQuickView]);

  useEffect(() => {
    // When the component mounts, check for available subscriptions for this product
    // and remove them, as the user is now viewing the page.
    const sizes = product.sizes?.map((s) => s.name) || [];
    sizes.forEach((size) => {
      if (availableSubscriptions.some((s) => s.productId === product.id && s.size === size)) {
        removeAvailableSubscription(product.id, size);
      }
    });
  }, [product.id, product.sizes, availableSubscriptions, removeAvailableSubscription]);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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

  const handleOpenNotifyDialog = (size: string) => {
    setNotifyDialogSize(size);
  };

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
        // Here you would also add logic to actually create a pre-order record
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

  const handleTogglePriceDisplay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPriceDisplayMode((prev) => (prev === 'plan' ? 'bonus' : 'plan'));
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
    const newCollection = await addWishlistCollection(newCollectionName.trim());
    addWishlistItem(product, newCollection.id);
    toast({
      title: 'Подборка создана',
      description: `Товар добавлен в новую подборку "${newCollectionName}"`,
    });
    setIsNewCollectionOpen(false);
    setNewCollectionName('');
  };

  const composition = useMemo(() => parseComposition(product.composition), [product.composition]);

  const details = [
    { label: 'Артикул', value: product.sku },
    { label: 'Сезон', value: product.season },
    {
      label: 'Состав',
      value: composition.map((c) => `${c.material} ${c.percentage}%`).join(', ') || 'не указан',
    },
    { label: 'Уход', value: 'Только ручная стирка' },
  ];

  const allSizes = product.sizes?.map((s) => s.name) || [];

  const isInCart = selectedSize ? !!getCartItem(product.id, selectedSize) : false;

  const { cashbackAmount, priceWithBonuses, bonusToUse } = useMemo(() => {
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
    const tier = planDetails[plan] ?? planDetails.base;
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

  const averageRating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 0;
  const availability = getProductAvailability(product, activeColor);

  const showGlassesPdp = productShowsGlassesTryOn(product);
  const showFootwearPdp = productShowsFootwear360(product);

  const handleOpenImageViewer = (index: number) => {
    setImageViewerStartIndex(index);
    setIsImageViewerOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          'grid gap-3 p-4 md:p-4 lg:gap-3',
          isQuickView ? 'grid-cols-1 md:grid-cols-2' : 'md:grid-cols-2'
        )}
      >
        {/* Image Gallery / Runway — Suspense: useSearchParams в ProductRunwayPdpMediaColumn */}
        <Suspense
          fallback={
            <div className="flex flex-col gap-3">
              <Skeleton className="h-9 w-full max-w-xs rounded-md" />
              <Skeleton className="aspect-[4/5] w-full rounded-lg" />
            </div>
          }
        >
          <ProductRunwayPdpMediaColumn
            product={product}
            activeColor={activeColor}
            onColorChange={(colorName) =>
              setActiveColorSelection({ productId: product.id, colorName })
            }
            selectedSize={selectedSize}
            onSizeSelect={handleSelectSize}
            onAddToCart={handleAddToCart}
            onSizeGuideClick={() => setIsSizeGuideOpen(true)}
            isInWishlist={isInWishlist}
            onToggleWishlist={() => {
              const defaultCollection = wishlistCollections[0];
              if (!defaultCollection) return;
              if (isInWishlist) {
                removeWishlistItem(product, defaultCollection.id);
              } else {
                addWishlistItem(product, defaultCollection.id);
              }
            }}
            allSizes={allSizes}
            gallery={
              <>
                <div
                  className="relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-lg border"
                  onClick={() =>
                    handleOpenImageViewer(
                      imagesForCurrentColor.findIndex((img) => img.id === activeImage.id)
                    )
                  }
                >
                  <Image
                    src={activeImage.url}
                    alt={activeImage.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    {product.isPromoted && (
                      <Badge variant="default" className="bg-accent text-sm text-accent-foreground">
                        Промо
                      </Badge>
                    )}
                    {product.outlet && discountPercent > 0 && (
                      <Badge variant="destructive">-{discountPercent}%</Badge>
                    )}
                  </div>
                  {product.bestsellerRank && !isQuickView && (
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
                  {imagesForCurrentColor.map((image, index) => (
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
              </>
            }
          />
        </Suspense>

        {/* Product Info */}
        <div className="py-4">
          <p className="font-medium text-muted-foreground">{product.brand}</p>
          <h1 className="mt-1 font-headline text-base font-bold lg:text-sm">{product.name}</h1>
          <ProductOccasionBadges product={product} />
          <ProductDropCountdown product={product} />

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <button
                className="text-sm text-muted-foreground underline hover:text-primary"
                onClick={() => setIsReviewsOpen(true)}
              >
                ({reviewCount} отзывов)
              </button>
            </div>
            <CommunityLooksPreview productId={product.id} />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
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
              {product.outlet && product.originalPrice && (
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

            <div className="flex items-center gap-2">
              <availability.icon className={cn('h-4 w-4', availability.className)} />
              <span className="text-sm font-medium">{availability.text}</span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Color Selector */}
          {product.availableColors && product.availableColors.length > 0 && (
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

          {/* Size Selector */}
          {allSizes.length > 0 && (
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
                  {allSizes.map((sizeName, index) => {
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
                      <Tooltip key={[sizeName, index].join('-')}>
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

          <ProductOccasionBadges product={product} />
          <ProductFitFeedbackBlock productId={product.id} sku={product.sku} brand={product.brand} />
          <ProductFitMatchBlock product={product} />
          <ProductFitSentimentBlock product={product} />
          <ProductBundleOfferBlock product={product} />
          <ProductMeasurementsBlock product={product} />
          <ProductCareCompositionBlock product={product} />
          <ProductSizeChartBlock product={product} />
          <ProductFitModelBlock product={product} />
          <ProductSustainabilityStrip product={product} />
          <FashionPdpQuickLinks slug={product.slug} sku={product.sku} />
          <ProductIdentifiersBlock product={product} />
          <ProductB2BMerchStrip product={product} />
          <ProductAlterationsBlock product={product} />
          <ProductLcaBlock product={product} />
          <ProductDigitalPassportBlock product={product} />
          <ProductCircularityBlock product={product} />
          <ProductLongevityBlock product={product} />
          <ProductSeasonalFitBlock product={product} />
          <ProductFabricWasteBlock product={product} />
          <ProductReturnsPredictionBlock product={product} />
          <ProductBnplBlock product={product} />
          <ProductAlterationsServiceBlock product={product} />
          <ProductLocalPaymentHubBlock />
          <ProductLocalCourierBlock product={product} />
          <ProductLocalDeliveryBlock />
          <ProductCostPerWearBlock product={product} />
          <ProductLoyaltyQuestsBlock product={product} />
          {user ? <ProductClvPredictorBlock user={user} /> : null}
          <ProductLoyaltyRewardBlock product={product} />
          <ProductTrendInsightBlock product={product} />
          <ProductSizeAffinityBlock product={product} />
          <ProductMaterialOriginBlock product={product} />
          <ProductSizeConverterBlock size={selectedSize || 'M'} category={product.category} />
          <ProductBodyInclusivityBlock product={product} />
          <ProductTraceabilityBlock product={product} />
          <ProductDesignDnaBlock product={product} />
          <ProductHeritageBlock product={product} />
          <ProductStylePairingBlock product={product} />
          <ProductContentSyndicationBlock product={product} />
          <ProductAssetCreditsBlock product={product} />
          <ProductRegionalStockBlock product={product} />
          <ProductEaeuPassportBlock product={product} />
          <ProductParallelImportBlock product={product} />
          <ProductFittingAnalyticsBlock product={product} />
          <ProductProductionCapacityBlock product={product} />
          <ProductSourcingRfqBlock product={product} />
          <ProductWholesaleBlock product={product} />
          <ProductFulfillmentStrategyBlock product={product} />
          <ProductAssortmentHealthBlock product={product} />
          <ProductPartnerTierBlock />
          <ProductFabricTwinBlock product={product} />
          <ProductB2BReservationBlock product={product} />
          <ProductRegionalHubStockBlock product={product} />
          <RegionalFulfillmentWindowBlock product={product} />
          <ProductRegionalDemandBlock product={product} />

          <ProductLogisticsRoutingBlock product={product} />
          <ProductDistributorStockBlock product={product} />
          <ProductHonestMarkComplianceBlock product={product} />
          <ProductWholesaleLoyaltyBlock product={product} />
          <ProductWholesaleMilestoneBlock product={product} />
          <ProductReorderRecommendationBlock product={product} />
          <ProductWholesaleHeatmapBlock product={product} />
          <ProductShowroomSampleBlock product={product} />
          <ProductCurrencySettlementBlock product={product} />
          <ProductShowroomResourceBlock product={product} />
          <ProductVirtualSampleBlock product={product} />
          <ProductCapsuleIntegrityBlock product={product} />
          <ProductAllocationGroupBlock product={product} />
          <ProductOrderSplitBlock product={product} />
          <ProductPartnerPerkBlock product={product} />
          <ProductOrderSimulationBlock product={product} />
          <ProductTieredPricingBlock product={product} />
          <ProductPreOrderAllocationBlock product={product} />
          <ProductB2BFactoringBlock product={product} />
          <ProductPartnerContentBlock product={product} />
          <ProductEaeuCustomsBlock product={product} />
          <ProductPartnerPerksBlock />
          <ProductRegionalVelocityBlock product={product} />
          <ProductMarketplaceSentimentBlock product={product} />
          <ProductWeatherDemandBlock product={product} />
          <ProductStockExchangeBlock product={product} />
          <ProductLoyaltyQuestBlock product={product} />
          <ProductLogisticsOptimizerBlock product={product} />
          <ProductVMPlanogramBlock product={product} />
          <ProductVmComplianceBlock product={product} />
          <ProductStaffShiftBlock product={product} />
          <ProductStorePerformanceBlock product={product} />
          <ProductAssortmentClashBlock product={product} />
          <ProductFittingRoomFeedbackBlock product={product} />
          <ProductFittingRoomQueueBlock product={product} />
          <ProductStaffKnowledgeBlock product={product} />
          <ProductStoreStockSwapBlock product={product} />
          <ProductStockTransferBlock product={product} />
          <ProductRepairHubBlock product={product} />
          <ProductDynamicMarkdownBlock product={product} />
          <ProductClientelingBlock product={product} />
          <ProductPartnerCreditBlock product={product} />
          <ProductB2BTechPackBlock product={product} />
          <ProductProductionMilestonesBlock product={product} />
          <ProductProductionLeadTimeBlock product={product} />
          <ProductSustainabilityLedgerBlock product={product} />
          <ProductSampleTrackerBlock product={product} />
          <ProductMaterialReservationBlock product={product} />
          <ProductRetailInventoryHealthBlock product={product} />
          <ProductRfidStatusBlock product={product} />
          <ProductStaffCommissionBlock product={product} />
          <ProductB2BRepairBlock product={product} />
          <ProductRetailContentAutopilotBlock product={product} />
          <ProductStaffTrainingBlock product={product} />
          <ProductStaffClientelingBlock product={product} />
          <ProductStoreVipFittingBlock product={product} />
          <ProductB2BFinancingBlock product={product} />
          <ProductClickCollectBlock product={product} />
          <ProductPriceOptimizationBlock product={product} />
          <ProductRegionalPriceLadderBlock product={product} />
          <ProductEaeuTaxBlock product={product} />
          <ProductCustomsDutyBlock product={product} />
          <ProductSupplierScorecardBlock product={product} />
          <ProductSupplierQcBlock product={product} />
          <ProductB2BClaimBlock product={product} />
          <ProductRetailVmBlock product={product} />
          <ProductLookbookPlannerBlock product={product} />
          <ProductMarketplaceMappingBlock product={product} />
          <ProductMarketplaceHealthBlock product={product} />
          <ProductMarketplaceSeoBlock product={product} />
          <ProductPvzEfficiencyBlock product={product} />
          <ProductSocialAttributionBlock product={product} />
          <ProductInfluencerSeedingBlock product={product} />
          <ProductLaunchReadinessBlock product={product} />
          <ProductHonestMarkBlock product={product} />
          <ProductFabricDefectScannerBlock product={product} />
          <ProductRiskScorecardBlock product={product} />
          <ProductFactoryQcBlock product={product} />
          <ProductFabricSpecBlock product={product} />
          <ProductReturnCareBlock product={product} />
          <div className="mt-6 space-y-4 border-t pt-6 text-sm text-muted-foreground">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {details
                .filter((d) => d.value)
                .map((detail) => (
                  <React.Fragment key={detail.label}>
                    <div className="font-medium text-foreground">{detail.label}</div>
                    <div>{detail.value}</div>
                  </React.Fragment>
                ))}
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4" />
              <span>Стандартная доставка: 3-5 дней</span>
            </div>
            <div className="flex items-center gap-3">
              <Undo2 className="h-4 w-4" />
              <span>Бесплатный возврат в течение 14 дней</span>
            </div>
          </div>

          {product.wardrobeCompatibility && (
            <Button
              variant="link"
              className="mt-2 text-muted-foreground"
              onClick={() => setIsCompatibilityOpen(true)}
            >
              Совместимость с гардеробом: {product.wardrobeCompatibility.score}%
            </Button>
          )}

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
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={allSizes.length > 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />{' '}
                {isInCart ? 'Добавлено' : 'Добавить в корзину'}
              </Button>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="outline" className="h-11 w-11">
                  <Star
                    className={cn('h-5 w-5', isInWishlist && 'fill-amber-500 text-amber-500')}
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
            <Button
              size="icon"
              variant="outline"
              className="h-11 w-11"
              onClick={() => toggleComparisonItem(product)}
            >
              <Scale className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="outline" className="h-11 w-11">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <ProductWaitlistAction product={product} />
            <ProductLookbookAction product={product} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {product.hasAR && (
              <Button size="lg" variant="outline" onClick={() => setIs3dOpen(true)}>
                <View className="mr-2 h-5 w-5 text-accent" /> Просмотр в 3D
              </Button>
            )}
            {product.hasAR && (
              <Button size="lg" variant="outline" onClick={() => setIsArOpen(true)}>
                <Sparkles className="mr-2 h-5 w-5 text-accent" /> Digital-Примерка
              </Button>
            )}
            {showGlassesPdp && (
              <Button size="lg" variant="outline" onClick={() => setIsGlassesTryOnOpen(true)}>
                <Glasses className="mr-2 h-5 w-5 text-accent" /> Виртуальная примерка оправы
              </Button>
            )}
            {showFootwearPdp && (
              <Button size="lg" variant="outline" onClick={() => setIsFootwear360Open(true)}>
                <Footprints className="mr-2 h-5 w-5 text-accent" /> 360° обувь и сочетания
              </Button>
            )}
          </div>
        </div>

        <ProductExperiencePdpSection product={product} isQuickView={isQuickView} />
      </div>

      {!isQuickView && (
        <div className="container mx-auto px-4">
          <div className="my-16">
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => setIsSimilarProductsOpen(true)}
            >
              <h2 className="mb-8 flex items-center gap-2 text-center font-headline text-base font-bold">
                <Sparkles className="h-6 w-6 text-accent" /> AI-поиск похожих товаров
              </h2>
            </Button>
          </div>

          {/* Price Comparison Section */}
          <div className="my-16">
            <PriceComparisonTable productId={product.id} />
          </div>

          <div className="my-16">
            <ProductReviews productId={product.id} />
          </div>

          {/* Related Products */}
          <div className="my-16">
            <h2 className="mb-8 text-center font-headline text-base font-bold">
              С этим также покупают
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
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
      {showGlassesPdp && (
        <ProductGlassesTryOnDialog
          product={product}
          open={isGlassesTryOnOpen}
          onOpenChange={setIsGlassesTryOnOpen}
        />
      )}
      {showFootwearPdp && (
        <ProductFootwearExperienceDialog
          product={product}
          open={isFootwear360Open}
          onOpenChange={setIsFootwear360Open}
        />
      )}
      {isReviewsOpen && (
        <ProductReviewsDialog
          product={product}
          isOpen={isReviewsOpen}
          onOpenChange={setIsReviewsOpen}
        />
      )}
      {notifyDialogSize && (
        <NotifyMeDialog
          product={product}
          size={notifyDialogSize}
          mode={notifyDialogMode}
          preOrderDate={notifyDialogPreOrderDate}
          isOpen={!!notifyDialogSize}
          onOpenChange={(open) => {
            if (!open) setNotifyDialogSize(null);
          }}
          onConfirm={handleConfirmSubscription}
        />
      )}
      {manageCartItem && (
        <ManageCartItemDialog
          product={product}
          cartItem={manageCartItem}
          isOpen={!!manageCartItem}
          onOpenChange={(open) => {
            if (!open) setManageCartItem(undefined);
          }}
          onUpdate={(quantity) => {
            if (manageCartItem) {
              updateCartItemQuantity(manageCartItem.id, quantity, manageCartItem.selectedSize);
            }
          }}
          onRemove={() => {
            // removeCartItem(manageCartItem.id, manageCartItem.selectedSize)
          }}
        />
      )}
      {unsubscribeDialogSize && (
        <UnsubscribeDialog
          product={product}
          size={unsubscribeDialogSize}
          isOpen={!!unsubscribeDialogSize}
          onOpenChange={(open) => {
            if (!open) setUnsubscribeDialogSize(null);
          }}
          onConfirm={handleConfirmUnsubscribe}
        />
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
    </>
  );
}
