'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Instagram,
  Zap,
  Sparkles,
  ShieldCheck,
  Share2,
  Globe,
  TrendingUp,
  Users,
  Loader2,
} from 'lucide-react';
import { readUserSettings } from '@/lib/user-settings';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function ProfilePreferences({
  value,
  onChange,
}: {
  value: ReturnType<typeof readUserSettings>;
  onChange: (next: ReturnType<typeof readUserSettings>) => void;
}) {
  const settings = value;
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [syncedChannels, setSyncedChannels] = useState<string[]>(['instagram']);

  const handleSync = (channel: string) => {
    setIsSyncing(channel);
    setTimeout(() => {
      setSyncedChannels([...syncedChannels, channel]);
      setIsSyncing(null);
      toast({
        title: 'Social Sync Success',
        description: `Ваш аккаунт ${channel.charAt(0).toUpperCase() + channel.slice(1)} успешно синхронизирован. Метрики обновлены.`,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Social Sync & Influence Perks */}
      <Card className="relative overflow-hidden rounded-xl border-none bg-slate-900 text-white shadow-xl">
        <div className="absolute right-0 top-0 p-4 opacity-10">
          <Instagram className="h-32 w-32 rotate-12" />
        </div>
        <CardHeader className="p-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-black uppercase tracking-tight">
                Social Sync & Influence
              </CardTitle>
              <CardDescription className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                Синхронизируйте охваты и получайте привилегии
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4 p-4 pt-0">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <Instagram className="h-5 w-5 text-rose-400" />
                {syncedChannels.includes('instagram') ? (
                  <Badge className="border-none bg-emerald-500 text-[8px] uppercase">Synced</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-white/20 text-[8px] uppercase text-white/40"
                  >
                    Not Linked
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm font-black">12.4K</p>
                <p className="text-[9px] font-bold uppercase text-white/40">Подписчиков</p>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-amber-400">
                <TrendingUp className="h-3 w-3" /> ER: 4.8% (Top 10%)
              </div>
            </div>

            <div
              className={cn(
                'space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition-all',
                !syncedChannels.includes('telegram') && 'opacity-70'
              )}
            >
              <div className="flex items-center justify-between">
                <Globe className="h-5 w-5 text-blue-400" />
                {syncedChannels.includes('telegram') ? (
                  <Badge className="border-none bg-emerald-500 text-[8px] uppercase">Synced</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-white/20 text-[8px] uppercase text-white/40"
                  >
                    Not Linked
                  </Badge>
                )}
              </div>
              {syncedChannels.includes('telegram') ? (
                <div>
                  <p className="text-sm font-black">3.2K</p>
                  <p className="text-[9px] font-bold uppercase text-white/40">Подписчиков</p>
                  <div className="mt-2 flex items-center gap-2 text-[9px] font-black uppercase text-blue-400">
                    <TrendingUp className="h-3 w-3" /> Avg Views: 1.5K
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-white/60">Синхронизировать Telegram</p>
                  <button
                    onClick={() => handleSync('telegram')}
                    disabled={isSyncing === 'telegram'}
                    className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-400 underline decoration-2 underline-offset-4 transition-colors hover:text-white"
                  >
                    {isSyncing === 'telegram' ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> Authorizing...
                      </>
                    ) : (
                      'Connect Channel'
                    )}
                  </button>
                </>
              )}
            </div>

            <div className="space-y-4 rounded-2xl border border-indigo-500/30 bg-indigo-600/20 p-3">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-300">
                <ShieldCheck className="h-4 w-4" /> Текущие привилегии
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-white/80">
                    Early Access SS26
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-white/80">
                    Influencer Discount -20%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-white/80">
                    Private Showroom Access
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/60">
                Ваш Syntha Influence Score
              </h5>
              <Badge className="border-none bg-indigo-500 font-black text-white">82 / 100</Badge>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[82%] bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />
            </div>
            <p className="mt-3 text-[9px] font-medium leading-relaxed text-white/40">
              На основе ваших социальных сетей, ER и качества контента на платформе Syntha. До
              следующего уровня (MEGA) осталось 18 баллов.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle>Предпочтения</CardTitle>
          <CardDescription>Тема, плотность интерфейса, локаль и валюта.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">Тема</div>
            <Select
              value={settings.ui.theme}
              onValueChange={(v) =>
                onChange({ ...settings, ui: { ...settings.ui, theme: v as any } })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Системная</SelectItem>
                <SelectItem value="light">Светлая</SelectItem>
                <SelectItem value="dark">Тёмная</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Плотность интерфейса</div>
            <Select
              value={settings.ui.density}
              onValueChange={(v) =>
                onChange({ ...settings, ui: { ...settings.ui, density: v as any } })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">Обычная</SelectItem>
                <SelectItem value="compact">Компактная</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Язык/локаль</div>
            <Select
              value={settings.ui.locale}
              onValueChange={(v) => onChange({ ...settings, ui: { ...settings.ui, locale: v } })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru-RU">Русский (ru-RU)</SelectItem>
                <SelectItem value="en-US">English (en-US)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Валюта</div>
            <Select
              value={settings.ui.currency}
              onValueChange={(v) => onChange({ ...settings, ui: { ...settings.ui, currency: v } })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RUB">RUB — рубль (₽)</SelectItem>
                <SelectItem value="USD">USD — доллар ($)</SelectItem>
                <SelectItem value="EUR">EUR — евро (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
