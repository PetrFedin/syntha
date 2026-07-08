'use client';

import { useEffect, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { usePlatformCoreCommsNotificationPrefsPoll } from '@/hooks/use-platform-core-comms-notification-prefs-poll';
import {
  DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS,
  loadPlatformCoreCommsNotificationPrefs,
  persistPlatformCoreCommsNotificationPrefs,
  type PlatformCoreCommsNotificationPrefs,
  type PlatformCoreCommsNotificationRole,
} from '@/lib/platform-core-comms-notification-prefs';
import {
  WAVE_WZ_COMMS_CHAIN_PUSH_COMPACT_RU,
  WAVE_WZ_COMMS_CHAIN_PUSH_FULL_RU,
} from '@/lib/platform-core-ports/platform/wave-wz-ru-noise-dedup-final';

type Props = {
  role?: PlatformCoreCommsNotificationRole;
  scopeKey?: string;
  compact?: boolean;
};

function testIdPrefixForRole(role: PlatformCoreCommsNotificationRole): string {
  if (role === 'shop') return 'shop-cm';
  if (role === 'brand') return 'brand-cm';
  if (role === 'supplier') return 'sup-cm';
  return 'mfr-cm';
}

/** Comms prefs через PG/file API + локальный кеш (все роли). */
export function PlatformCoreCommsNotificationPrefsStrip({
  role = 'shop',
  scopeKey,
  compact = false,
}: Props) {
  const [prefs, setPrefs] = useState<PlatformCoreCommsNotificationPrefs>(
    DEFAULT_PLATFORM_CORE_COMMS_NOTIFICATION_PREFS
  );
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const prefix = testIdPrefixForRole(role);
  const coreMode = isPlatformCoreMode();
  const { tick: prefsTick } = usePlatformCoreCommsNotificationPrefsPoll(coreMode, role);

  useEffect(() => {
    void loadPlatformCoreCommsNotificationPrefs({ role, scopeKey }).then(
      ({ prefs: loaded, storageMode: mode }) => {
        setPrefs(loaded);
        setStorageMode(mode ?? null);
      }
    );
  }, [role, scopeKey, prefsTick]);

  if (!isPlatformCoreMode()) return null;

  const update = (patch: Partial<PlatformCoreCommsNotificationPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      void persistPlatformCoreCommsNotificationPrefs(next, { role, scopeKey }).then((res) => {
        if (res.storageMode) setStorageMode(res.storageMode);
      });
      return next;
    });
  };

  const storageHint =
    storageMode === 'postgres'
      ? 'Сохранено в PG'
      : storageMode === 'file'
        ? 'Сохранено локально (файл)'
        : storageMode === 'local'
          ? 'Только браузер'
          : storageMode === 'unavailable'
            ? 'PG недоступен — настройки по умолчанию'
            : null;

  const storageModeTestId =
    storageMode === 'postgres'
      ? `${prefix}-notification-prefs-storage-pg`
      : storageMode === 'file'
        ? `${prefix}-notification-prefs-storage-file`
        : `${prefix}-notification-prefs-storage-local`;

  const prefFields = (
    <>
      <label className="flex items-center gap-2">
        <Checkbox
          checked={prefs.orderStatus}
          onCheckedChange={(v) => update({ orderStatus: v === true })}
          data-testid={`${prefix}-notification-pref-order-status`}
        />
        <span>{compact ? 'Статус заказа' : 'Статус оптового заказа'}</span>
      </label>
      <label className="flex items-center gap-2">
        <Checkbox
          checked={prefs.chatMessages}
          onCheckedChange={(v) => update({ chatMessages: v === true })}
          data-testid={`${prefix}-notification-pref-chat`}
        />
        <span>{compact ? 'Сообщения чата' : 'Новые сообщения в чате'}</span>
      </label>
      <label className="flex items-center gap-2">
        <Checkbox
          checked={prefs.calendarReminders}
          onCheckedChange={(v) => update({ calendarReminders: v === true })}
          data-testid={`${prefix}-notification-pref-calendar`}
        />
        <span>{compact ? 'Календарь' : 'Напоминания календаря'}</span>
      </label>
      <label className="flex items-center gap-2">
        <Checkbox
          checked={prefs.chainStatusPush}
          onCheckedChange={(v) => update({ chainStatusPush: v === true })}
          data-testid={`${prefix}-notification-pref-chain-push`}
        />
        <span>
          {compact ? WAVE_WZ_COMMS_CHAIN_PUSH_COMPACT_RU : WAVE_WZ_COMMS_CHAIN_PUSH_FULL_RU}
        </span>
      </label>
    </>
  );

  if (compact) {
    return (
      <details
        className="text-text-muted text-[10px]"
        data-testid={`${prefix}-notification-prefs-compact`}
      >
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 hover:underline [&::-webkit-details-marker]:hidden">
          <Settings2 className="h-3 w-3" aria-hidden />
          Настройки
        </summary>
        <div className="border-border-subtle mt-1 space-y-1 rounded border bg-white/80 p-2">
          {storageHint ? (
            <p
              className="text-text-muted text-[9px] leading-snug"
              data-testid={`${prefix}-notification-prefs-storage-mode`}
              data-storage-mode={storageMode ?? undefined}
            >
              <span data-testid={`${prefix}-notification-prefs-storage`}>
                <span data-testid={storageModeTestId}>{storageHint}</span>
              </span>
            </p>
          ) : null}
          {prefFields}
        </div>
      </details>
    );
  }

  return (
    <div
      className="border-border-subtle space-y-2 rounded-lg border bg-white/90 p-2.5"
      data-testid={`${prefix}-notification-prefs`}
    >
      <div className="flex items-center gap-2">
        <Settings2 className="text-text-muted h-3.5 w-3.5" aria-hidden />
        <Label className="text-text-secondary text-[10px] font-semibold uppercase tracking-wide">
          Настройки уведомлений
        </Label>
      </div>
      <p
        className="text-text-muted text-[10px] leading-snug"
        data-testid={`${prefix}-notification-prefs-storage-mode`}
        data-storage-mode={storageMode ?? undefined}
      >
        <span data-testid={`${prefix}-notification-prefs-storage`}>
          <span data-testid={storageModeTestId}>{storageHint ?? 'Загрузка настроек…'}</span>
        </span>
      </p>
      <div className="space-y-2 text-xs">{prefFields}</div>
    </div>
  );
}

/** @deprecated use PlatformCoreCommsNotificationPrefsStrip */
export function PlatformCoreShopCommsNotificationPrefsStrip(props: Omit<Props, 'role'>) {
  return <PlatformCoreCommsNotificationPrefsStrip role="shop" {...props} />;
}
