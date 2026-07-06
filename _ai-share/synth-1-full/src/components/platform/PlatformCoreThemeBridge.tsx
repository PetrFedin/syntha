'use client';

import { useEffect } from 'react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { isSynthaEmbedClient } from '@/lib/platform-core-ports/legacy/syntha-embed';

/** Platform Core (:3001): `data-platform-core` + `prefers-color-scheme` → класс `.dark` на `<html>`. */
export function PlatformCoreThemeBridge() {
  useEffect(() => {
    if (!isPlatformCoreMode()) return;
    const root = document.documentElement;
    root.dataset.platformCore = '1';
    if (isSynthaEmbedClient()) {
      root.dataset.synthaEmbed = '1';
    }

    const applyColorScheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    };

    applyColorScheme();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyColorScheme);
    return () => {
      media.removeEventListener('change', applyColorScheme);
      root.classList.remove('dark');
      delete root.dataset.platformCore;
      delete root.dataset.synthaEmbed;
    };
  }, []);

  return null;
}
