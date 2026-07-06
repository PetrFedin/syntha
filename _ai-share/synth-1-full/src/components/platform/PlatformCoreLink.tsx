'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

/** Link с native href coercion в Platform Core MODE. */
export function PlatformCoreLink({ href, ...rest }: Props) {
  const demo = usePlatformCoreDemoContext();
  return <Link href={platformCoreUiHref(href, demo)} {...rest} />;
}
