'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useSearchParamsNonNull } from '@/hooks/use-search-params-non-null';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';
import Image from 'next/image';
import { useUIState } from '@/providers/ui-state';
import { useAuth } from '@/providers/auth-provider';
import { SYNTH_MOCK_KNOWN_PASSWORD } from '@/lib/auth/dev-auth-bootstrap';
import { useUserActivity } from '@/hooks/use-user-activity';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import {
  DEFAULT_USER_SETTINGS,
  USER_SETTINGS_UPDATED_EVENT,
  readUserSettings,
  writeUserSettings,
} from '@/lib/user-settings';
import AIDashboard from '@/components/user/ai-dashboard';
import LoyaltyCard from '@/components/user/loyalty-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
  Line,
  LineChart,
  Legend,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

import LookboardCard from '@/components/lookboard-card';
import { lookboards } from '@/lib/lookboards';
import {
  KeyMetrics,
  CustomerProfileCard,
  BehaviorCharts,
  ActivityFeed,
} from '@/components/customer-360';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickStatsCard } from '@/components/user/shared/quick-stats-card';
import { EmptyState } from '@/components/user/shared/empty-state';
import UnifiedAchievements from '@/components/user/unified-achievements';
import ProfileForm from '@/components/user/profile-form';
import SettingsForm from '@/components/user/settings-form';
import SavedComparisons from '@/components/user/saved-comparisons';
import { WardrobePageContent } from './wardrobe/wardrobe-page-content';
import { PaymentsPageContent } from './payments/payments-page-content';
import { MyPreorders } from '@/components/user/my-preorders';
import StyleCalendar from '@/components/user/style-calendar';
import AdvancedAnalytics from '@/components/user/advanced-analytics';
import VirtualWardrobe from '@/components/user/virtual-wardrobe';
import AutomatedInsightsPanel from '@/components/user/automated-insights-panel';
import PredictiveAnalytics from '@/components/user/predictive-analytics';
import EnhancedDataVisualization from '@/components/user/enhanced-data-visualization';
import OrderTracking from '@/components/user/order-tracking';
import MyReviews from '@/components/user/my-reviews';
import ReferralProgram from '@/components/user/referral-program';
import PriceAlerts from '@/components/user/price-alerts';
import ActivityTracker from '@/components/user/activity-tracker';
import { useUserOrders } from '@/hooks/use-user-orders';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Crown as CrownIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Copy, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { clientMeNuOrderShell } from '@/lib/ui/client-me-nuorder-shell';
import { UserCabinetLayout } from './_components/UserCabinetLayout';
import { UserCabinetTabsBar } from './_components/UserCabinetTabsBar';
import { DashboardTab } from './_components/DashboardTab';
import { MyLooksTab } from './_components/MyLooksTab';
import { Analytics360Tab } from './_components/Analytics360Tab';
import { CareerTab } from './_components/CareerTab';
import { ClientMeMainGroupStrip } from './_components/ClientMeMainGroupStrip';
import {
  parseClientMeTabParam,
  sectionToGroup,
  getSubTabsForGroup,
  GROUP_DEFAULT_SECTION,
  type ClientMeMainGroup,
  type ClientMeSectionId,
} from './_components/client-me-tab-model';

// --- Helper Components for Recommendations ---

