'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PillarCapabilityFeature } from '@/lib/platform-core-ports/platform/pillar-capability-workspaces';

type Props = {
  feature: PillarCapabilityFeature;
  capabilityId: string;
  className?: string;
};

/** Placeholder для stub/planned фич — единый вид, без нового маршрута. */
export function PillarCapabilityFeatureStubPanel({ feature, capabilityId, className }: Props) {
  return (
    <Card className={cn('border-border-subtle', className)} data-testid={feature.testId}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">{feature.labelRu}</CardTitle>
          <Badge variant="outline" className="text-[10px] uppercase">
            {feature.status === 'stub' ? 'доработка' : 'в планах'}
          </Badge>
          {feature.externalRef ? (
            <Badge variant="secondary" className="text-[10px]">
              {feature.externalRef}
            </Badge>
          ) : null}
        </div>
        <CardDescription>{feature.summaryRu}</CardDescription>
      </CardHeader>
      <CardContent className="text-text-secondary text-sm">
        <p>
          Раздел развивается поэтапно в рамках существующего экрана. Канон:{' '}
          <code className="text-text-muted rounded bg-muted px-1 text-[11px]">{capabilityId}</code>
        </p>
      </CardContent>
    </Card>
  );
}
