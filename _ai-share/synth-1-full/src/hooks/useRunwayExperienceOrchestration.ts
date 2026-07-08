'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ColorInfo, Product, ProductScrollSwitcherSection } from '@/lib/types';
import {
  buildRunwayProductViewModel,
  resolveAdjacentSectionImageUrls,
  resolveAdjacentBrandScrollVideoProducts,
  resolveAnalyticsSocialProof,
  resolveSectionImage,
  resolveSectionPrice,
} from '@/lib/product-scroll-switcher';
import {
  RUNWAY_ADD_TO_CART_DEBOUNCE_MS,
  RUNWAY_SECTION_PULSE_MS,
  RUNWAY_CINEMATIC_INTRO_MS,
  RUNWAY_CINEMATIC_INTRO_STORAGE_KEY,
  RUNWAY_KIOSK_TOUR_INTERVAL_MS,
  RUNWAY_VIEWPORT_INTERSECTION_RATIO,
  RUNWAY_VIEWPORT_THRESHOLDS,
} from '@/lib/scroll-switcher-constants';
import { buildRunwayThemeStyle, resolveRunwayTheme } from '@/lib/runway/runway-theme';
import type { ScrollExperienceInteractionType } from '@/lib/scroll-experience-analytics';
import { trackScrollExperienceEvent } from '@/lib/scroll-experience-analytics';
import {
  clampCompareIndices,
  parseCompareParam,
  parseKioskAutoadvanceMs,
  resolveKioskMode,
} from '@/lib/runway/runway-mode-utils';
import { t } from '@/lib/runway/runway-i18n';
import { isRunwayE2eMode } from '@/lib/runway/runway-e2e';
import { useUIState } from '@/providers/ui-state';
import {
  setRunwayStoredSection,
  dismissAllRunwayOnboardingHints,
} from '@/hooks/useRunwaySectionPersistence';
import { useRunwaySectionPreload } from '@/hooks/useRunwaySectionPreload';
import { useRunwayExperience } from '@/hooks/useRunwayExperience';
import { useRunwayUserPreferences } from '@/hooks/useRunwayUserPreferences';
import { useRunwayPerformanceMetrics } from '@/hooks/useRunwayPerformanceMetrics';
import { useRunwayLcpHero } from '@/hooks/useRunwayLcpHero';
import type { RunwaySectionViewModel } from '@/lib/product-scroll-switcher';
import type { ScrollExperienceConfig } from '@/lib/types';

export interface ProductScrollSwitcherProps {
  product: Product;
  activeColor?: ColorInfo | null;
  controlledSectionIndex?: number;
  onSectionChange?: (index: number, section: ProductScrollSwitcherSection) => void;
  variantLabel?: string;
  material?: string;
  dimensions?: string;
  madeInLabel?: string;
  displayPrice?: number;
  originalPrice?: number;
  showOutlet?: boolean;
  cashbackAmount?: number;
  brandHref?: string;
  selectedSize?: string;
  availableSizes?: string[];
  onSizeSelect?: (size: string) => void;
  requiresSize?: boolean;
  onAddToCart: () => void;
  onMoreDetails?: () => void;
  compact?: boolean;
  deferMedia?: boolean;
  isMediaVisible?: boolean;
  syncUrl?: boolean;
  onSizeGuideClick?: () => void;
  showSizeGuide?: boolean;
  variantSku?: string;
  cartQuantity?: number;
  surface?: string;
  analyticsSurface?: string;
  showProgress?: boolean;
  isInWishlist?: boolean;
  onToggleWishlist?: () => void;
  showWishlist?: boolean;
  showShare?: boolean;
  brandScrollCatalog?: Product[];
  /** Полный/частичный каталог для resolve look-item add-to-cart. */
  lookCatalogProducts?: Product[];
  className?: string;
}

