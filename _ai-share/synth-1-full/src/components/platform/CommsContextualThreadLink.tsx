'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useCallback } from 'react';
import { postCommsContextualThreadEnsure } from '@/lib/platform-core-ports/communications/comms-contextual-thread-post';
import type { CommsContextualThreadSource } from '@/lib/platform-core-ports/platform/wave-yn-comms-contextual-thread';
import { WAVE_YN_CONTEXTUAL_THREAD_LINK_TESTID } from '@/lib/platform-core-ports/platform/wave-yn-comms-contextual-thread';
import { cn } from '@/lib/utils';

type LinkProps = ComponentProps<typeof Link>;

type Props = Omit<LinkProps, 'onClick'> & {
  orderId?: string;
  collectionId?: string;
  articleId?: string;
  contextualSource: CommsContextualThreadSource;
  onClick?: LinkProps['onClick'];
  'data-testid'?: string;
};

/** Link that POST-ensures PG contextual thread before navigation (Wave YN). */
export function CommsContextualThreadLink({
  orderId,
  collectionId,
  articleId,
  contextualSource,
  onClick,
  className,
  'data-testid': dataTestId,
  ...rest
}: Props) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      postCommsContextualThreadEnsure({
        orderId,
        collectionId,
        articleId,
        source: contextualSource,
      });
      onClick?.(event);
    },
    [orderId, collectionId, articleId, contextualSource, onClick]
  );

  return (
    <Link
      {...rest}
      className={cn(className)}
      data-testid={dataTestId}
      data-contextual-thread-source={contextualSource}
      data-comms-contextual-thread-link={WAVE_YN_CONTEXTUAL_THREAD_LINK_TESTID}
      onClick={handleClick}
    />
  );
}
