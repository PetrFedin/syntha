'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUIState } from '@/providers/ui-state';
import { useAuth } from '@/providers/auth-provider';
import { SYNTH_MOCK_KNOWN_PASSWORD } from '@/lib/auth/dev-auth-bootstrap';
import { useUserActivity } from '@/hooks/use-user-activity';
import { cn } from '@/lib/utils';
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
  Edit,
  User,
  Settings,
  Palette,
  BarChart2,
  Trophy,
  Scale,
  Shirt,
  CreditCard,
  Rocket,
  Calendar,
  ShoppingBag,
  Heart,
  Bell,
  Zap,
  Search,
  Briefcase,
  Truck,
  MessageSquare,
  Users,
  TrendingDown,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Camera,
  MoreHorizontal,
  Sparkles,
  Gift,
  TrendingUp,
  Gem,
  Info,
  ArrowRight,
  Fingerprint,
  Brain,
  Clock,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickStatsCard } from '@/components/user/shared/quick-stats-card';
import { EmptyState } from '@/components/user/shared/empty-state';
import UnifiedAchievements from '@/components/user/unified-achievements';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import ProfileForm from '@/components/user/profile-form';
import SettingsForm from '@/components/user/settings-form';
import SavedComparisons from '@/components/user/saved-comparisons';
import { WardrobePageContent } from '@/app/client/me/wardrobe/wardrobe-page-content';
import { PaymentsPageContent } from '@/app/client/me/payments/payments-page-content';
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

import { ProfileHeader } from './_components/ProfileHeader';
import { DashboardTab } from './_components/DashboardTab';
import { MyLooksTab } from './_components/MyLooksTab';
import { Analytics360Tab } from './_components/Analytics360Tab';
import { ProfilePreferences } from './_components/ProfilePreferences';
import { CareerTab } from './_components/CareerTab';

// --- Helper Components for Recommendations ---

