'use client';

import { useEffect, useState } from 'react';

const LG_MIN_WIDTH_PX = 1024;

/** `true` when viewport ≥ lg (1024px). */
export function useMinLg(): boolean {
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG_MIN_WIDTH_PX}px)`);
    const update = () => setIsLg(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isLg;
}
