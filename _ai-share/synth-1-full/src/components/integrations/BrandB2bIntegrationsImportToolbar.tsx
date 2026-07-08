'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import {
  importWholesaleOrdersToSpine,
  type SpineWholesaleImportPlatform,
} from '@/lib/integrations/spine/spine-wholesale-import-client';
import { wholesaleImportChannelLabelRu } from '@/lib/integrations/spine/integration-ui-utils';
import { BrandIntegrationsSpineStatusStrip } from '@/components/integrations/BrandIntegrationsSpineStatusStrip';

type ImportToolbarProps = {
  onImported: () => void;
  className?: string;
  /** Кабинет brand×co: только joor/nuorder + ссылка на полный реестр */
  compact?: boolean;
};

/** Brand · столп 3 · `/brand/b2b-orders` — импорт wholesale platforms → spine merge. */
export function BrandB2bIntegrationsImportToolbar({
  onImported,
  className,
  compact = false,
}: ImportToolbarProps) {
  const [busyPlatform, setBusyPlatform] = useState<SpineWholesaleImportPlatform | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const runImport = (platform: SpineWholesaleImportPlatform) => {
    void (async () => {
      setBusyPlatform(platform);
      setMsg(null);
      try {
        const outcome = await importWholesaleOrdersToSpine(platform);
        setMsg(outcome.messageRu);
        if (outcome.ok) onImported();
      } catch {
        setMsg(`Ошибка импорта · ${wholesaleImportChannelLabelRu(platform)}`);
      } finally {
        setBusyPlatform(null);
      }
    })();
  };

  const platforms: SpineWholesaleImportPlatform[] = compact
    ? ['joor', 'nuorder']
    : ['joor', 'nuorder', 'zedonk', 'apparel_magic'];

  return (
    <div
      className={className ?? 'flex flex-wrap items-center gap-2'}
      data-testid={compact ? 'brand-co-cabinet-import-toolbar' : 'brand-co-registry-import-toolbar'}
    >
      {platforms.map((platform) => (
        <Button
          key={platform}
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-[10px] font-bold uppercase"
          disabled={busyPlatform !== null}
          data-testid={`brand-co-registry-${platform}-import-btn`}
          onClick={() => runImport(platform)}
        >
          {busyPlatform === platform ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
          {wholesaleImportChannelLabelRu(platform)} → реестр
        </Button>
      ))}
      {compact ? (
        <Link href={ROUTES.brand.b2bOrders}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] font-bold uppercase"
            data-testid="brand-co-cabinet-registry-full-link"
          >
            Полный реестр
          </Button>
        </Link>
      ) : (
        <>
          <Link href={ROUTES.brand.integrationsCentric}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-[10px] font-bold uppercase"
              data-testid="brand-co-registry-centric-link"
            >
              PLM
            </Button>
          </Link>
          <Link href={ROUTES.brand.integrationsWebhooks}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-[10px] font-bold uppercase"
              data-testid="brand-co-registry-webhooks-link"
            >
              Webhooks
            </Button>
          </Link>
        </>
      )}
      <BrandIntegrationsSpineStatusStrip compact />
      {msg ? (
        <span
          className="text-text-secondary text-[10px]"
          data-testid="brand-co-registry-import-msg"
        >
          {msg}
        </span>
      ) : null}
    </div>
  );
}
