'use client';

import Link from 'next/link';
import { buildPlatformB2bMarketroomSession } from '@/lib/platform-core-ports/b2b/platform-b2b-marketroom';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId?: string;
  orderId?: string;
};

/** Platform B2B marketroom · hub + partners + tracking spine. */
export function PlatformB2bMarketroomCoSpinePeerStrip({ collectionId, orderId }: Props) {
  const session = buildPlatformB2bMarketroomSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="platform-b2b-marketroom-co-spine-peer-strip">
      <Link
        href={session.platformHubHref}
        data-testid="platform-b2b-marketroom-hub-link"
        className={hubGadget.goldenLink}
      >
        Platform hub
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.partnersHref}
        data-testid="platform-b2b-marketroom-partners-link"
        className={hubGadget.goldenLink}
      >
        Partners
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopBuyHref}
        data-testid="platform-b2b-marketroom-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopOrderCommsHref}
        data-testid="platform-b2b-marketroom-order-comms-link"
        className={hubGadget.goldenLink}
      >
        Чат по заказу
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandPublishHref}
        data-testid="platform-b2b-marketroom-brand-publish-link"
        className={hubGadget.goldenLink}
      >
        Brand publish
      </Link>
    </div>
  );
}
