'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  ChevronRight,
  Check,
  X,
  Key,
  Smartphone,
  Monitor,
  Globe,
  AlertTriangle,
  Lock,
  Unlock,
  Clock,
  Activity,
  FileText,
  Download,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { useState } from 'react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

const SECURITY_SCORE_ITEMS = [
  { label: 'Двухфакторная аутентификация', score: 100, enabled: true, critical: true },
  { label: 'Надежность пароля', score: 95, enabled: true, critical: true },
  { label: 'Активные сессии', score: 85, enabled: true, critical: false },
  { label: 'API ключи защищены', score: 90, enabled: true, critical: false },
  { label: 'Журнал аудита', score: 100, enabled: true, critical: false },
];

const ACTIVE_SESSIONS = [
  {
    device: 'MacBook Pro 16',
    browser: 'Chrome 121',
    location: 'Москва, Россия',
    ip: '192.168.1.1',
    lastActive: 'Сейчас',
    current: true,
  },
  {
    device: 'iPhone 15 Pro',
    browser: 'Safari Mobile',
    location: 'Москва, Россия',
    ip: '192.168.1.2',
    lastActive: '5 мин назад',
    current: false,
  },
  {
    device: 'iPad Air',
    browser: 'Safari',
    location: 'Санкт-Петербург, Россия',
    ip: '192.168.2.1',
    lastActive: '2ч назад',
    current: false,
  },
];

const API_KEYS = [
  {
    name: 'Production API Key',
    key: 'sk_live_51H***************',
    created: '15.01.2026',
    lastUsed: 'Сегодня, 14:23',
    status: 'active',
  },
  {
    name: 'Development API Key',
    key: 'sk_test_51H***************',
    created: '10.01.2026',
    lastUsed: 'Вчера, 18:45',
    status: 'active',
  },
  {
    name: 'Legacy API Key',
    key: 'sk_live_49G***************',
    created: '01.12.2025',
    lastUsed: '01.02.2026',
    status: 'inactive',
  },
];

const AUDIT_LOG = [
  {
    user: 'Анна К.',
    action: 'Вход в систему',
    details: 'MacBook Pro, Chrome, Москва',
    time: '5 мин назад',
    type: 'login',
    risk: 'low',
  },
  {
    user: 'Игорь Д.',
    action: 'Изменение пароля',
    details: 'Успешно обновлен',
    time: '2ч назад',
    type: 'security',
    risk: 'medium',
  },
  {
    user: 'Мария С.',
    action: 'Создание API ключа',
    details: 'Production API Key',
    time: '1 день назад',
    type: 'api',
    risk: 'high',
  },
  {
    user: 'Петр В.',
    action: 'Включение 2FA',
    details: 'Authenticator App',
    time: '2 дня назад',
    type: 'security',
    risk: 'low',
  },
];

