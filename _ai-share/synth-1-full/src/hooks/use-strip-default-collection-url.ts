'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { omitDefaultCollectionSearchParam } from '@/lib/platform-core-url-canon';

/** Убрать `?collection=SS27` из адресной строки — сезон не часть навигационного пути. */
export function useStripDefaultCollectionFromUrl(pathname: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const current = searchParams.toString();
    const next = omitDefaultCollectionSearchParam(new URLSearchParams(current));
    const cleaned = next.toString();
    if (current === cleaned) return;
    router.replace(cleaned ? `${pathname}?${cleaned}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);
}
