'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';
import type { WorkspaceHref } from '@/shared/routing';
import {
  mergeWorkspaceContextIntoHref,
  parseWorkspaceSearchParams,
} from '@/shared/workspace/workspace-links';

interface WorkspaceShellLinkProps {
  readonly href: WorkspaceHref;
  readonly children: ReactNode;
  readonly className?: string;
  readonly ariaCurrent?: 'page';
  readonly ariaLabel?: string;
  readonly title?: string;
}

function ResolvedWorkspaceShellLink(props: WorkspaceShellLinkProps) {
  const searchParams = useSearchParams();
  const context = parseWorkspaceSearchParams(searchParams);
  return (
    <Link
      aria-current={props.ariaCurrent}
      aria-label={props.ariaLabel}
      className={props.className}
      href={mergeWorkspaceContextIntoHref(props.href, context)}
      title={props.title}
    >
      {props.children}
    </Link>
  );
}

export function WorkspaceShellLink(props: WorkspaceShellLinkProps) {
  const fallback = (
    <Link
      aria-current={props.ariaCurrent}
      aria-label={props.ariaLabel}
      className={props.className}
      href={props.href}
      title={props.title}
    >
      {props.children}
    </Link>
  );

  return (
    <Suspense fallback={fallback}>
      <ResolvedWorkspaceShellLink {...props} />
    </Suspense>
  );
}

function ResolvedWorkspaceSearchContextFields() {
  const searchParams = useSearchParams();
  const context = parseWorkspaceSearchParams(searchParams);
  return Object.entries(context).map(([key, value]) =>
    key !== 'q' && value ? (
      <input key={key} name={key} type="hidden" value={value} />
    ) : null,
  );
}

export function WorkspaceSearchContextFields() {
  return (
    <Suspense fallback={null}>
      <ResolvedWorkspaceSearchContextFields />
    </Suspense>
  );
}