export default function SecurityPage() {
  const searchParams = useSearchParams();
  const returnResolved = searchParams.get('returnResolved');
  const [show2FACode, setShow2FACode] = useState(false);
  const overallScore = Math.round(
    SECURITY_SCORE_ITEMS.reduce((sum, item) => sum + item.score, 0) / SECURITY_SCORE_ITEMS.length
  );

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-5 px-4 pb-20 md:px-0">
      {returnResolved && (
        <div className="bg-accent-primary/10 border-accent-primary/20 mb-4 rounded-lg border p-2">
          <Link
            href={`${ROUTES.brand.organizationPage}?resolved=${encodeURIComponent(returnResolved)}`}
            className="text-accent-primary hover:text-accent-primary flex items-center gap-1 text-[10px] font-semibold"
          >
            ← Вернуться в Центр управления
          </Link>
        </div>
      )}
      {/* Breadcrumb Navigation */}
      <div className="text-text-muted mb-4 flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest">
        <Link
          href={ROUTES.brand.organizationPage}
          className="hover:text-accent-primary transition-colors"
        >
          Организация
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-accent-primary">Безопасность</span>
      </div>

      {/* Control Panel */}
      <div className="mb-4 flex items-center justify-end gap-3">
        <div className="flex items-center gap-1.5">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border-default text-text-muted hover:bg-bg-surface2 h-7 rounded-lg bg-white px-3 text-[7px] font-black uppercase tracking-widest shadow-sm"
          >
            <Link href={ROUTES.brand.settings}>Настройки</Link>
          </Button>
          <div className="bg-border-subtle mx-0.5 h-4 w-px" />
          <Button
            variant="outline"
            size="sm"
            className="border-border-default text-text-muted hover:bg-bg-surface2 h-7 rounded-lg bg-white px-3 text-[7px] font-black uppercase tracking-widest shadow-sm"
          >
            <Download className="mr-1 h-3 w-3" /> Экспорт логов
          </Button>
        </div>

        <Button
          variant="default"
          size="sm"
          className="h-7 rounded-lg bg-rose-600 px-4 text-[7px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700"
        >
          <AlertTriangle className="mr-1 h-3 w-3" /> Завершить все сессии
        </Button>
      </div>

      {/* Security Score & 2FA Status */}
      <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Security Score */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-emerald-600" />
            <h2 className="text-text-muted text-[9px] font-black uppercase tracking-[0.3em]">
              Security Score
            </h2>
          </div>

          <Card className="border-border-subtle h-full rounded-xl border border-none bg-white p-4 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-text-primary text-base font-black uppercase tracking-tight">
                  Security Index
                </h3>
                <p className="text-text-muted text-[10px] font-black uppercase italic tracking-widest">
                  Overall Protection Level
                </p>
              </div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-50 bg-emerald-50/30 shadow-inner">
                <span className="text-base font-black text-emerald-600">{overallScore}</span>
                <ShieldCheck className="absolute -right-1 -top-1 h-4 w-4 text-emerald-500" />
              </div>
            </div>

            <div className="space-y-5">
              {SECURITY_SCORE_ITEMS.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary">{item.label}</span>
                      {item.critical && (
                        <Badge className="h-3.5 border-none bg-rose-500 px-1.5 text-[6px] font-black uppercase text-white">
                          Critical
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary tabular-nums">{item.score}/100</span>
                      {item.enabled ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="h-4 w-4 text-rose-500" />
                      )}
                    </div>
                  </div>
                  <div className="bg-bg-surface2 h-1.5 w-full overflow-hidden rounded-full shadow-inner">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-1000',
                        item.score >= 90
                          ? 'bg-emerald-500'
                          : item.score >= 70
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      )}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Two-Factor Authentication */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="bg-accent-primary h-1 w-8 rounded-full" />
            <h2 className="text-text-muted text-[9px] font-black uppercase tracking-[0.3em]">
              Authentication Layer
            </h2>
          </div>

          <Card className="from-accent-primary to-accent-primary relative h-full overflow-hidden rounded-xl border-none bg-gradient-to-br p-4 text-white shadow-sm">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Smartphone className="h-32 w-32" />
            </div>
            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-6 flex items-start justify-between">
                <div className="space-y-2">
                  <Badge className="h-5 border-none bg-emerald-500 px-2 text-[7px] font-black uppercase text-white">
                    <Check className="mr-1 h-3 w-3" /> Активна
                  </Badge>
                  <h3 className="text-sm font-black uppercase tracking-tight">2FA Protection</h3>
                  <p className="text-accent-primary/40 text-[10px] font-medium leading-relaxed">
                    Ваш аккаунт максимально защищен. Используйте приложение-аутентификатор для
                    подтверждения входа.
                  </p>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-3">
                <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Smartphone className="text-accent-primary h-4 w-4" />
                    <span className="text-accent-primary/40 text-[8px] font-black uppercase">
                      Метод
                    </span>
                  </div>
                  <div className="text-sm font-black">Authenticator App</div>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Clock className="text-accent-primary h-4 w-4" />
                    <span className="text-accent-primary/40 text-[8px] font-black uppercase">
                      Последний лог
                    </span>
                  </div>
                  <div className="text-sm font-black">Сегодня, 14:23</div>
                </div>
              </div>

              <div className="mt-auto">
                <Button
                  variant="outline"
                  className="hover:text-accent-primary h-11 w-full rounded-2xl border-white/20 text-[9px] font-black uppercase text-white hover:bg-white"
                >
                  Сгенерировать резервные коды
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Active Sessions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-blue-600" />
            <h2 className="text-text-muted text-[9px] font-black uppercase tracking-[0.3em]">
              Active Sessions
            </h2>
          </div>

          <Card className="border-border-subtle rounded-xl border border-none bg-white p-4 shadow-sm">
            <div className="space-y-3">
              {ACTIVE_SESSIONS.map((session, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-xl p-4 transition-all',
                    session.current
                      ? 'bg-accent-primary/10 border-accent-primary/30 border-2'
                      : 'bg-bg-surface2 hover:bg-bg-surface2'
                  )}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl',
                          session.current
                            ? 'bg-accent-primary/15 text-accent-primary'
                            : 'bg-border-subtle text-text-secondary'
                        )}
                      >
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-text-primary text-[9px] font-black uppercase">
                            {session.device}
                          </span>
                          {session.current && (
                            <Badge className="bg-accent-primary h-3.5 border-none px-1.5 text-[6px] font-black uppercase text-white">
                              Текущая
                            </Badge>
                          )}
                        </div>
                        <div className="text-text-secondary mt-0.5 text-[8px]">
                          {session.browser}
                        </div>
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[7px] font-black uppercase text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="text-text-muted flex items-center gap-3 text-[7px] font-medium">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{session.location}</span>
                    </div>
                    <span>•</span>
                    <span className="font-mono">{session.ip}</span>
                    <span>•</span>
                    <span>{session.lastActive}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* API Keys */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-amber-600" />
            <h2 className="text-text-muted text-[9px] font-black uppercase tracking-[0.3em]">
              API Keys
            </h2>
          </div>

          <Card className="border-border-subtle rounded-xl border border-none bg-white p-4 shadow-sm">
            <div className="space-y-3">
              {API_KEYS.map((apiKey, i) => (
                <div
                  key={i}
                  className="bg-bg-surface2 hover:bg-bg-surface2 rounded-xl p-4 transition-all"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl',
                          apiKey.status === 'active'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-border-subtle text-text-muted'
                        )}
                      >
                        <Key className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-text-primary text-[9px] font-black uppercase">
                            {apiKey.name}
                          </span>
                          <Badge
                            className={cn(
                              'h-3.5 border-none px-1.5 text-[6px] font-black uppercase',
                              apiKey.status === 'active'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-text-muted text-white'
                            )}
                          >
                            {apiKey.status}
                          </Badge>
                        </div>
                        <div className="text-text-secondary mt-0.5 font-mono text-[8px]">
                          {apiKey.key}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-text-muted hover:text-accent-primary h-7 px-2 text-[7px] font-black uppercase"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-text-muted flex items-center gap-3 text-[7px] font-medium">
                    <span>Создан: {apiKey.created}</span>
                    <span>•</span>
                    <span>Использован: {apiKey.lastUsed}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-border-subtle mt-4 border-t pt-4">
              <Button
                variant="outline"
                className="border-border-default hover:bg-bg-surface2 h-9 w-full rounded-xl text-[8px] font-black uppercase"
              >
                <Key className="mr-2 h-3 w-3" /> Создать новый API ключ
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Audit Log */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-text-primary h-1 w-8 rounded-full" />
          <h2 className="text-text-muted text-[9px] font-black uppercase tracking-[0.3em]">
            Audit Log
          </h2>
        </div>

        <Card className="border-border-subtle rounded-xl border border-none bg-white p-4 shadow-sm">
          <div className="space-y-3">
            {AUDIT_LOG.map((log, i) => (
              <div
                key={i}
                className="bg-bg-surface2 hover:bg-bg-surface2 group flex items-center gap-3 rounded-xl p-4 transition-all"
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    log.risk === 'high'
                      ? 'bg-rose-100 text-rose-600'
                      : log.risk === 'medium'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-emerald-600'
                  )}
                >
                  {log.type === 'login' ? (
                    <Activity className="h-5 w-5" />
                  ) : log.type === 'security' ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <Key className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-text-primary text-[9px] font-black uppercase">
                      {log.user}
                    </span>
                    <span className="text-text-muted text-[8px]">•</span>
                    <span className="text-text-secondary text-[8px]">{log.action}</span>
                  </div>
                  <div className="text-text-muted text-[7px]">{log.details}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-[7px] font-bold uppercase">{log.time}</span>
                  <Badge
                    className={cn(
                      'h-3.5 border-none px-1.5 text-[6px] font-black uppercase',
                      log.risk === 'high'
                        ? 'bg-rose-500 text-white'
                        : log.risk === 'medium'
                          ? 'bg-amber-500 text-white'
                          : 'bg-border-default text-text-secondary'
                    )}
                  >
                    {log.risk}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="border-border-subtle mt-6 flex items-center justify-between border-t pt-6">
            <div className="text-text-muted text-[8px] font-medium">Показано 4 из 247 событий</div>
            <Button
              variant="outline"
              className="border-border-default hover:bg-bg-surface2 h-9 rounded-xl px-4 text-[8px] font-black uppercase"
            >
              Показать все события
            </Button>
          </div>
        </Card>
      </div>
    </CabinetPageContent>
  );
}
