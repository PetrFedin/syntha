'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import BlogManagementPro from '@/components/brand/blog/BlogManagementPro';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Megaphone } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

import { ROUTES } from '@/lib/routes';

export default function BrandBlogPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <RegistryPageHeader
        title="Блог"
        leadPlain="Публикации, редакция, контент. Связь с Media (DAM), Marketing и Products."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <FileText className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            <Badge variant="outline" className="text-[9px]">
              Media
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              Marketing
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.media}>Media</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.marketingSamples}>
                <Megaphone className="mr-1 size-3" /> PR Samples
              </Link>
            </Button>
          </div>
        }
      />
      <BlogManagementPro />
    </CabinetPageContent>
  );
}