function UserProfileContent() {
  const { user: uiUser, preOrders } = useUIState();
  const { user, loading, signIn } = useAuth();
  const activity = useUserActivity();
  const { stats: orderStats } = useUserOrders();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'dashboard';
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

  // Calculate counts for tabs using unified activity hook
  const tabCounts = {
    looks: activity.lookboardsCount,
    wardrobe: activity.wishlistCount,
    preorders: (preOrders || []).length,
    comparisons: 0, // Will be calculated
    achievements: 0, // Will be calculated
    payments: activity.loyaltyPoints,
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
    return <div className="container mx-auto px-4 py-12 text-center">Загрузка...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="mb-4">Вход в систему...</p>
      </div>
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
    <div className="min-h-screen bg-background">
      <ProfileHeader user={displayUser} />
      <div className="container mx-auto max-w-5xl px-4 py-3">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <Link href="/" className="transition-colors hover:text-indigo-600">
            Home
          </Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <span className="text-indigo-600">User Profile</span>
        </div>
        <Tabs defaultValue={defaultTab} className="w-full">
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="inline-flex h-9 w-auto rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
              {[
                { value: 'profile', icon: User, label: 'Profile' },
                { value: 'dashboard', icon: BarChart2, label: 'Overview' },
                {
                  value: 'smart-wardrobe',
                  icon: Sparkles,
                  label: 'AI Wardrobe',
                  iconColor: 'text-indigo-500',
                },
                { value: 'looks', icon: Palette, label: 'Lookboards', count: tabCounts.looks },
                { value: 'wardrobe', icon: Shirt, label: 'Inventory', count: tabCounts.wardrobe },
                { value: 'calendar', icon: Calendar, label: 'Planner' },
                {
                  value: 'preorders',
                  icon: Rocket,
                  label: 'Pre-orders',
                  count: tabCounts.preorders,
                },
                { value: 'comparisons', icon: Scale, label: 'Forge' },
                { value: 'achievements', icon: Trophy, label: 'Milestones' },
                {
                  value: 'payments',
                  icon: CreditCard,
                  label: 'Capital',
                  count: tabCounts.payments,
                  badgeVariant: 'default',
                },
                { value: 'analytics', icon: BarChart2, label: 'Intelligence' },
                { value: 'tracking', icon: Truck, label: 'Logistics' },
                { value: 'reviews', icon: MessageSquare, label: 'Insights' },
                { value: 'referrals', icon: Users, label: 'Network' },
                { value: 'career', icon: Briefcase, label: 'Professional' },
                { value: 'price-alerts', icon: TrendingDown, label: 'Market' },
                { value: 'settings', icon: Settings, label: 'Parameters' },
              ].map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="relative h-7 rounded-lg border-transparent px-4 text-[9px] font-bold uppercase tracking-widest transition-all data-[state=active]:border data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                >
                  <t.icon className={cn('mr-2 h-3.5 w-3.5', t.iconColor)} />
                  <span>{t.label}</span>
                  {t.count !== undefined && t.count > 0 && (
                    <Badge
                      variant={(t.badgeVariant as any) || 'secondary'}
                      className={cn(
                        'ml-2 flex h-4 min-w-[1rem] items-center justify-center border-none px-1 text-[7px] font-bold',
                        t.badgeVariant === 'default'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      )}
                    >
                      {t.count > 999 ? '999+' : t.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="dashboard" className="py-2 duration-300 animate-in fade-in-50">
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
          <TabsContent value="smart-wardrobe" className="py-6 duration-300 animate-in fade-in-50">
            <AIDashboard />
          </TabsContent>
          <TabsContent value="looks" className="py-6 duration-300 animate-in fade-in-50">
            <MyLooksTab />
          </TabsContent>
          <TabsContent value="wardrobe" className="py-6 duration-300 animate-in fade-in-50">
            <WardrobePageContent />
          </TabsContent>
          <TabsContent value="calendar" className="py-6 duration-300 animate-in fade-in-50">
            <StyleCalendar />
          </TabsContent>
          <TabsContent value="preorders" className="py-6 duration-300 animate-in fade-in-50">
            <MyPreorders />
          </TabsContent>
          <TabsContent value="comparisons" className="py-6 duration-300 animate-in fade-in-50">
            <SavedComparisons />
          </TabsContent>
          <TabsContent value="achievements" className="py-6 duration-300 animate-in fade-in-50">
            <UnifiedAchievements />
          </TabsContent>
          <TabsContent value="payments" className="py-6 duration-300 animate-in fade-in-50">
            <PaymentsPageContent />
          </TabsContent>
          <TabsContent value="profile" className="py-2 duration-300 animate-in fade-in-50">
            <div className="space-y-4">
              <Tabs value={profileSubTab} onValueChange={(v) => setProfileSubTab(v as any)}>
                <TabsList className="w-full flex-wrap justify-start bg-muted/50">
                  <TabsTrigger value="profile">Основные данные</TabsTrigger>
                  <TabsTrigger value="measurements">Параметры</TabsTrigger>
                  <TabsTrigger value="familySync">Семья</TabsTrigger>
                  <TabsTrigger value="productPrefs">Предпочтения</TabsTrigger>
                  <TabsTrigger value="audit">История</TabsTrigger>
                </TabsList>
              </Tabs>

              {profileSubTab === 'profile' && (
                <div className="space-y-4">
                  <div className="duration-500 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
                      Добро пожаловать, {displayUser?.displayName?.split(' ')[0] || 'Елена'}!
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground md:text-base">
                      Рады видеть вас снова. Вот актуальное состояние вашего профиля.
                    </p>
                  </div>
                  <LoyaltyCard />
                </div>
              )}

              <ProfileForm user={displayUser} section={profileSubTab} />
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="py-6 duration-300 animate-in fade-in-50">
            <div className="space-y-6">
              {/* Enhanced Data Visualization - Clear and comprehensive data */}
              <EnhancedDataVisualization />

              {/* Automated Insights - AI-powered insights */}
              <AutomatedInsightsPanel />

              {/* Predictive Analytics - Forecasts and Trends */}
              <PredictiveAnalytics />

              <Analytics360Tab user={displayUser} />
              <AdvancedAnalytics />
            </div>
          </TabsContent>
          <TabsContent value="tracking" className="py-6 duration-300 animate-in fade-in-50">
            <OrderTracking />
          </TabsContent>
          <TabsContent value="reviews" className="py-6 duration-300 animate-in fade-in-50">
            <MyReviews />
          </TabsContent>
          <TabsContent value="referrals" className="py-6 duration-300 animate-in fade-in-50">
            <ReferralProgram />
          </TabsContent>
          <TabsContent value="career" className="py-2 duration-300 animate-in fade-in-50">
            <CareerTab user={displayUser} />
          </TabsContent>
          <TabsContent value="price-alerts" className="py-6 duration-300 animate-in fade-in-50">
            <PriceAlerts />
          </TabsContent>
          <TabsContent value="settings" className="py-6 duration-300 animate-in fade-in-50">
            <SettingsForm user={displayUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense
      fallback={<div className="container mx-auto px-4 py-12 text-center">Загрузка профиля...</div>}
    >
      <UserProfileContent />
    </Suspense>
  );
}
