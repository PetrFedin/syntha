'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function OrganizationPageLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('b2b-page-container', className)}>{children}</div>;
}
