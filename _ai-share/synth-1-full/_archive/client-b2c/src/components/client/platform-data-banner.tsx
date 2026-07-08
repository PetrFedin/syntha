'use client';

import { Badge } from '@/components/ui/badge';
import { SynthaDemoMark } from '@/components/ui/syntha-demo-mark';
import { getPlatformApiBaseUrl, getPlatformTransport } from '@/lib/platform/config';
import { Database, Cloud } from 'lucide-react';

/** Показывает режим данных (демо/localStorage vs API). */
export function PlatformDataBanner({ className }: { className?: string }) {
  const mode = getPlatformTransport();
  const api = getPlatformApiBaseUrl();

  if (mode === 'api') {
    return (
      <Badge variant="outline" className={`gap-1 text-[10px] font-normal ${className ?? ''}`}>
        <Cloud className="h-3 w-3" />
        API{api ? `: ${api}` : ' (база URL не задана)'}
      </Badge>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className ?? ''}`}>
      <SynthaDemoMark compact />
      <Badge variant="secondary" className="gap-1 text-[10px] font-normal">
        <Database className="h-3 w-3" />
        Локально: каталог + localStorage
      </Badge>
    </div>
  );
}
