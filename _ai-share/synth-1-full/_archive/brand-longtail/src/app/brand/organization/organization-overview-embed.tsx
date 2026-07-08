'use client';

import React, { useState, useEffect, useMemo, startTransition } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ModuleStatPatch } from './organization-navigation-cards';
import { getRecentActivities, type RecentActivity } from './organization-recent-activity';
import type { HistoryEntry } from '@/components/brand/SectionBlock';
import { useOrganizationHealth } from '@/hooks/use-organization-health';
import { useToast } from '@/hooks/use-toast';
import { useAttentionAlerts } from './use-attention-alerts';
import type { BlockId } from './use-attention-alerts';
import { OrgHubModulesStripSkeleton } from './_components/organization-hub-skeletons';
import { PARTICIPANTS_COUNT, ONLINE_COUNT } from './organization-demo-data';
import { BRAND_ID } from './organization-config';
import type { ActivityPeriod } from './_components/organization-overview-lib';

const OrganizationOverviewContent = dynamic(
  () =>
    import('./organization-overview-content').then((m) => ({
      default: m.OrganizationOverviewContent,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4" aria-busy="true" aria-label="Загрузка центра управления">
        <div
          className="border-border-subtle from-bg-surface2/50 h-[140px] animate-pulse rounded-2xl border bg-gradient-to-br to-white shadow-sm"
          aria-hidden
        />
        <div
          className="border-border-subtle bg-bg-surface2/80 h-[120px] animate-pulse rounded-xl border"
          aria-hidden
        />
        <OrgHubModulesStripSkeleton className="border-border-subtle rounded-xl border bg-white p-4 shadow-sm md:p-5" />
      </div>
    ),
  }
);

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function filterActivitiesByPeriod(
  activities: RecentActivity[],
  period: ActivityPeriod
): RecentActivity[] {
  let startStr: string;
  let endStr: string;
  if (typeof period === 'object') {
    startStr = toDateStr(period.from);
    endStr = toDateStr(period.to);
  } else {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - (period === '7d' ? 6 : 29));
    startStr = toDateStr(start);
    endStr = toDateStr(today);
  }
  return activities.filter((a) => a.dateStr >= startStr && a.dateStr <= endStr);
}

const BRAND_PROFILE_ORG = '/brand?group=strategy&tab=overview';

