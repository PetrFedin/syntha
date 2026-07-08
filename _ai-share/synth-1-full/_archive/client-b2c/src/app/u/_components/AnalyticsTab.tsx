'use client';

import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import EnhancedDataVisualization from '@/components/user/enhanced-data-visualization';
import AutomatedInsightsPanel from '@/components/user/automated-insights-panel';
import PredictiveAnalytics from '@/components/user/predictive-analytics';
import { Analytics360Tab } from './Analytics360Tab';
import AdvancedAnalytics from '@/components/user/advanced-analytics';

interface AnalyticsTabProps {
  user: any;
}

export function AnalyticsTab({ user }: AnalyticsTabProps) {
  return (
    <TabsContent value="analytics" className="py-6 duration-300 animate-in fade-in-50">
      <div className="space-y-6">
        {/* Enhanced Data Visualization - Clear and comprehensive data */}
        <EnhancedDataVisualization />

        {/* Automated Insights - AI-powered insights */}
        <AutomatedInsightsPanel />

        {/* Predictive Analytics - Forecasts and Trends */}
        <PredictiveAnalytics />

        <Analytics360Tab user={user} />
        <AdvancedAnalytics />
      </div>
    </TabsContent>
  );
}
