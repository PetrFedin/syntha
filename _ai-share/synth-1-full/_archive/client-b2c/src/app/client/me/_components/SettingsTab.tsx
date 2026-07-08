'use client';

import React from 'react';
import SettingsForm from '@/components/user/settings-form';

interface SettingsTabProps {
  user: any;
}

export function SettingsTab({ user }: SettingsTabProps) {
  return <SettingsForm user={user} />;
}
