'use client';

import {
  User,
  Ruler,
  Smartphone,
  MapPin,
  Palette,
  ShieldCheck,
  Zap,
  Sparkles,
  Brain,
  Target,
  Heart,
  Eye,
  ShoppingBag,
  Trophy,
  Activity,
  Fingerprint,
  Info,
  ArrowRight,
  Check,
  Clock,
  Scale,
  Truck,
  Undo2,
  Star,
  Share2,
  Plus,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import ProfileForm from '@/components/user/profile-form';
import LoyaltyCard from '@/components/user/loyalty-card';

interface ProfileTabProps {
  profileSubTab: string;
  setProfileSubTab: (
    v: 'profile' | 'familySync' | 'measurements' | 'productPrefs' | 'audit'
  ) => void;
  user: any;
}

export function ProfileTab({ profileSubTab, setProfileSubTab, user }: ProfileTabProps) {
  const profileData = {
    body: { height: '172 см', weight: '60 кг', type: 'Песочные часы', confidence: 98 },
    interests: {
      categories: ['Minimalism', 'Quiet Luxury', 'Techwear'],
      brands: ['Nordic Wool', 'Syntha Lab', 'Studio 29'],
      colors: ['#000000', '#F6F2EC', '#C9B9A6'],
    },
    styleDNA: {
      primary: 'Minimalism',
      secondary: 'Heritage',
      match: 94,
    },
  };

  return (
    <TabsContent value="profile" className="py-0 duration-300 animate-in fade-in-50">
      <div className="space-y-4">
        <Tabs value={profileSubTab} onValueChange={(v) => setProfileSubTab(v as any)}>
          {/* cabinetSurface v1 */}
          <TabsList className={cn(cabinetSurface.tabsList, 'w-full flex-wrap shadow-inner')}>
            {[
              { value: 'profile', icon: User, label: 'Профиль' },
              { value: 'measurements', icon: Ruler, label: 'Биометрия' },
              { value: 'familySync', icon: Users, label: 'Семья' },
              { value: 'productPrefs', icon: Palette, label: 'Предпочтения' },
              { value: 'audit', icon: Activity, label: 'Аудит' },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'data-[state=active]:text-accent-primary h-7 gap-2 px-3 text-[9px]'
                )}
              >
                <t.icon className="h-3.5 w-3.5 shrink-0" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {profileSubTab === 'profile' && (
          <div className="space-y-4">
            {/* Welcome & Loyalty Overview */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-8">
                <div className="border-border-subtle bg-bg-surface hover:border-border-subtle space-y-4 rounded-xl border p-4 shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-text-primary font-headline text-base font-bold uppercase leading-none tracking-tighter">
                          {user?.displayName || 'Профиль личности'}
                        </h2>
                        <Badge
                          variant="outline"
                          className="h-4 gap-1 border-emerald-100 bg-emerald-50 px-1.5 text-[7px] font-bold uppercase tracking-widest text-emerald-600 shadow-sm transition-all"
                        >
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />{' '}
                          SYNCED: ACTIVE
                        </Badge>
                      </div>
                      <p className="text-text-muted text-[11px] font-bold uppercase tracking-tight opacity-70">
                        Digital Identity Core synchronized with Syntha Neural Engine.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="border-border-subtle bg-bg-surface2 space-y-1 rounded-lg border px-3 py-1.5 shadow-inner">
                      <p className="text-text-muted text-[7px] font-bold uppercase leading-none tracking-widest">
                        Last Core Sync
                      </p>
                      <p className="text-text-primary text-[10px] font-bold uppercase">
                        Today, 12:45
                      </p>
                    </div>
                    <div className="border-border-subtle bg-bg-surface2 space-y-1 rounded-lg border px-3 py-1.5 shadow-inner">
                      <p className="text-text-muted text-[7px] font-bold uppercase leading-none tracking-widest">
                        Neural Precision
                      </p>
                      <p className="text-[10px] font-bold uppercase text-emerald-600">
                        98.4% Verified
                      </p>
                    </div>
                  </div>
                </div>
                <LoyaltyCard />
              </div>

              {/* Style DNA Widget */}
              <Card className="border-border-subtle bg-text-primary text-text-inverse group relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 shadow-xl lg:col-span-4">
                <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity duration-700 group-hover:opacity-10">
                  <Fingerprint className="h-32 w-32 rotate-12" />
                </div>
                <div className="relative z-10 space-y-1.5">
                  <div className="mb-4 flex items-center justify-between">
                    <Badge className="bg-accent-primary text-text-inverse h-4 border-none px-2 text-[7px] font-bold uppercase tracking-widest shadow-lg">
                      Neural_Core
                    </Badge>
                    <Sparkles className="text-accent-primary h-3.5 w-3.5" />
                  </div>
                  <h4 className="text-sm font-bold uppercase italic leading-none tracking-tighter text-white">
                    Identity Style DNA
                  </h4>
                  <p className="text-text-inverse/60 text-[10px] font-bold uppercase italic leading-relaxed tracking-tight">
                    Unique stylistic imprint calculated across 124 biometric parameters.
                  </p>
                </div>

                <div className="relative z-10 space-y-4 py-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-white">{profileData.styleDNA.primary}</span>
                      <span className="text-accent-primary italic">
                        {profileData.styleDNA.match}% Precision
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/5 shadow-inner">
                      <div
                        className="bg-accent-primary h-full shadow-[0_0_8px_rgba(0,0,0,0.12)] transition-all duration-1000"
                        style={{ width: `${profileData.styleDNA.match}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profileData.interests.categories.map((c) => (
                      <Badge
                        key={c}
                        className="h-3.5 border border-white/10 bg-white/5 px-1.5 text-[7px] font-bold uppercase tracking-widest shadow-sm"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="bg-bg-surface text-text-primary hover:bg-accent-primary hover:text-text-inverse relative z-10 h-8 w-full rounded-lg border-none text-[9px] font-bold uppercase tracking-widest shadow-lg transition-all">
                  Broadcast DNA <Share2 className="ml-2 h-3 w-3" />
                </Button>
              </Card>
            </div>

            {/* Measurements & Details Row */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Card className="border-border-subtle bg-bg-surface hover:border-border-subtle group space-y-4 rounded-xl border p-3 shadow-sm transition-all">
                <div className="border-border-subtle flex items-center justify-between border-b px-1 pb-2.5">
                  <h3 className="text-text-secondary flex items-center gap-2 text-[10px] font-bold uppercase italic tracking-widest">
                    <Ruler className="text-accent-primary h-3.5 w-3.5" /> Биометрический профиль
                  </h3>
                  <div className="bg-accent-primary h-1.5 w-1.5 animate-pulse rounded-full" />
                </div>
                <div className="space-y-3 px-1">
                  {[
                    { label: 'Height Index', val: profileData.body.height },
                    { label: 'Mass Index', val: profileData.body.weight },
                    { label: 'Anatomy Type', val: profileData.body.type },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className="group/item hover:border-border-subtle hover:bg-bg-surface2 flex items-center justify-between rounded-lg border border-transparent p-2 transition-all"
                    >
                      <span className="text-text-muted group-hover/item:text-accent-primary text-[9px] font-bold uppercase tracking-[0.15em] transition-colors">
                        {m.label}
                      </span>
                      <span className="text-text-primary text-xs font-bold uppercase tabular-nums tracking-tight">
                        {m.val}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="text-text-muted hover:bg-bg-surface2 hover:text-accent-primary h-7 w-full text-[8px] font-bold uppercase tracking-widest transition-all"
                  onClick={() => setProfileSubTab('measurements')}
                >
                  Update Biometrics <ArrowRight className="ml-1.5 h-3 w-3" />
                </Button>
              </Card>

              <Card className="border-border-subtle bg-bg-surface hover:border-border-subtle group space-y-4 rounded-xl border p-3 shadow-sm transition-all">
                <div className="border-border-subtle flex items-center justify-between border-b px-1 pb-2.5">
                  <h3 className="text-text-secondary flex items-center gap-2 text-[10px] font-bold uppercase italic tracking-widest">
                    <Palette className="text-accent-primary h-3.5 w-3.5" /> Chromatic Matrix
                  </h3>
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                </div>
                <div className="flex flex-wrap gap-2 px-1 pt-1">
                  {profileData.interests.colors.map((color) => (
                    <div
                      key={color}
                      className="ring-border-subtle h-8 w-8 cursor-pointer rounded-lg border-2 border-white shadow-md ring-1 transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="border-border-subtle text-text-muted hover:border-accent-primary hover:text-accent-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-all">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="text-text-muted px-1 text-[9px] font-bold uppercase italic leading-relaxed tracking-tight opacity-70">
                  Neural-optimized palette with 85% success probability for your genotype.
                </p>
              </Card>

              <Card className="border-border-subtle bg-bg-surface hover:border-border-subtle group space-y-4 rounded-xl border p-3 shadow-sm transition-all">
                <div className="border-border-subtle flex items-center justify-between border-b px-1 pb-2.5">
                  <h3 className="text-text-secondary flex items-center gap-2 text-[10px] font-bold uppercase italic tracking-widest">
                    <ShieldCheck className="text-accent-primary h-3.5 w-3.5" /> Security Protocol
                  </h3>
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                </div>
                <div className="space-y-2 px-1">
                  {[
                    { label: 'FaceID Sync', icon: Smartphone, status: 'Active' },
                    { label: 'Geo_Targeting', icon: MapPin, status: 'Active' },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="group/item border-border-subtle bg-bg-surface2 hover:border-border-subtle hover:bg-bg-surface flex items-center justify-between rounded-lg border p-2 shadow-inner transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <s.icon className="text-text-muted group-hover/item:text-accent-primary h-3 w-3 transition-colors" />
                        <span className="text-text-primary text-[9px] font-bold uppercase tracking-tight">
                          {s.label}
                        </span>
                      </div>
                      <Badge className="h-3 border border-emerald-100 bg-emerald-50 px-1 text-[6px] font-bold uppercase tracking-widest text-emerald-600 shadow-sm transition-all">
                        {s.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="border-border-subtle text-text-muted hover:text-text-primary h-7 w-full border text-[8px] font-bold uppercase tracking-widest shadow-sm transition-all"
                >
                  Панель приватности
                </Button>
              </Card>
            </div>
          </div>
        )}

        <ProfileForm
          user={user}
          section={
            profileSubTab as 'profile' | 'measurements' | 'familySync' | 'productPrefs' | 'audit'
          }
        />
      </div>
    </TabsContent>
  );
}
