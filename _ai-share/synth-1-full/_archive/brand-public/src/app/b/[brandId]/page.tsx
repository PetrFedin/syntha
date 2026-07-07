'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import { notFound } from 'next/navigation';
import { useBrandProfile } from './hooks/useBrandProfile';
import { useProductFilters } from './hooks/use-product-filters';
import { measurementLabels, brandMediaData, capsuleCollections } from './_fixtures/mock-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Components
import { BrandHeader } from './_components/BrandHeader';
import { AboutTab } from './_components/tabs/AboutTab';
import { ProductsTab } from './_components/tabs/ProductsTab';
import { MediaTab } from './_components/tabs/MediaTab';
import { PartnershipTab } from './_components/tabs/PartnershipTab';
import { DigitalProductPassport } from '@/components/product/digital-passport';
import { RetailerDialog } from './_components/RetailerDialog';
import { Fireworks } from './_components/Fireworks';
import { ProductReviewsDialog } from '@/components/product-reviews-dialog';
import StoryViewer from '@/components/story-viewer';
import LivePlayer from '@/components/live-player';
import { MessageDialog } from './_components/MessageDialog';
import { BrandDialogs } from './_components/BrandDialogs';

// UI
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

// Types
import type { ImagePlaceholder } from '@/lib/types';

interface BrandProfilePageProps {
  params: Promise<{ brandId: string }>;
  isPreview?: boolean;
  displaySettings?: Record<string, boolean>;
}