export function OrganizationOverviewEmbed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activityPeriod, setActivityPeriod] = useState<ActivityPeriod>('7d');
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});
  const [activityParticipant, setActivityParticipant] = useState<string>('all');
  const [openBlockFor, setOpenBlockFor] = useState<number | null>(null);
  const [openCommentFor, setOpenCommentFor] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [blockedActivities, setBlockedActivities] = useState<RecentActivity[]>([]);

  const activityKey = (a: RecentActivity) => `${a.user}|${a.action}|${a.time}|${a.dateStr}`;
  const isBlocked = (a: RecentActivity) =>
    blockedActivities.some((b) => activityKey(b) === activityKey(a));
  const getCorrectionHref = (act: RecentActivity) => {
    const map: Record<RecentActivity['type'], string> = {
      profile: '/brand',
      team: '/brand/team',
      integration: '/brand/integrations',
      security: '/brand/security',
      billing: '/brand/subscription',
    };
    return map[act.type];
  };

  const { toast } = useToast();
  const {
    metrics: healthMetrics,
    overallHealth,
    lastCheck,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
    profile: orgProfile,
    partialLoadWarning,
    organizationPresence,
    dashboard,
  } = useOrganizationHealth();

  const attentionBrandId = useMemo(() => {
    const id = orgProfile?.brand?.id;
    return typeof id === 'string' && id.trim() !== '' ? id : BRAND_ID;
  }, [orgProfile?.brand?.id]);

  const {
    alerts,
    getHistory,
    getBlockLabel,
    dismissCertificate,
    dismissProfile,
    dismissTask,
    dismissIntegrationIssue,
  } = useAttentionAlerts({
    attentionAlertsFromDashboard: dashboard?.attentionAlerts,
    healthLoading,
    brandId: attentionBrandId,
  });

  const attentionHistory = useMemo(
    () =>
      (['certificates', 'profile', 'systems', 'tasks'] as const)
        .flatMap((id) => getHistory(id).map((e) => ({ ...e, blockLabel: getBlockLabel(id) })))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 30),
    [getHistory, getBlockLabel]
  );

  const recentActivities = useMemo(() => getRecentActivities(new Date()), []);
  const filteredActivities = filterActivitiesByPeriod(recentActivities, activityPeriod).filter(
    (a) => activityParticipant === 'all' || a.participantId === activityParticipant
  );

  const globalHistory = useMemo(() => {
    const activityEntries: HistoryEntry[] = filteredActivities.map((act, i) => ({
      id: `activity-${act.user}-${act.dateStr}-${i}-${act.action.slice(0, 20)}`,
      action: 'activity' as const,
      label: act.action,
      author: act.user,
      timestamp: new Date(act.dateStr).getTime() + (filteredActivities.length - i) * 60000,
      blockLabel:
        act.type === 'profile'
          ? 'Профиль'
          : act.type === 'team'
            ? 'Команда'
            : act.type === 'integration'
              ? 'Интеграции'
              : act.type === 'security'
                ? 'Безопасность'
                : 'Биллинг',
    }));
    return [...attentionHistory, ...activityEntries]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50) as HistoryEntry[];
  }, [attentionHistory, filteredActivities]);

  const resolvedKey = searchParams?.get('resolved') ?? null;
  useEffect(() => {
    if (resolvedKey) {
      startTransition(() => {
        setBlockedActivities((prev) => prev.filter((b) => activityKey(b) !== resolvedKey));
      });
      router.replace(BRAND_PROFILE_ORG, { scroll: false });
    }
  }, [resolvedKey, router]);

  const resolvedParticipants = organizationPresence.participantsCount ?? PARTICIPANTS_COUNT;
  const resolvedOnline = Math.min(
    organizationPresence.onlineCount ?? ONLINE_COUNT,
    resolvedParticipants
  );

  const modulesPeriodKey = typeof activityPeriod === 'object' ? '30d' : activityPeriod;

  const moduleStatsByHref = useMemo((): Record<string, ModuleStatPatch> | undefined => {
    const raw = dashboard?.moduleStats;
    return raw && typeof raw === 'object' ? (raw as Record<string, ModuleStatPatch>) : undefined;
  }, [dashboard?.moduleStats]);

  return (
    <OrganizationOverviewContent
      modulesPeriodKey={modulesPeriodKey}
      orgProfile={orgProfile}
      healthMetrics={healthMetrics}
      overallHealth={overallHealth}
      lastCheck={lastCheck}
      healthLoading={healthLoading}
      healthError={healthError}
      refetchHealth={refetchHealth}
      activityPeriod={activityPeriod}
      setActivityPeriod={setActivityPeriod}
      customRange={customRange}
      setCustomRange={setCustomRange}
      activityParticipant={activityParticipant}
      setActivityParticipant={setActivityParticipant}
      setBlockedActivities={setBlockedActivities}
      openBlockFor={openBlockFor}
      setOpenBlockFor={setOpenBlockFor}
      openCommentFor={openCommentFor}
      setOpenCommentFor={setOpenCommentFor}
      commentText={commentText}
      setCommentText={setCommentText}
      toast={toast}
      alerts={alerts}
      getBlockLabel={(key) => getBlockLabel(key as BlockId)}
      dismissCertificate={dismissCertificate}
      dismissProfile={dismissProfile}
      dismissTask={dismissTask}
      dismissIntegrationIssue={dismissIntegrationIssue}
      filteredActivities={filteredActivities}
      globalHistory={globalHistory}
      activityKey={activityKey}
      isBlocked={isBlocked}
      getCorrectionHref={getCorrectionHref}
      participantsCount={resolvedParticipants}
      onlineCount={resolvedOnline}
      partialLoadWarning={partialLoadWarning}
      moduleStatsByHref={moduleStatsByHref}
      partnerEcosystem={dashboard?.partnerEcosystem}
    />
  );
}