function UserProfileContent() {
  const { user: uiUser, preOrders } = useUIState();
  const { user, loading, signIn } = useAuth();
  const activity = useUserActivity();
  const { stats: orderStats } = useUserOrders();
  const router = useRouter();
  const pathname = usePathname() ?? '/client/me';
  const searchParams = useSearchParamsNonNull();
  const [userSettings, setUserSettings] = useState(() => readUserSettings());
  const [profileSubTab, setProfileSubTab] = useState<
    'profile' | 'familySync' | 'measurements' | 'productPrefs' | 'audit'
  >('profile');
  const [overviewSubTab, setOverviewSubTab] = useState<
    'analytics' | 'ai' | 'activity' | 'recommendations'
  >('analytics');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'week' | 'month' | 'year' | 'custom'>(
    'month'
  );

  // Recommendations state
  const [recommendationOfferTab, setRecommendationOfferTab] = useState<'active' | 'archive'>(
    'active'
  );
  const [offerFilterBrand, setOfferFilterBrand] = useState<string>('all');
  const [offerFilterType, setOfferFilterType] = useState<string>('all');
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => setUserSettings(readUserSettings());
    sync();
    window.addEventListener(USER_SETTINGS_UPDATED_EVENT, sync);
    return () => window.removeEventListener(USER_SETTINGS_UPDATED_EVENT, sync);
  }, []);

  const tabCounts = {
    looks: activity.lookboardsCount,
    wardrobe: activity.wishlistCount,
    preorders: (preOrders || []).length,
    comparisons: 0,
    achievements: 0,
    payments: activity.loyaltyPoints,
  };

  const section = parseClientMeTabParam(searchParams.get('tab'));
  const group = sectionToGroup(section);
  const subTabs = getSubTabsForGroup(group, tabCounts);

  const setSection = (s: ClientMeSectionId) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('tab', s);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const setGroup = (g: ClientMeMainGroup) => {
    setSection(GROUP_DEFAULT_SECTION[g]);
  };

  // Auto-login as full client if not logged in
  useEffect(() => {
    if (!loading && !user) {
      const autoLogin = async () => {
        try {
          // Only clear auth user, not users database
          if (typeof window !== 'undefined') {
            localStorage.removeItem('syntha_auth_user');
            // Ensure users are initialized
            const usersKey = 'syntha_users';
            if (!localStorage.getItem(usersKey)) {
              // Users will be initialized in getUsers()
            }
          }
          await signIn('elena.petrova@example.com', SYNTH_MOCK_KNOWN_PASSWORD);
        } catch (error) {
          console.error('Auto-login failed:', error);
          // Retry after a short delay
          setTimeout(() => {
            signIn('elena.petrova@example.com', SYNTH_MOCK_KNOWN_PASSWORD).catch(console.error);
          }, 1000);
        }
      };
      autoLogin();
    } else if (user && user.email !== 'elena.petrova@example.com') {
      // If logged in as different user, switch to Elena Petrova
      const switchUser = async () => {
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('syntha_auth_user');
          }
          await signIn('elena.petrova@example.com', SYNTH_MOCK_KNOWN_PASSWORD);
        } catch (error) {
          console.error('Switch user failed:', error);
        }
      };
      switchUser();
    }
  }, [loading, user, signIn]);

  useEffect(() => {
    const t =
      typeof window !== 'undefined' ? window.setTimeout(() => setForceShow(true), 2000) : undefined;
    return () => {
      if (t) clearTimeout(t);
    };
  }, []);

  if (loading && !forceShow) {
    return (
      <ProfileSystemState
        title="Загрузка профиля"
        description="Подготавливаем персональные данные и рабочие вкладки."
      />
    );
  }

  if (!user) {
    return (
      <ProfileSystemState
        title="Требуется вход"
        description="Выполняем авторизацию и восстановление контекста профиля."
      />
    );
  }

  const displayUser = user || uiUser;
  const settings = userSettings || DEFAULT_USER_SETTINGS;
  const dashboardWidgets = settings.dashboard.widgets ?? DEFAULT_USER_SETTINGS.dashboard.widgets;
  const statOrder = (
    settings.dashboard.statsOrder?.length
      ? settings.dashboard.statsOrder
      : DEFAULT_USER_SETTINGS.dashboard.statsOrder
  ).filter((id) => settings.dashboard.statsEnabled[id]);
  const sideOrder = (
    settings.dashboard.sideWidgetsOrder?.length
      ? settings.dashboard.sideWidgetsOrder
      : DEFAULT_USER_SETTINGS.dashboard.sideWidgetsOrder
  ).filter((id) => settings.dashboard.sideWidgetsEnabled[id]);

  return (
    <UserCabinetLayout
      hideBreadcrumb
      title="Профиль клиента"
      description="Персональные данные, операционные вкладки и аналитика в едином рабочем контуре."
      actions={
        <>
          <Button variant="outline" size="sm" className="h-8">
            Экспорт профиля
          </Button>
          <Button size="sm" className="h-8">
            Редактировать
          </Button>
        </>
      }
    >
      <Tabs
        value={section}
        onValueChange={(v) => setSection(parseClientMeTabParam(v))}
        className="w-full"
      >
        <div className="space-y-2">
          <ClientMeMainGroupStrip activeGroup={group} onSelectGroup={setGroup} />
          {subTabs ? (
            <UserCabinetTabsBar scrollAreaTestId="user-cabinet-sub-tabs" tabs={subTabs} />
          ) : null}
        </div>

        <TabsContent value="dashboard" className={cabinetSurface.clientMeTabContent}>
          <DashboardTab
            overviewSubTab={overviewSubTab}
            setOverviewSubTab={setOverviewSubTab}
            analyticsPeriod={analyticsPeriod}
            setAnalyticsPeriod={setAnalyticsPeriod}
            recommendationOfferTab={recommendationOfferTab}
            setRecommendationOfferTab={setRecommendationOfferTab}
            offerFilterBrand={offerFilterBrand}
            setOfferFilterBrand={setOfferFilterBrand}
            offerFilterType={offerFilterType}
            setOfferFilterType={setOfferFilterType}
            user={displayUser}
            activity={activity}
            orderStats={orderStats}
          />
        </TabsContent>
        <TabsContent value="smart-wardrobe" className={cabinetSurface.clientMeTabContent}>
          <AIDashboard />
        </TabsContent>
        <TabsContent value="looks" className={cabinetSurface.clientMeTabContent}>
          <MyLooksTab />
        </TabsContent>
        <TabsContent value="wardrobe" className={cabinetSurface.clientMeTabContent}>
          <WardrobePageContent />
        </TabsContent>
        <TabsContent value="calendar" className={cabinetSurface.clientMeTabContent}>
          <StyleCalendar />
        </TabsContent>
        <TabsContent value="preorders" className={cabinetSurface.clientMeTabContent}>
          <MyPreorders />
        </TabsContent>
        <TabsContent value="comparisons" className={cabinetSurface.clientMeTabContent}>
          <SavedComparisons />
        </TabsContent>
        <TabsContent value="achievements" className={cabinetSurface.clientMeTabContent}>
          <UnifiedAchievements />
        </TabsContent>
        <TabsContent value="payments" className={cabinetSurface.clientMeTabContent}>
          <PaymentsPageContent />
        </TabsContent>
        <TabsContent value="profile" className={cabinetSurface.clientMeTabContent}>
          <div className="space-y-4">
            <Tabs value={profileSubTab} onValueChange={(v) => setProfileSubTab(v as any)}>
              <TabsList className={cn(cabinetSurface.tabsList, 'w-full flex-wrap shadow-inner')}>
                <TabsTrigger
                  value="profile"
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'data-[state=active]:text-accent-primary'
                  )}
                >
                  Основные данные
                </TabsTrigger>
                <TabsTrigger
                  value="measurements"
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'data-[state=active]:text-accent-primary'
                  )}
                >
                  Параметры
                </TabsTrigger>
                <TabsTrigger
                  value="familySync"
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'data-[state=active]:text-accent-primary'
                  )}
                >
                  Семья
                </TabsTrigger>
                <TabsTrigger
                  value="productPrefs"
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'data-[state=active]:text-accent-primary'
                  )}
                >
                  Предпочтения
                </TabsTrigger>
                <TabsTrigger
                  value="audit"
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'data-[state=active]:text-accent-primary'
                  )}
                >
                  История
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {profileSubTab === 'profile' && (
              <div className="space-y-4">
                <div className="duration-500 animate-in fade-in slide-in-from-top-4">
                  <h2 className="text-text-primary text-xl font-black uppercase tracking-tight md:text-2xl">
                    Добро пожаловать, {displayUser?.displayName?.split(' ')[0] || 'Елена'}!
                  </h2>
                  <p className="text-text-secondary text-sm font-medium md:text-base">
                    Рады видеть вас снова. Вот актуальное состояние вашего профиля.
                  </p>
                </div>
                <LoyaltyCard />
              </div>
            )}

            <ProfileForm user={displayUser} section={profileSubTab} />
          </div>
        </TabsContent>
        <TabsContent value="analytics" className={cabinetSurface.clientMeTabContent}>
          <div className="space-y-4">
            <EnhancedDataVisualization />
            <AutomatedInsightsPanel />
            <PredictiveAnalytics />
            <Analytics360Tab user={displayUser} />
            <AdvancedAnalytics />
          </div>
        </TabsContent>
        <TabsContent value="tracking" className={cabinetSurface.clientMeTabContent}>
          <OrderTracking />
        </TabsContent>
        <TabsContent value="reviews" className={cabinetSurface.clientMeTabContent}>
          <MyReviews />
        </TabsContent>
        <TabsContent value="referrals" className={cabinetSurface.clientMeTabContent}>
          <ReferralProgram />
        </TabsContent>
        <TabsContent value="career" className={cabinetSurface.clientMeTabContent}>
          <CareerTab user={displayUser} />
        </TabsContent>
        <TabsContent value="price-alerts" className={cabinetSurface.clientMeTabContent}>
          <PriceAlerts />
        </TabsContent>
        <TabsContent value="settings" className={cabinetSurface.clientMeTabContent}>
          <SettingsForm user={displayUser} />
        </TabsContent>
      </Tabs>
    </UserCabinetLayout>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense
      fallback={
        <ProfileSystemState
          title="Загрузка профиля"
          description="Подготавливаем пользовательский интерфейс."
        />
      }
    >
      <UserProfileContent />
    </Suspense>
  );
}

function ProfileSystemState({ title, description }: { title: string; description: string }) {
  return (
    <CabinetPageContent maxWidth="full" className="space-y-3 px-0 py-2 pb-16">
      <div className={clientMeNuOrderShell.canvas} data-testid="client-me-nuorder-shell-loading">
        <Card className="border-[#c5ccd6] bg-white shadow-none">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-base font-semibold text-[#1a2433]">{title}</p>
            <p className="max-w-xl text-sm text-[#5b6675]">{description}</p>
          </CardContent>
        </Card>
      </div>
    </CabinetPageContent>
  );
}
