'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Globe, Layers, CheckCircle, Clock, History, ExternalLink } from 'lucide-react';
import { getB2BCampaigns } from '@/lib/fashion/b2b-campaigns';
import { Button } from '@/components/ui/button';
import { RegistryPageHeader } from '@/components/design-system';

export default function B2BCampaignPage() {
  const campaigns = getB2BCampaigns();

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-20">
      <RegistryPageHeader
        title="Кампании B2B"
        leadPlain="Цифровые lookbooks, оптовые каталоги и версии кампаний для партнёров."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {campaigns.map((camp) => (
          <Card
            key={camp.id}
            className="hover:border-accent-primary/25 overflow-hidden border-2 p-6 shadow-sm transition-colors"
          >
            <div className="mb-4 flex items-center justify-between">
              <Badge
                variant="outline"
                className="text-text-muted border-border-default text-[10px] font-black uppercase"
              >
                {camp.id} • {camp.version}
              </Badge>
              {camp.activeStatus ? (
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-green-600">
                  <CheckCircle className="h-4 w-4" /> Live
                </div>
              ) : (
                <div className="text-text-muted flex items-center gap-1.5 text-xs font-bold uppercase">
                  <Clock className="h-4 w-4" /> Scheduled
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-text-primary mb-1 text-xl font-bold">{camp.theme}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5 text-blue-500" />
                Target Market:{' '}
                <span className="text-text-secondary font-semibold">{camp.targetMarket}</span>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" /> Version History
                </span>
                <span className="text-accent-primary font-bold">3 Revisions</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground">
                  <History className="h-3.5 w-3.5" /> Last Published
                </span>
                <span className="text-text-secondary font-semibold">{camp.publishedAt}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="h-9 text-[10px] font-bold uppercase">
                  View Catalog
                </Button>
                <Button
                  size="sm"
                  className="bg-accent-primary hover:bg-accent-primary h-9 text-[10px] font-bold uppercase"
                >
                  <ExternalLink className="mr-1 h-3 w-3" /> Share Pack
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-accent-primary/10 border-accent-primary/20 mt-8 flex items-center gap-4 rounded-lg border p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm">
          <Layers className="text-accent-primary h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-accent-primary text-xs font-bold uppercase">
            Pro Tip: Campaign Versioning
          </div>
          <div className="text-accent-primary text-[11px] leading-tight">
            Use regional versions of lookbooks to highlight category affinity for specific markets
            (e.g., Silk Dresses for Middle East vs Wool Coats for Northern Europe).
          </div>
        </div>
      </div>
    </CabinetPageContent>
  );
}