export interface RunwayOrchestrationContext extends ProductScrollSwitcherProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isDemoMode: boolean;
  systemPrefersReducedMotion: boolean;
  videoReady: boolean;
  setVideoReady: (v: boolean) => void;
  videoLoading: boolean;
  setVideoLoading: (v: boolean) => void;
  videoFailed: boolean;
  isFullscreen: boolean;
  pulseSection: number | null;
  liveSectionLabel: string;
  livePriceAnnouncement: string;
  compareTargetIndex: number | null;
  setCompareTargetIndex: (v: number | null) => void;
  videoRetryKey: number;
  cinematicVisible: boolean;
  markHeroVideoLoadedData: () => void;
  cartUpsellVisible: boolean;
  setCartUpsellVisible: (v: boolean) => void;
  /** Показать «Оформить заказ» после успешного add-to-cart при непустой корзине. */
  showCheckoutShortcut: boolean;
  userPrefs: ReturnType<typeof useRunwayUserPreferences>['prefs'];
  updateUserPrefs: ReturnType<typeof useRunwayUserPreferences>['update'];
  runwayTheme: ReturnType<typeof resolveRunwayTheme>;
  themeStyle: React.CSSProperties;
  surface: string;
  shouldLoadMedia: boolean;
  viewModel: ReturnType<typeof buildRunwayProductViewModel>;
  sections: RunwaySectionViewModel[];
  usesPerSectionVideo: boolean;
  hasVideoSource: boolean;
  canUseVideo: boolean;
  scrollConfig: ScrollExperienceConfig;
  showAutoTour: boolean;
  prefersReducedMotion: boolean;
  progress: number;
  activeSection: number;
  handleTouchStart: (y: number) => void;
  handleTouchMove: (y: number) => void;
  handleTouchEnd: () => void;
  autoTour: ReturnType<typeof useRunwayExperience>['autoTour'];
  sectionLabels: string[];
  favorites: ReturnType<typeof useRunwayExperience>['favorites'];
  current: RunwaySectionViewModel;
  videoSources: { mp4?: string; webm?: string };
  adjacent: { prev?: string; next?: string };
  adjacentBrandProducts: ReturnType<typeof resolveAdjacentBrandScrollVideoProducts>;
  socialProof: ReturnType<typeof resolveAnalyticsSocialProof> | null;
  parallaxOffset: number;
  stageImageUrl?: string;
  displayVariant: string;
  displayMaterial: string;
  displayDimensions?: string;
  price: number;
  resolvedOriginalPrice?: number;
  showStrikePrice: boolean;
  sectionAvailability?: RunwaySectionViewModel['availability'];
  missingSize: boolean;
  lowStockQuantity?: number;
  stageBackground: string;
  handleVideoError: () => void;
  handleVideoManualRetry: () => void;
  handleMoreDetails: () => void;
  handleAddToCartClick: () => void;
  pickSection: (index: number, interactionType: ScrollExperienceInteractionType) => void;
  handleWishlistToggle: () => void;
  toggleFullscreen: () => Promise<void>;
  addToCartLabel: string;
  selectionSummary: string;
  showDemoChrome: boolean;
  hasDemoAssets: boolean;
  onThumbHover: (index: number) => void;
  onThumbHoverEnd: () => void;
  markSectionChangeStart: () => void;
  isKioskMode: boolean;
  kioskTourIntervalMs: number;
  exitKioskMode: () => void;
  compareViewOpen: boolean;
  compareViewIndices: [number, number] | null;
  openCompareView: (left: number, right: number) => void;
  closeCompareView: () => void;
  isEmbedSurface: boolean;
}

