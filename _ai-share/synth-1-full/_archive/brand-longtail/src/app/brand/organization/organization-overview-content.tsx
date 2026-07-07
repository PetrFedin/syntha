'use client';

import React, { useState } from 'react';
import { OrganizationHubHeader } from './_components/organization-hub-header';
import { OrganizationAttentionAlertsSection } from './_components/organization-attention-alerts-section';
import { OrganizationHealthActivityGrid } from './_components/organization-health-activity-grid';
import { OrganizationPartnerEcosystemSection } from './_components/organization-partner-ecosystem-section';
import { OrganizationRoleReportsSection } from './_components/organization-role-reports-section';
import { OrganizationModulesSection } from './_components/organization-modules-section';
import type { OrganizationOverviewContentProps } from './organization-overview-content-types';

export type { OrganizationOverviewContentProps } from './organization-overview-content-types';

export function OrganizationOverviewContent(props: OrganizationOverviewContentProps) {
  const [openHealthDetailFor, setOpenHealthDetailFor] = useState<number | null>(null);
  const {
    modulesPeriodKey,
    orgProfile,
    activityPeriod,
    setActivityPeriod,
    customRange,
    setCustomRange,
    activityParticipant,
    setActivityParticipant,
    openBlockFor,
    setOpenBlockFor,
    openCommentFor,
    setOpenCommentFor,
    setBlockedActivities,
    commentText,
    setCommentText,
    filteredActivities,
    globalHistory,
    isBlocked,
    activityKey,
    getCorrectionHref,
    toast,
    healthMetrics,
    overallHealth,
    lastCheck,
    healthLoading,
    healthError,
    refetchHealth,
    alerts,
    getBlockLabel,
    dismissCertificate,
    dismissProfile,
    dismissTask,
    dismissIntegrationIssue,
    participantsCount = 24,
    onlineCount = 8,
    partialLoadWarning,
    moduleStatsByHref,
    partnerEcosystem,
  } = props;

  return (
    <>
      <OrganizationHubHeader
        healthLoading={healthLoading}
        healthError={healthError}
        partialLoadWarning={partialLoadWarning}
        onRetryHealth={refetchHealth}
        orgProfile={orgProfile}
        participantsCount={participantsCount}
        onlineCount={onlineCount}
        activityPeriod={activityPeriod}
        setActivityPeriod={setActivityPeriod}
        customRange={customRange}
        setCustomRange={setCustomRange}
      />

      <OrganizationRoleReportsSection healthLoading={healthLoading} />

      <OrganizationAttentionAlertsSection
        globalHistory={globalHistory}
        healthLoading={healthLoading}
        alerts={alerts}
        getBlockLabel={getBlockLabel}
        dismissCertificate={dismissCertificate}
        dismissProfile={dismissProfile}
        dismissTask={dismissTask}
        dismissIntegrationIssue={dismissIntegrationIssue}
      />

      <OrganizationHealthActivityGrid
        globalHistory={globalHistory}
        healthError={healthError}
        healthLoading={healthLoading}
        lastCheck={lastCheck}
        overallHealth={overallHealth}
        healthMetrics={healthMetrics}
        refetchHealth={refetchHealth}
        openHealthDetailFor={openHealthDetailFor}
        setOpenHealthDetailFor={setOpenHealthDetailFor}
        activityParticipant={activityParticipant}
        setActivityParticipant={setActivityParticipant}
        filteredActivities={filteredActivities}
        isBlocked={isBlocked}
        activityKey={activityKey}
        getCorrectionHref={getCorrectionHref}
        setBlockedActivities={setBlockedActivities}
        openCommentFor={openCommentFor}
        setOpenCommentFor={setOpenCommentFor}
        commentText={commentText}
        setCommentText={setCommentText}
        openBlockFor={openBlockFor}
        setOpenBlockFor={setOpenBlockFor}
        toast={toast}
      />

      <OrganizationPartnerEcosystemSection
        modulesPeriodKey={modulesPeriodKey}
        globalHistory={globalHistory}
        partnerEcosystem={partnerEcosystem}
        dashboardLoading={healthLoading}
      />

      <OrganizationModulesSection
        modulesPeriodKey={modulesPeriodKey}
        globalHistory={globalHistory}
        participantsCount={participantsCount}
        moduleStatsByHref={moduleStatsByHref}
        dashboardLoading={healthLoading}
      />
    </>
  );
}
