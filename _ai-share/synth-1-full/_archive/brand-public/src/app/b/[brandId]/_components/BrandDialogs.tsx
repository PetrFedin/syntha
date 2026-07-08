'use client';

import React from 'react';
import { TeamDialog } from './dialogs/TeamDialog';
import { StatsDialog } from './dialogs/StatsDialog';
import { BrandReviewsDialog } from './dialogs/BrandReviewsDialog';
import { StatusesDialog } from './dialogs/StatusesDialog';
import { QuizResultsDialog } from './dialogs/QuizResultsDialog';
import { MentionDialog } from './dialogs/MentionDialog';
import { SocialDialog } from './dialogs/SocialDialog';
import { BlogDialog } from './dialogs/BlogDialog';
import { VideoDialog } from './dialogs/VideoDialog';
import { PressDialog } from './dialogs/PressDialog';
import { LiveReminderDialog } from './dialogs/LiveReminderDialog';
import { RetailerListDialog } from './dialogs/RetailerListDialog';
import { PressKitDialog } from './dialogs/PressKitDialog';
import { AiSizeDialog } from './dialogs/AiSizeDialog';
import { ShareLookDialog } from './dialogs/ShareLookDialog';

interface BrandDialogsProps {
  brand: any;
  displayName: string;
  user: any;
  purchasedProducts: any[];
  toast: any;
  isStatsDialogOpen: boolean;
  setIsStatsDialogOpen: (open: boolean) => void;
  statsPeriod: any;
  setStatsPeriod: (period: any) => void;
  currentBrandStats: any[];
  brandMedalsByPeriod: Record<string, any[]>;
  isBrandReviewsOpen: boolean;
  setIsBrandReviewsOpen: (open: boolean) => void;
  isStatusesDialogOpen: boolean;
  setIsStatusesDialogOpen: (open: boolean) => void;
  activeStatuses: any[];
  potentialStatuses: any[];
  currentStatusIndex: number;
  isAiSizeDialogOpen: boolean;
  setIsAiSizeDialogOpen: (open: boolean) => void;
  isPressKitOpen: boolean;
  setIsPressKitOpen: (open: boolean) => void;
  isLiveReminderSet: boolean;
  setIsLiveReminderOpen: (open: boolean) => void;
  liveReminderTime: string;
  setLiveReminderTime: (time: string) => void;
  isShareLookOpen: boolean;
  setIsShareLookOpen: (open: boolean) => void;
  isQuizResultsOpen: boolean;
  setIsQuizResultsOpen: (open: boolean) => void;
  quizResults: any;
  isUpgradeRequested: boolean;
  setIsUpgradeRequested: (requested: boolean) => void;
  isRetailerListOpen: boolean;
  setIsRetailerOpen: (open: boolean) => void;
  retailStores: any[];
  isTeamOpen: boolean;
  setIsTeamOpen: (open: boolean) => void;
  currentTeamIdx: number;
  setCurrentTeamIdx: React.Dispatch<React.SetStateAction<number>>;
}

export function BrandDialogs(props: BrandDialogsProps) {
  return (
    <>
      <StatsDialog
        isOpen={props.isStatsDialogOpen}
        onOpenChange={props.setIsStatsDialogOpen}
        statsPeriod={props.statsPeriod}
        setStatsPeriod={props.setStatsPeriod}
        currentBrandStats={props.currentBrandStats}
        brandMedalsByPeriod={props.brandMedalsByPeriod}
        setIsBrandReviewsOpen={props.setIsBrandReviewsOpen}
      />
      <StatusesDialog
        isOpen={props.isStatusesDialogOpen}
        onOpenChange={props.setIsStatusesDialogOpen}
        assignedStatuses={props.activeStatuses}
        potentialStatuses={props.potentialStatuses}
      />
      <AiSizeDialog
        isOpen={props.isAiSizeDialogOpen}
        onOpenChange={props.setIsAiSizeDialogOpen}
        displayName={props.displayName}
      />
      <PressKitDialog
        isOpen={props.isPressKitOpen}
        onOpenChange={props.setIsPressKitOpen}
        displayName={props.displayName}
      />
      <LiveReminderDialog
        isOpen={props.isLiveReminderSet}
        onOpenChange={props.setIsLiveReminderOpen}
        liveReminderTime={props.liveReminderTime}
        setLiveReminderTime={props.setLiveReminderTime}
        toast={props.toast}
      />
      <ShareLookDialog
        isOpen={props.isShareLookOpen}
        onOpenChange={props.setIsShareLookOpen}
        user={props.user}
        purchasedProducts={props.purchasedProducts}
        toast={props.toast}
        displayName={props.displayName}
      />
      <QuizResultsDialog
        isOpen={props.isQuizResultsOpen}
        onOpenChange={props.setIsQuizResultsOpen}
        quizResults={props.quizResults}
        displayName={props.displayName}
        isUpgradeRequested={props.isUpgradeRequested}
        setIsUpgradeRequested={props.setIsUpgradeRequested}
        toast={props.toast}
      />
      <RetailerListDialog
        isOpen={props.isRetailerListOpen}
        onOpenChange={props.setIsRetailerOpen}
        displayName={props.displayName}
        retailStores={props.retailStores}
      />
      <TeamDialog
        isOpen={props.isTeamOpen}
        onOpenChange={props.setIsTeamOpen}
        brand={props.brand}
        currentTeamIdx={props.currentTeamIdx}
        setCurrentTeamIdx={props.setCurrentTeamIdx}
        displayName={props.displayName}
      />
    </>
  );
}
