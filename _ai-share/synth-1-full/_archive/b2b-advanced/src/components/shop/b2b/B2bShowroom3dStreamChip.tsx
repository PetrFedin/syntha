'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  buildWorkshop2B2bShowroom3dStreamPayload,
  workshop2B2bShowroom3dStreamTooltipRu,
} from '@/lib/production/workshop2-b2b-showroom-3d-stream';
import { ROUTES } from '@/lib/routes';

type StreamState = {
  mode: 'placeholder' | 'live';
  embedUrl?: string;
  hintRu?: string;
};

/** Chip «3D stream» → вкладка workspace sample_collection (без orphan badge). */
export function B2bShowroom3dStreamChip({ collectionId = 'SS27' }: { collectionId?: string }) {
  const [state, setState] = useState<StreamState>({ mode: 'placeholder' });
  const envTooltip = workshop2B2bShowroom3dStreamTooltipRu();
  const href = `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=3d-stream`;

  useEffect(() => {
    void fetch(
      `/api/shop/b2b/showroom/stream-token?collectionId=${encodeURIComponent(collectionId)}`
    )
      .then(async (r) => {
        const json = (await r.json()) as StreamState & { ok?: boolean };
        if (json.ok !== false) {
          setState({
            mode: json.mode ?? 'placeholder',
            embedUrl: json.embedUrl,
            hintRu: json.hintRu,
          });
        }
      })
      .catch(() => {
        const payload = buildWorkshop2B2bShowroom3dStreamPayload({ collectionId });
        setState({ mode: payload.mode, embedUrl: payload.embedUrl, hintRu: payload.hintRu });
      });
  }, [collectionId]);

  const live = Boolean(state.embedUrl);
  const tooltip = state.hintRu ?? envTooltip;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href} className="inline-flex" data-testid="shop-showroom-3d-stream-chip">
            <Badge
              variant={live ? 'default' : 'secondary'}
              className={`text-[9px] font-black uppercase ${live ? '' : 'opacity-80'}`}
            >
              3D stream
            </Badge>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