export default function BrandProfilePage({
  params,
  isPreview = false,
  displaySettings: initialDisplaySettings,
}: BrandProfilePageProps) {
  const resolvedParams = React.use(params);
  const {
    brand,
    brandProducts,
    loading,
    displaySettings,
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
    isRetailerMapOpen,
    setIsRetailerMapOpen,
    isAiSizeDialogOpen,
    setIsAiSizeDialogOpen,
    activeTopAudience,
    setActiveTopAudience,
    activeTopCatalog,
    setActiveTopCatalog,
    activeCapsule,
    setActiveCapsule,
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
    animatedFollowers,
    setAnimatedFollowers,
    showFireworks,
    currentStatusIndex,
    isStatusesDialogOpen,
    setIsStatusesDialogOpen,
    handleOpenStory,
    activeStatuses,
    potentialStatuses,
    handleWaitlist,
    waitlistItems,
    handleB2bRequest,
    sentB2bRequests,
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
    brandReviews,
    storefrontSettings,
    brandActivePromo,
    isQuizResultsOpen,
    setIsQuizResultsOpen,
    quizResults,
    isUpgradeRequested,
    setIsUpgradeRequested,
    user,
    purchasedProducts,
  } = useBrandProfile(resolvedParams, isPreview, initialDisplaySettings);

  const {
    activeAudience,
    setActiveAudience,
    filterOutlet,
    setFilterOutlet,
    filterCategory,
    setFilterCategory,
    filterColor,
    setFilterColor,
    filterSizes,
    setFilterSizes,
    filterAttributes,
    setFilterAttributes,
    filterAvailability,
    setFilterAvailability,
    isFilterSidebarOpen,
    setIsFilterSidebarOpen,
    filteredProducts,
    categoriesData,
    colorsData,
    attributesData,
    activeSizeChart,
    setActiveSizeChart,
    selectedSizeRow,
    setSelectedSizeRow,
    filterSizeSystem,
    setFilterSizeSystem,
  } = useProductFilters(brandProducts);

  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('about');

  if (loading && !isPreview) {
    return (
      <CabinetPageContent maxWidth="6xl" className="py-4 md:py-4">
        <header className="mb-12 flex flex-col items-center gap-3 md:flex-row">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        </header>
        <div>
          <Skeleton className="mx-auto mb-8 h-10 w-1/3" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-[450px] w-full">
                <Skeleton className="h-full w-full" />
              </Card>
            ))}
          </div>
        </div>
      </CabinetPageContent>
    );
  }

  if (!brand) {
    if (isPreview) {
      return <div className="p-4 text-center text-muted-foreground">Загрузка предпросмотра...</div>;
    }
    notFound();
  }

  return (
    <div
      key="brand-profile-root"
      className={cn(!isPreview && 'mx-auto w-full max-w-6xl px-6 py-4 md:px-12 md:py-4')}
    >
      {showFireworks && <Fireworks />}

      <BrandHeader
        brand={brand}
        displaySettings={displaySettings}
        displayName={displayName}
        storyImages={[]}
        handleOpenStory={handleOpenStory}
        setIsBrandReviewsOpen={setIsBrandReviewsOpen}
        brandReviews={brandReviews}
        setIsStatsDialogOpen={setIsStatsDialogOpen}
        setIsStatusesDialogOpen={setIsStatusesDialogOpen}
        activeStatuses={activeStatuses}
        currentStatusIndex={currentStatusIndex}
        isFollowed={isFollowed}
        setIsFollowed={setIsFollowed}
        setAnimatedFollowers={setAnimatedFollowers}
        setIsMessageDialogOpen={setIsMessageDialogOpen}
        isFavorite={isFavorite}
        setIsFavorite={setIsFavorite}
        storefrontSettings={storefrontSettings}
        brandActivePromo={brandActivePromo}
        toast={toast}
      />

      <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="no-scrollbar mb-8 flex h-auto justify-start gap-2 overflow-x-auto bg-transparent p-0 pb-2">
          <TabsTrigger
            value="about"
            className="border-border-default hover:bg-bg-surface2 text-text-secondary h-9 rounded-xl border bg-white px-6 text-[11px] font-black uppercase tracking-wider shadow-sm transition-all data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            О бренде
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="border-border-default hover:bg-bg-surface2 text-text-secondary h-9 rounded-xl border bg-white px-6 text-[11px] font-black uppercase tracking-wider shadow-sm transition-all data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            Ассортимент ({filteredProducts.length})
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="border-border-default hover:bg-bg-surface2 text-text-secondary h-9 rounded-xl border bg-white px-6 text-[11px] font-black uppercase tracking-wider shadow-sm transition-all data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            Медиа
          </TabsTrigger>
          <TabsTrigger
            value="partnership"
            className="border-border-default hover:bg-bg-surface2 text-text-secondary h-9 rounded-xl border bg-white px-6 text-[11px] font-black uppercase tracking-wider shadow-sm transition-all data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            Сотрудничество
          </TabsTrigger>
          <TabsTrigger
            value="passport"
            className="border-border-default data-[state=active]:bg-accent-primary data-[state=active]:border-accent-primary hover:bg-bg-surface2 text-accent-primary h-9 rounded-xl border bg-white px-6 text-[11px] font-black uppercase tracking-wider shadow-sm transition-all data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            Цифровой паспорт
          </TabsTrigger>
        </TabsList>

        <AboutTab
          brand={brand}
          storefrontSettings={storefrontSettings}
          isTeamOpen={isTeamOpen}
          setIsTeamOpen={setIsTeamOpen}
          currentTeamIdx={currentTeamIdx}
          setCurrentTeamIdx={setCurrentTeamIdx}
          setIsRetailerMapOpen={setIsRetailerMapOpen}
          setIsRetailerOpen={setIsRetailerOpen}
          setIsShareLookOpen={setIsShareLookOpen}
        />

        <ProductsTab
          activeTopCatalog={activeTopCatalog}
          setActiveTopCatalog={setActiveTopCatalog}
          setFilterOutlet={setFilterOutlet}
          capsuleCollections={capsuleCollections}
          activeCapsule={activeCapsule}
          setActiveCapsule={setActiveCapsule}
          filterAvailability={filterAvailability}
          setFilterAvailability={setFilterAvailability}
          activeTopAudience={activeTopAudience}
          setActiveTopAudience={setActiveTopAudience}
          setActiveAudience={setActiveAudience}
          setFilterCategory={setFilterCategory}
          setFilterAttributes={setFilterAttributes}
          setFilterColor={setFilterColor}
          setFilterSizes={setFilterSizes}
          setSelectedSizeRow={setSelectedSizeRow}
          isFilterSidebarOpen={isFilterSidebarOpen}
          setIsFilterSidebarOpen={setIsFilterSidebarOpen}
          activeAudience={activeAudience}
          filterCategory={filterCategory}
          categoriesData={categoriesData}
          getAllowedCategories={[]}
          filterColor={filterColor}
          colorsData={colorsData}
          selectedSizeRow={selectedSizeRow}
          activeSizeChart={activeSizeChart}
          measurementLabels={measurementLabels}
          filterAttributes={filterAttributes}
          attributesData={attributesData}
          getAllowedAttributes={[]}
          filteredProducts={filteredProducts}
          viewMode={viewMode}
          setViewMode={setViewMode}
          setIsAiSizeDialogOpen={setIsAiSizeDialogOpen}
          displayName={displayName}
        />

        <MediaTab
          displayName={displayName}
          mediaPeriod={mediaPeriod}
          setMediaPeriod={setMediaPeriod}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          activeMediaTab={activeMediaTab}
          setActiveMediaTab={setActiveMediaTab}
          filteredMediaData={brandMediaData}
          storyImages={[]}
          handleOpenStory={handleOpenStory}
          setSelectedEvent={setSelectedEvent}
          setIsLivePlayerOpen={setIsLivePlayerOpen}
          setIsLiveReminderOpen={setIsLiveReminderOpen}
          handleEventRegistration={handleEventRegistration}
          registeredEvents={registeredEvents}
          setSelectedBlog={setSelectedBlog}
          setSelectedSocial={setSelectedSocial}
          setSelectedStoryVideo={setSelectedStoryVideo}
          setSelectedMention={setSelectedMention}
          setSelectedPress={setSelectedPress}
          setIsPressKitOpen={setIsPressKitOpen}
          toast={toast}
          setB2bPartnerStatus={setB2bPartnerStatus}
        />

        <PartnershipTab
          brand={brand}
          displayName={displayName}
          setMessageCategory={setMessageCategory}
          setIsMessageDialogOpen={setIsMessageDialogOpen}
          handleB2bRequest={handleB2bRequest}
          sentB2bRequests={sentB2bRequests}
          b2bPartnerStatus={b2bPartnerStatus}
          setB2bPartnerStatus={setB2bPartnerStatus}
          handleB2bRegistration={handleB2bRegistration}
          toast={toast}
        />

        <div
          className="mt-8 hidden data-[state=active]:block"
          data-state={activeTab === 'passport' ? 'active' : 'inactive'}
        >
          <DigitalProductPassport />
        </div>
      </Tabs>

      <BrandDialogs
        brand={brand}
        displayName={displayName}
        user={user}
        purchasedProducts={purchasedProducts}
        toast={toast}
        isStatsDialogOpen={isStatsDialogOpen}
        setIsStatsDialogOpen={setIsStatsDialogOpen}
        statsPeriod={statsPeriod}
        setStatsPeriod={setStatsPeriod}
        currentBrandStats={currentBrandStats}
        brandMedalsByPeriod={brandMedalsByPeriod}
        isBrandReviewsOpen={isBrandReviewsOpen}
        setIsBrandReviewsOpen={setIsBrandReviewsOpen}
        isStatusesDialogOpen={isStatusesDialogOpen}
        setIsStatusesDialogOpen={setIsStatusesDialogOpen}
        activeStatuses={activeStatuses}
        potentialStatuses={potentialStatuses}
        currentStatusIndex={currentStatusIndex}
        isAiSizeDialogOpen={isAiSizeDialogOpen}
        setIsAiSizeDialogOpen={setIsAiSizeDialogOpen}
        isPressKitOpen={isPressKitOpen}
        setIsPressKitOpen={setIsPressKitOpen}
        isLiveReminderSet={isLiveReminderSet}
        setIsLiveReminderOpen={setIsLiveReminderOpen}
        liveReminderTime={liveReminderTime}
        setLiveReminderTime={setLiveReminderTime}
        isShareLookOpen={isShareLookOpen}
        setIsShareLookOpen={setIsShareLookOpen}
        isQuizResultsOpen={isQuizResultsOpen}
        setIsQuizResultsOpen={setIsQuizResultsOpen}
        quizResults={quizResults}
        isUpgradeRequested={isUpgradeRequested}
        setIsUpgradeRequested={setIsUpgradeRequested}
        isRetailerListOpen={isRetailerListOpen}
        setIsRetailerOpen={setIsRetailerOpen}
        retailStores={retailStores}
        isTeamOpen={isTeamOpen}
        setIsTeamOpen={setIsTeamOpen}
        currentTeamIdx={currentTeamIdx}
        setCurrentTeamIdx={setCurrentTeamIdx}
      />

      {selectedStory && (
        <StoryViewer
          story={selectedStory as ImagePlaceholder}
          isOpen={isStoryViewerOpen}
          onOpenChange={setIsStoryViewerOpen}
        />
      )}

      {selectedEvent && (
        <LivePlayer
          event={selectedEvent as ImagePlaceholder}
          isOpen={isLivePlayerOpen}
          onOpenChange={setIsLivePlayerOpen}
          isLive={true}
        />
      )}

      <RetailerDialog
        isOpen={isRetailerMapOpen}
        onOpenChange={setIsRetailerMapOpen}
        brandName={displayName}
      />

      <MessageDialog
        isOpen={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        messageCategory={messageCategory}
        displayName={displayName}
        messageText={messageText}
        setMessageText={setMessageText}
        messageLink={messageLink}
        setMessageLink={setMessageLink}
        handleSendMessage={handleSendMessage}
      />

      {brandProducts.length > 0 && (
        <ProductReviewsDialog
          product={brandProducts[0]}
          isOpen={isBrandReviewsOpen}
          onOpenChange={setIsBrandReviewsOpen}
        />
      )}
    </div>
  );
}
