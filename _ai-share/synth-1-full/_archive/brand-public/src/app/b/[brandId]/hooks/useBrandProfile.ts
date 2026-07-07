'use client';

import { useState, useMemo, useRef, useEffect, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUIState } from '@/providers/ui-state';
import { brands } from '@/lib/placeholder-data';
import { format } from 'date-fns';
import type { Brand, Product, ImagePlaceholder } from '@/lib/types';
import {
  defaultSettings,
  brandStatuses,
  brandMediaData,
  capsuleCollections,
  brandStatsByPeriod,
  brandMedalsByPeriod,
  quizResults,
  retailStores,
} from '../_fixtures/mock-data';

export function useBrandProfile(params: any, isPreview: boolean, initialDisplaySettings?: any) {
  const unwrappedParams = params && typeof params.then === 'function' ? use(params) : params;
  const brandId = isPreview ? 'syntha' : unwrappedParams.brandId;
  const { user } = useUIState();
  const { toast } = useToast();

  const [brand, setBrand] = useState<Brand | null | undefined>(undefined);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const purchasedProducts = useMemo(() => {
    return brandProducts.slice(0, 2);
  }, [brandProducts]);

  const [displaySettings, setDisplaySettings] = useState(initialDisplaySettings || defaultSettings);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [currentStoryList, setCurrentStoryList] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<ImagePlaceholder | null>(null);
  const [isLivePlayerOpen, setIsLivePlayerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ImagePlaceholder | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isRetailerMapOpen, setIsRetailerMapOpen] = useState(false);
  const [activeTopAudience, setActiveTopAudience] = useState('Все');
  const [activeTopCatalog, setActiveTopCatalog] = useState('marketplace');
  const [activeCapsule, setActiveCapsule] = useState<string | null>(null);
  const [filterAvailability, setFilterAvailability] = useState<string[]>(['in_stock', 'pre_order']);
  const [isAiSizeDialogOpen, setIsAiSizeDialogOpen] = useState(false);
  const [waitlistItems, setWaitlistItems] = useState<number[]>([]);

  const handleWaitlist = (productId: number) => {
    if (!waitlistItems.includes(productId)) {
      setWaitlistItems((prev) => [...prev, productId]);
      toast({
        title: 'Добавлено в лист ожидания',
        description: 'Мы сообщим вам первым, когда товар появится в наличии.',
      });
    }
  };

  const [isFollowed, setIsFollowed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState<'month' | '6months' | 'year' | 'all'>('month');
  const [isBrandReviewsOpen, setIsBrandReviewsOpen] = useState(false);
  const [reviewSort, setReviewSort] = useState<'new' | 'positive' | 'negative'>('new');
  const [isQuizResultsOpen, setIsQuizResultsOpen] = useState(false);
  const [isRetailerListOpen, setIsRetailerOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [isShareLookOpen, setIsShareLookOpen] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageCategory, setMessageCategory] = useState<string>('');
  const [messageLink, setMessageLink] = useState('');

  const displayName = useMemo(() => {
    if (!brand) return brandId;
    return displaySettings && displaySettings.nameRU && brand.nameRU ? brand.nameRU : brand.name;
  }, [brand, displaySettings, brandId]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      toast({
        title: 'Сообщение отправлено',
        description: `Ваше сообщение (${messageCategory}) для ${displayName} успешно отправлено. ${messageLink ? 'Файлы/ссылки прикреплены.' : ''}`,
      });
      setMessageText('');
      setMessageLink('');
      setIsMessageDialogOpen(false);
    }
  };

  const [b2bPartnerStatus, setB2bPartnerStatus] = useState<
    'none' | 'pending' | 'friend' | 'active' | 'spot'
  >('none');

  const handleB2bRegistration = () => {
    if (b2bPartnerStatus === 'none') {
      setB2bPartnerStatus('pending');
      toast({
        title: 'Запрос отправлен',
        description: `Ваш запрос на партнерство с ${displayName} отправлен. После подтверждения вы сможете войти в B2B кабинет.`,
      });
    } else {
      toast({
        title: 'B2B Кабинет',
        description: 'Перенаправление в защищенный раздел для партнеров...',
      });
    }
  };

  const handleEventRegistration = (eventId: number, type: string) => {
    if (!registeredEvents.includes(eventId)) {
      setRegisteredEvents((prev) => [...prev, eventId]);
      toast({
        title: type === 'Мероприятие' ? 'Вы записаны!' : 'Запрос отправлен!',
        description:
          type === 'Мероприятие'
            ? 'Мы ждем вас в указанное время. Детали отправлены в ваш кабинет.'
            : 'Бренд рассмотрит вашу заявку и отправит приглашение в личные сообщения.',
      });
    }
  };

  const [currentTeamIdx, setCurrentTeamIdx] = useState(0);
  const [sentB2bRequests, setSentB2bRequests] = useState<string[]>([]);

  const handleB2bRequest = (type: string) => {
    if (!sentB2bRequests.includes(type)) {
      setSentB2bRequests((prev) => [...prev, type]);
    }
  };

  const [animatedFollowers, setAnimatedFollowers] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const prevFollowersRef = useRef(animatedFollowers);

  useEffect(() => {
    if (brand?.followers) {
      setAnimatedFollowers(brand.followers);
    }
  }, [brand]);

  useEffect(() => {
    if (animatedFollowers > prevFollowersRef.current && prevFollowersRef.current !== 0) {
      setShowFireworks(true);
      const timer = setTimeout(() => setShowFireworks(false), 1000);
      prevFollowersRef.current = animatedFollowers;
      return () => clearTimeout(timer);
    }
    prevFollowersRef.current = animatedFollowers;
  }, [animatedFollowers]);

  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [isStatusesDialogOpen, setIsStatusesDialogOpen] = useState(false);
  const [mediaPeriod, setMediaPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeMediaTab, setActiveMediaTab] = useState('all');

  const [selectedVideo, setSelectedStoryVideo] = useState<any>(null);
  const [selectedMention, setSelectedMention] = useState<any>(null);
  const [selectedSocial, setSelectedSocial] = useState<any>(null);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [selectedPress, setSelectedPress] = useState<any>(null);
  const [isPressKitOpen, setIsPressKitOpen] = useState(false);
  const [isLiveReminderSet, setIsLiveReminderOpen] = useState(false);
  const [liveReminderTime, setLiveReminderTime] = useState('5');

  const activeStatuses = useMemo(() => brandStatuses.filter((s) => s.active), []);
  const potentialStatuses = useMemo(() => brandStatuses.filter((s) => !s.active), []);

  useEffect(() => {
    if (activeStatuses.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentStatusIndex((prev) => (prev + 1) % activeStatuses.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeStatuses]);

  useEffect(() => {
    let cancelled = false;
    const timeout =
      typeof window !== 'undefined'
        ? window.setTimeout(() => {
            if (!cancelled) setLoading(false);
          }, 3000)
        : undefined;

    async function fetchData() {
      setLoading(true);
      try {
        const foundBrand =
          brands.find(
            (b) =>
              b.slug === brandId ||
              b.slug?.toLowerCase() === brandId?.toLowerCase() ||
              b.slug?.includes?.(brandId) ||
              b.id?.includes?.(brandId)
          ) ?? brands[0];
        if (cancelled) return;
        setBrand(foundBrand ?? null);

        if (foundBrand) {
          try {
            const response = await fetch('/data/products.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const productsData = (await response.json()) as Product[];
            if (!cancelled && Array.isArray(productsData)) {
              setAllProducts(productsData);
              const foundProducts = productsData.filter((p) => p.brand === foundBrand.name);
              setBrandProducts(foundProducts);
            }
          } catch (error) {
            console.warn('Failed to fetch products for brand page:', error);
            if (!cancelled) {
              setAllProducts([]);
              setBrandProducts([]);
            }
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [brandId]);

  const handleOpenStory = useCallback((story: any, list: any[]) => {
    setSelectedStory(story);
    setCurrentStoryList(list);
    setIsStoryViewerOpen(true);
  }, []);

  const currentBrandStats = useMemo(() => {
    return brandStatsByPeriod[statsPeriod] || [];
  }, [statsPeriod]);

  const [isUpgradeRequested, setIsUpgradeRequested] = useState(false);

  return {
    user,
    brand,
    brandProducts,
    allProducts,
    loading,
    purchasedProducts,
    displaySettings,
    setDisplaySettings,
    isStoryViewerOpen,
    setIsStoryViewerOpen,
    currentStoryList,
    selectedStory,
    isLivePlayerOpen,
    setIsLivePlayerOpen,
    selectedEvent,
    setSelectedEvent,
    viewMode,
    setViewMode,
    isReviewsOpen,
    setIsReviewsOpen,
    isRetailerMapOpen,
    setIsRetailerMapOpen,
    activeTopAudience,
    setActiveTopAudience,
    activeTopCatalog,
    setActiveTopCatalog,
    activeCapsule,
    setActiveCapsule,
    filterAvailability,
    setFilterAvailability,
    isAiSizeDialogOpen,
    setIsAiSizeDialogOpen,
    waitlistItems,
    handleWaitlist,
    isFollowed,
    setIsFollowed,
    isFavorite,
    setIsFavorite,
    isStatsDialogOpen,
    setIsStatsDialogOpen,
    statsPeriod,
    setStatsPeriod,
    currentBrandStats,
    brandMedalsByPeriod,
    isBrandReviewsOpen,
    setIsBrandReviewsOpen,
    reviewSort,
    setReviewSort,
    isQuizResultsOpen,
    setIsQuizResultsOpen,
    quizResults,
    isUpgradeRequested,
    setIsUpgradeRequested,
    isRetailerListOpen,
    setIsRetailerOpen,
    retailStores,
    isTeamOpen,
    setIsTeamOpen,
    isShareLookOpen,
    setIsShareLookOpen,
    registeredEvents,
    isMessageDialogOpen,
    setIsMessageDialogOpen,
    messageText,
    setMessageText,
    messageCategory,
    setMessageCategory,
    messageLink,
    setMessageLink,
    handleSendMessage,
    displayName,
    b2bPartnerStatus,
    setB2bPartnerStatus,
    handleB2bRegistration,
    handleEventRegistration,
    currentTeamIdx,
    setCurrentTeamIdx,
    sentB2bRequests,
    handleB2bRequest,
    animatedFollowers,
    setAnimatedFollowers,
    showFireworks,
    currentStatusIndex,
    isStatusesDialogOpen,
    setIsStatusesDialogOpen,
    mediaPeriod,
    setMediaPeriod,
    selectedDate,
    setSelectedDate,
    activeMediaTab,
    setActiveMediaTab,
    selectedVideo,
    setSelectedStoryVideo,
    selectedMention,
    setSelectedMention,
    selectedSocial,
    setSelectedSocial,
    selectedBlog,
    setSelectedBlog,
    selectedPress,
    setSelectedPress,
    isPressKitOpen,
    setIsPressKitOpen,
    isLiveReminderSet,
    setIsLiveReminderOpen,
    liveReminderTime,
    setLiveReminderTime,
    handleOpenStory,
    activeStatuses,
    potentialStatuses,
    brandReviews: {
      average: 4.8,
      count: 245,
      quotes: [
        'Невероятное качество и внимание к деталям. Лучший свитер, что у меня был!',
        'Очень современный и продуманный дизайн. Вещи, которые хочется носить годами.',
      ],
    },
    storefrontSettings: brand?.storefrontSettings || {
      showPhilosophy: true,
      showTechnology: true,
      showESG: true,
      showReviews: true,
      showBehindTheScenes: true,
      showBlog: true,
      showEvents: true,
      showSocialMentions: true,
      showLiveShopping: true,
      showActivePromo: true,
    },
    brandActivePromo: brand?.activePromo,
  };
}