export function useRunwayExperienceOrchestration(
  props: ProductScrollSwitcherProps
): RunwayOrchestrationContext {
  const {
    product,
    activeColor,
    controlledSectionIndex,
    onSectionChange,
    variantLabel,
    material,
    dimensions,
    madeInLabel = t('runway.madeInItaly'),
    displayPrice,
    originalPrice,
    showOutlet,
    cashbackAmount = 0,
    brandHref,
    selectedSize,
    availableSizes = [],
    onSizeSelect,
    requiresSize = false,
    onAddToCart,
    onMoreDetails,
    compact = false,
    deferMedia = false,
    isMediaVisible = true,
    syncUrl = false,
    onSizeGuideClick,
    showSizeGuide = true,
    variantSku,
    cartQuantity = 0,
    surface: surfaceProp = 'pdp',
    analyticsSurface,
    showProgress = true,
    isInWishlist = false,
    onToggleWishlist,
    showWishlist = true,
    showShare = true,
    brandScrollCatalog,
    lookCatalogProducts,
    className,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === '1';
  const { openCart, cart } = useUIState();
  const [kioskDismissed, setKioskDismissed] = useState(false);
  const [compareViewOpen, setCompareViewOpen] = useState(false);
  const [compareViewIndices, setCompareViewIndices] = useState<[number, number] | null>(null);
  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportActive, setViewportActive] = useState(false);
  const [pulseSection, setPulseSection] = useState<number | null>(null);
  const [liveSectionLabel, setLiveSectionLabel] = useState('');
  const [livePriceAnnouncement, setLivePriceAnnouncement] = useState('');
  const [compareTargetIndex, setCompareTargetIndex] = useState<number | null>(null);
  const [videoRetryKey, setVideoRetryKey] = useState(0);
  const [cinematicVisible, setCinematicVisible] = useState(false);
  const [heroVideoLoadedData, setHeroVideoLoadedData] = useState(false);
  const [cartUpsellVisible, setCartUpsellVisible] = useState(false);
  const [showCheckoutShortcut, setShowCheckoutShortcut] = useState(false);
  const prevSectionRef = useRef(-1);
  const viewTrackedRef = useRef(false);
  const lastAddToCartRef = useRef(0);
  const lastInteractionRef = useRef<ScrollExperienceInteractionType>('wheel');

  const { prefs: userPrefs, update: updateUserPrefs } = useRunwayUserPreferences();
  const runwayTheme = resolveRunwayTheme(product);
  const themeStyle = buildRunwayThemeStyle(runwayTheme);

  const surface = analyticsSurface ?? surfaceProp;
  const isEmbedSurface = surface === 'embed' || surfaceProp === 'embed';
  /** Embed iframe — компактная сцена без потери minimal layout. */
  const effectiveCompact = compact || isEmbedSurface;
  const shouldLoadMedia = !deferMedia || isMediaVisible;

  const viewModel = useMemo(
    () =>
      buildRunwayProductViewModel(product, {
        activeColorName: activeColor?.name,
      }),
    [product, activeColor?.name]
  );
  const sections = viewModel.sections;
  const usesPerSectionVideo = viewModel.usesPerSectionVideo;
  const hasVideoSource = viewModel.hasVideo;
  const canUseVideo =
    hasVideoSource && !videoFailed && shouldLoadMedia && userPrefs.ambientVideoEnabled;

  const scrollExperience = useRunwayExperience({
    product,
    activeColor,
    controlledSectionIndex,
    onSectionChange: (index, section) => {
      onSectionChange?.(index, section);
    },
    containerRef,
    videoRef,
    enabled: shouldLoadMedia,
    wheelEnabled: viewportActive,
    canUseVideo,
    videoReady,
    systemPrefersReducedMotion,
    usesPerSectionVideo,
    syncUrl,
    compact: effectiveCompact,
    isDemoMode,
  });

  const scrollConfig = scrollExperience.scrollConfig;
  const showAutoTour = isDemoMode;
  const isKioskMode =
    !kioskDismissed &&
    resolveKioskMode({
      kioskParam: searchParams.get('kiosk'),
      enableKioskMode: scrollConfig.enableKioskMode,
    });
  const kioskTourIntervalMs = parseKioskAutoadvanceMs(
    searchParams.get('autoadvance'),
    RUNWAY_KIOSK_TOUR_INTERVAL_MS
  );

  const openCompareView = useCallback((left: number, right: number) => {
    setCompareViewIndices([left, right]);
    setCompareViewOpen(true);
  }, []);

  const closeCompareView = useCallback(() => {
    setCompareViewOpen(false);
  }, []);

  const exitKioskMode = useCallback(() => {
    setKioskDismissed(true);
  }, []);

  useEffect(() => {
    const compareParam = searchParams.get('compare');
    const parsed = parseCompareParam(compareParam);
    if (!parsed || sections.length < 2) return;
    const clamped = clampCompareIndices(parsed, sections.length);
    if (clamped) {
      setCompareViewIndices(clamped);
      setCompareViewOpen(true);
    }
  }, [searchParams, sections.length]);
  const prefersReducedMotion = scrollExperience.prefersReducedMotion;
  const {
    progress,
    activeSection,
    jumpToSection,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    autoTour,
    selectSection,
    sectionLabels,
    favorites,
  } = scrollExperience;

  const { markSectionChangeStart } = useRunwayPerformanceMetrics({
    productSlug: product.slug,
    activeSection,
    videoReady,
  });

  useEffect(() => {
    setHeroVideoLoadedData(false);
  }, [product.slug, activeSection]);

  const heroMediaReady =
    cinematicVisible &&
    activeSection === 0 &&
    (heroVideoLoadedData ||
      !hasVideoSource ||
      videoFailed ||
      !userPrefs.ambientVideoEnabled ||
      (!canUseVideo && videoReady));

  useRunwayLcpHero({
    productSlug: product.slug,
    activeSection,
    heroMediaReady,
    enabled: shouldLoadMedia,
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isRunwayE2eMode() || !syncUrl || effectiveCompact || prefersReducedMotion) {
      setCinematicVisible(true);
      return;
    }
    try {
      if (sessionStorage.getItem(RUNWAY_CINEMATIC_INTRO_STORAGE_KEY) === '1') {
        setCinematicVisible(true);
        return;
      }
    } catch {
      setCinematicVisible(true);
      return;
    }
    setCinematicVisible(false);
    const t = window.setTimeout(() => {
      setCinematicVisible(true);
      try {
        sessionStorage.setItem(RUNWAY_CINEMATIC_INTRO_STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
    }, RUNWAY_CINEMATIC_INTRO_MS);
    return () => window.clearTimeout(t);
  }, [syncUrl, effectiveCompact, prefersReducedMotion]);

  const { onThumbHover, onThumbHoverEnd, preloadSection } = useRunwaySectionPreload({
    sections,
    enabled: shouldLoadMedia && hasVideoSource,
  });

  // Колесо только когда switcher в viewport (избегаем конфликта со скроллом страницы).
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) =>
        setViewportActive(
          Boolean(
            entry?.isIntersecting && entry.intersectionRatio >= RUNWAY_VIEWPORT_INTERSECTION_RATIO
          )
        ),
      { threshold: [...RUNWAY_VIEWPORT_THRESHOLDS] }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Выгрузка видео при скрытии runway (standard view / defer).
  useEffect(() => {
    const video = videoRef.current;
    if (shouldLoadMedia || !video) return;
    video.pause();
    video.removeAttribute('src');
    video.load();
    setVideoReady(false);
    setVideoLoading(false);
  }, [shouldLoadMedia]);

  const trackSectionAnalytics = useCallback(
    (index: number, interactionType: ScrollExperienceInteractionType) => {
      const section = sections[index];
      if (!section) return;
      trackScrollExperienceEvent('scroll_experience_section_change', {
        productSlug: product.slug,
        productId: product.id,
        brand: product.brand,
        sectionIndex: index,
        sectionId: section.id,
        sectionLabel: section.label,
        price: section.price,
        hasVideo: hasVideoSource,
        interactionType,
        surface,
      });
    },
    [sections, product.slug, product.id, product.brand, hasVideoSource, surface]
  );

  const current = sections[activeSection] ?? sections[0];
  const videoSources = usesPerSectionVideo
    ? (current?.videoSources ?? viewModel.videoSources)
    : viewModel.videoSources;

  useEffect(() => {
    if (!canUseVideo) {
      setVideoReady(false);
      setVideoLoading(false);
      return;
    }
    setVideoLoading(true);
    setVideoFailed(false);
    setVideoReady(false);
  }, [canUseVideo, videoSources.mp4, videoSources.webm, activeSection, usesPerSectionVideo]);

  const adjacent = useMemo(
    () => resolveAdjacentSectionImageUrls(product, activeSection),
    [product, activeSection]
  );
  const adjacentBrandProducts = useMemo(
    () =>
      brandScrollCatalog?.length
        ? resolveAdjacentBrandScrollVideoProducts(product, brandScrollCatalog)
        : {},
    [brandScrollCatalog, product]
  );
  const socialProof = useMemo(
    () =>
      scrollConfig.showSocialProof
        ? resolveAnalyticsSocialProof(product.slug, activeSection)
        : null,
    [scrollConfig.showSocialProof, product.slug, activeSection]
  );
  const parallaxOffset = prefersReducedMotion ? 0 : (progress - 0.5) * 24;
  const stageImageUrl = resolveSectionImage(product, current, activeSection);

  useEffect(() => {
    if (compareTargetIndex == null) return;
    const timer = window.setTimeout(
      () => setCompareTargetIndex(null),
      prefersReducedMotion ? 2000 : 1500
    );
    return () => window.clearTimeout(timer);
  }, [compareTargetIndex, activeSection, prefersReducedMotion]);

  useEffect(() => {
    if (!shouldLoadMedia) return;
    [adjacent.prev, adjacent.next].forEach((url) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
    });
  }, [adjacent.prev, adjacent.next, shouldLoadMedia]);

  // Preload соседних section videos на idle (OSS luxury PDP pattern).
  useEffect(() => {
    if (!shouldLoadMedia || !hasVideoSource) return;
    const run = () => {
      preloadSection(activeSection);
      preloadSection(Math.max(0, activeSection - 1));
      preloadSection(Math.min(sections.length - 1, activeSection + 1));
    };
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(run, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 400);
    return () => window.clearTimeout(t);
  }, [shouldLoadMedia, hasVideoSource, activeSection, sections.length, preloadSection]);

  useEffect(() => {
    if (!shouldLoadMedia || viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    const section = sections[activeSection] ?? sections[0];
    const viewPrice = displayPrice ?? section?.price ?? product.price;
    trackScrollExperienceEvent('scroll_experience_view', {
      productSlug: product.slug,
      productId: product.id,
      brand: product.brand,
      sectionIndex: activeSection,
      sectionId: section?.id,
      sectionLabel: section?.label,
      price: viewPrice,
      hasVideo: hasVideoSource,
      surface,
    });
  }, [
    shouldLoadMedia,
    product.slug,
    product.id,
    product.brand,
    product.price,
    activeSection,
    surface,
    sections,
    displayPrice,
    hasVideoSource,
  ]);

  useEffect(() => {
    if (prevSectionRef.current === activeSection) return;
    if (prevSectionRef.current >= 0) {
      const section = sections[activeSection];
      const sectionPrice = displayPrice ?? section?.price ?? resolveSectionPrice(product, section);
      setLiveSectionLabel(section?.label ?? '');
      setLivePriceAnnouncement(
        t('runway.priceAnnouncement', {
          price: `${sectionPrice.toLocaleString('ru-RU')} ₽`,
          label: section?.label ?? '',
        })
      );
      setPulseSection(activeSection);
      setRunwayStoredSection(product.slug, activeSection);
      const pulseTimer = window.setTimeout(() => setPulseSection(null), RUNWAY_SECTION_PULSE_MS);
      if (shouldLoadMedia) {
        trackSectionAnalytics(activeSection, lastInteractionRef.current);
      }
      if (lastInteractionRef.current === 'keyboard' || lastInteractionRef.current === 'thumb') {
        const thumb = containerRef.current?.querySelector(
          `[data-runway-thumb="${activeSection}"]`
        ) as HTMLElement | null;
        thumb?.focus({ preventScroll: true });
      }
      prevSectionRef.current = activeSection;
      return () => window.clearTimeout(pulseTimer);
    }
    prevSectionRef.current = activeSection;
  }, [activeSection, sections, trackSectionAnalytics, product.slug, shouldLoadMedia]);

  const displayVariant = variantLabel ?? activeColor?.name ?? current.label ?? product.color;
  const displayMaterial = material ?? current.material ?? product.material ?? product.description;
  const displayDimensions =
    dimensions ?? current.dimensions ?? (product.attributes?.dimensions as string | undefined);
  const price = displayPrice ?? current?.price ?? resolveSectionPrice(product, current);
  const resolvedOriginalPrice =
    originalPrice ?? (current?.showOutlet ? product.originalPrice : product.originalPrice);
  const showStrikePrice = Boolean(
    (showOutlet || current?.showOutlet) && resolvedOriginalPrice && resolvedOriginalPrice > price
  );
  const sectionAvailability = current?.availability;
  const missingSize = requiresSize && !selectedSize;

  const lowStockQuantity = useMemo(() => {
    if (!selectedSize) return undefined;
    const matched = current?.matchedColor;
    const sizeInfo = matched?.sizeAvailability?.find((s) => s.size === selectedSize);
    return sizeInfo?.quantity;
  }, [selectedSize, current?.matchedColor]);

  // Фон сцены — цвет активной секции (видео идёт внутри карточки как ambient-слой).
  const stageBackground = current.color;

  const handleVideoError = () => {
    if (videoRetryKey < 1) {
      setVideoRetryKey((k) => k + 1);
      setVideoFailed(false);
      setVideoLoading(true);
      return;
    }
    setVideoFailed(true);
    setVideoLoading(false);
    setVideoReady(false);
  };

  const handleVideoManualRetry = () => {
    setVideoRetryKey((k) => k + 1);
    setVideoFailed(false);
    setVideoLoading(true);
    setVideoReady(false);
  };

  const handleMoreDetails = () => {
    if (onMoreDetails) {
      onMoreDetails();
      return;
    }
    document.getElementById('details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddToCartClick = () => {
    const now = Date.now();
    if (now - lastAddToCartRef.current < RUNWAY_ADD_TO_CART_DEBOUNCE_MS) return;
    lastAddToCartRef.current = now;
    if (missingSize) return;

    trackScrollExperienceEvent('scroll_experience_add_to_cart', {
      productSlug: product.slug,
      productId: product.id,
      brand: product.brand,
      sectionIndex: activeSection,
      sectionId: current?.id,
      sectionLabel: current?.label,
      price,
      hasVideo: hasVideoSource,
      interactionType: lastInteractionRef.current,
      surface,
    });
    onAddToCart();
    openCart();
    setShowCheckoutShortcut(true);
    if (current?.lookItems?.length && userPrefs.showCompleteLook) {
      setCartUpsellVisible(true);
    }
  };

  const pickSection = useCallback(
    (index: number, interactionType: ScrollExperienceInteractionType) => {
      dismissAllRunwayOnboardingHints();
      lastInteractionRef.current = interactionType;
      markSectionChangeStart();
      selectSection(index, interactionType);
    },
    [selectSection, markSectionChangeStart]
  );

  const handleWishlistToggle = () => {
    trackScrollExperienceEvent('scroll_experience_wishlist_toggle', {
      productSlug: product.slug,
      productId: product.id,
      brand: product.brand,
      sectionIndex: activeSection,
      surface,
    });
    onToggleWishlist?.();
  };

  const toggleFullscreen = async () => {
    const node = containerRef.current;
    if (!node) return;
    if (!document.fullscreenElement) {
      await node.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const addToCartLabel = missingSize
    ? t('runway.selectSize')
    : cartQuantity > 0
      ? `${t('runway.inCart')} · ${cartQuantity}`
      : t('runway.addToCart');

  const selectionSummary = [
    displayVariant,
    selectedSize ? t('runway.selectionSize', { size: selectedSize }) : null,
  ]
    .filter(Boolean)
    .join(', ');

  const showDemoChrome = isDemoMode;
  const hasDemoAssets = Boolean(
    product.scrollSwitcherSections?.some((s) => s.sectionImageUrl?.includes('/images/demo/runway/'))
  );

  return {
    ...props,
    showProgress,
    compact: effectiveCompact,
    showWishlist,
    showShare,
    syncUrl,
    containerRef,
    videoRef,
    isDemoMode,
    systemPrefersReducedMotion,
    videoReady,
    setVideoReady,
    videoLoading,
    setVideoLoading,
    videoFailed,
    isFullscreen,
    pulseSection,
    liveSectionLabel,
    livePriceAnnouncement,
    compareTargetIndex,
    setCompareTargetIndex,
    videoRetryKey,
    cinematicVisible,
    markHeroVideoLoadedData: () => setHeroVideoLoadedData(true),
    cartUpsellVisible,
    setCartUpsellVisible,
    showCheckoutShortcut: showCheckoutShortcut && cart.length > 0,
    userPrefs,
    updateUserPrefs,
    runwayTheme,
    themeStyle,
    surface,
    shouldLoadMedia,
    viewModel,
    sections,
    usesPerSectionVideo,
    hasVideoSource,
    canUseVideo,
    scrollConfig,
    showAutoTour,
    prefersReducedMotion,
    progress,
    activeSection,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    autoTour,
    sectionLabels,
    favorites,
    current,
    videoSources,
    adjacent,
    adjacentBrandProducts,
    socialProof,
    parallaxOffset,
    stageImageUrl,
    displayVariant,
    displayMaterial,
    displayDimensions,
    price,
    resolvedOriginalPrice,
    showStrikePrice,
    sectionAvailability,
    missingSize,
    lowStockQuantity,
    stageBackground,
    handleVideoError,
    handleVideoManualRetry,
    handleMoreDetails,
    handleAddToCartClick,
    pickSection,
    handleWishlistToggle,
    toggleFullscreen,
    addToCartLabel,
    selectionSummary,
    showDemoChrome,
    hasDemoAssets,
    onThumbHover,
    onThumbHoverEnd,
    markSectionChangeStart,
    isKioskMode,
    kioskTourIntervalMs,
    exitKioskMode,
    compareViewOpen,
    compareViewIndices,
    openCompareView,
    closeCompareView,
    isEmbedSurface,
  };
}
