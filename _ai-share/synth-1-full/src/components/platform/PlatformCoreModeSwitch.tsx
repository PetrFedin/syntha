'use client';

import Link from 'next/link';
import { platformCoreHeaderControlBtnClass } from '@/lib/platform-core-header-controls';
import {
  PLATFORM_CORE_B2B_HUB_HREF,
  PLATFORM_CORE_B2C_HUB_HREF,
  type PlatformCoreSurfaceMode,
} from '@/lib/platform-core-mode-surfaces';

type Props = {
  mode: PlatformCoreSurfaceMode;
};

/** Переключатель B2B (витрина главной) / B2C (Platform Core hub). */
export function PlatformCoreModeSwitch({ mode }: Props) {
  return (
    <div
      data-testid="platform-core-mode-switch"
      className="flex shrink-0 items-center gap-1"
      role="group"
      aria-label="Режим платформы: B2B или B2C"
    >
      <Link
        href={PLATFORM_CORE_B2B_HUB_HREF}
        data-testid="platform-core-mode-b2b"
        aria-current={mode === 'b2b' ? 'page' : undefined}
        className={platformCoreHeaderControlBtnClass(mode === 'b2b')}
      >
        B2B
      </Link>
      <Link
        href={PLATFORM_CORE_B2C_HUB_HREF}
        data-testid="platform-core-mode-b2c"
        aria-current={mode === 'b2c' ? 'page' : undefined}
        className={platformCoreHeaderControlBtnClass(mode === 'b2c')}
      >
        B2C
      </Link>
    </div>
  );
}
