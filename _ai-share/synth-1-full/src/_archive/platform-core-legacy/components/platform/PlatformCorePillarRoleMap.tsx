'use client';

import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import {
  PLATFORM_CORE_PILLARS,
  getDemoTrailPrimaryHrefForDemo,
  getPlatformCorePillarEntityLabelForDemo,
  platformCoreRolePillarHref,
} from '@/lib/platform-core-hub-matrix';
import { usePlatformCoreChainOverview } from '@/components/platform/usePlatformCoreChainOverview';

export function PlatformCorePillarRoleMap() {
  const { overview, pillarDone, demo, collectionId } = usePlatformCoreChainOverview();
  const roles = overview?.roles ?? [];
  const collectionParam = collectionId !== 'SS27' ? collectionId : undefined;

  if (roles.length === 0) return null;

  return (
    <section data-testid="platform-core-pillar-role-map" className="space-y-3">
      <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
        Столп × роль · handoff
      </p>
      <div className="space-y-2">
        {PLATFORM_CORE_PILLARS.map((pillar) => {
          const done = pillarDone(pillar.id);
          const demoHref = getDemoTrailPrimaryHrefForDemo(pillar.id, demo);
          return (
            <div
              key={pillar.id}
              data-testid={`pillar-role-map-${pillar.id}`}
              className="border-border-subtle flex flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2"
            >
              <span className="text-text-primary inline-flex min-w-[8.5rem] items-center gap-1.5 text-[11px] font-bold">
                {done === true ? (
                  <CheckCircle2
                    className="h-3.5 w-3.5 text-emerald-600"
                    aria-hidden
                    data-testid={`pillar-map-status-done-${pillar.id}`}
                  />
                ) : done === false ? (
                  <Circle className="text-text-muted h-3.5 w-3.5" aria-hidden />
                ) : null}
                {pillar.title}
              </span>
              {demoHref ? (
                <Link
                  href={demoHref}
                  data-testid={`pillar-role-map-demo-${pillar.id}`}
                  title={`Demo · ${pillar.title}`}
                  className="text-text-muted hover:text-accent-primary hidden rounded bg-transparent px-1 py-0.5 font-mono text-[9px] transition-colors sm:inline"
                >
                  {getPlatformCorePillarEntityLabelForDemo(pillar.id, demo)}
                </Link>
              ) : (
                <code className="text-text-muted hidden text-[9px] sm:inline">
                  {getPlatformCorePillarEntityLabelForDemo(pillar.id, demo)}
                </code>
              )}
              <div className="flex flex-wrap gap-1.5">
                {roles.map((role) => {
                  const active = role.participatesIn.includes(pillar.id);
                  return (
                    <Link
                      key={role.id}
                      href={platformCoreRolePillarHref(role.id, pillar.id, collectionParam)}
                      data-testid={`pillar-role-link-${pillar.id}-${role.id}`}
                      className={
                        active
                          ? 'bg-accent-primary/10 text-accent-primary rounded-md px-2 py-0.5 text-[10px] font-semibold hover:underline'
                          : 'text-text-muted rounded-md border border-dashed px-2 py-0.5 text-[10px] opacity-60'
                      }
                      title={
                        active ? `${role.label} · ${pillar.title}` : `${role.label} · не в роли`
                      }
                    >
                      {role.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
