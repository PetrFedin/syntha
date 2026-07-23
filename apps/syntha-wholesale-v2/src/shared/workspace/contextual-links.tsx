'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { ButtonLink, type IconName } from '@/shared/ui';
import {
  mergeWorkspaceContextIntoHref,
  parseWorkspaceSearchParams,
  type WorkspaceHref,
} from '@/shared/workspace/workspace-links';

interface ContextualLinkProps {
  readonly href: WorkspaceHref;
  readonly children: ReactNode;
  readonly className?: string;
}

export function ContextualLink({
  href,
  children,
  className,
}: ContextualLinkProps) {
  const searchParams = useSearchParams();
  const context = parseWorkspaceSearchParams(searchParams);
  return (
    <Link className={className} href={mergeWorkspaceContextIntoHref(href, context)}>
      {children}
    </Link>
  );
}

interface ContextualButtonLinkProps extends ContextualLinkProps {
  readonly variant?: 'primary' | 'secondary' | 'ghost';
  readonly icon?: IconName;
}

export function ContextualButtonLink({
  href,
  children,
  className,
  variant,
  icon,
}: ContextualButtonLinkProps) {
  const searchParams = useSearchParams();
  const context = parseWorkspaceSearchParams(searchParams);
  return (
    <ButtonLink
      className={className}
      href={mergeWorkspaceContextIntoHref(href, context)}
      icon={icon}
      variant={variant}
    >
      {children}
    </ButtonLink>
  );
}
