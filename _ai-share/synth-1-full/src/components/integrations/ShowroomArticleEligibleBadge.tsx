'use client';

import { Badge } from '@/components/ui/badge';
import { useArticleEligibleGate } from '@/hooks/use-article-eligible-gate';

type Props = {
  collectionId: string;
  articleId: string;
  variant: 'brand' | 'shop';
};

/** F-ELIGIBLE · столп 2 sample_collection / showroom article card. */
export function ShowroomArticleEligibleBadge({ collectionId, articleId, variant }: Props) {
  const { gate, loadState } = useArticleEligibleGate(collectionId, articleId);

  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <Badge
        variant="outline"
        className="text-[9px]"
        data-testid={`${variant}-sc-eligible-loading-${articleId}`}
      >
        eligible…
      </Badge>
    );
  }

  if (!gate) {
    return (
      <Badge
        variant="outline"
        className="text-[9px]"
        data-testid={`${variant}-sc-eligible-unknown-${articleId}`}
      >
        eligible —
      </Badge>
    );
  }

  const eligible = gate.eligibleForCollection;
  const source = gate.sources[0] ?? 'none';
  const sourceRu =
    source === 'centric_approved'
      ? 'Centric'
      : source === 'syntha_signoff'
        ? 'signoff'
        : source === 'lifecycle'
          ? 'lifecycle'
          : '—';

  return (
    <Badge
      variant={eligible ? 'secondary' : 'outline'}
      className={
        eligible
          ? 'border-emerald-200 bg-emerald-50 text-[9px] text-emerald-900'
          : 'border-amber-200 bg-amber-50 text-[9px] text-amber-900'
      }
      data-testid={`${variant}-sc-eligible-${articleId}`}
      title={gate.reasons.join(' · ')}
    >
      {eligible ? 'Доступен в матрице' : 'Не доступен'} · {sourceRu}
    </Badge>
  );
}
