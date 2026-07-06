'use client';

import {
  SYNTHA_STYLE_INTELLIGENCE_HERO,
  SYNTHA_STYLE_INTELLIGENCE_TAGLINE,
} from '@/lib/platform-core-ports/legacy/marketing/syntha-style-intelligence-hero';

/**
 * Рекламный hero hub Platform Core — тот же слайд, что на главной витрине:
 * светло-коричневый пиджак, «Syntha» + «ИНТЕЛЛЕКТ СТИЛЯ» (tagline всегда виден).
 */
export function PlatformCoreSynthaStyleBanner() {
  const hero = SYNTHA_STYLE_INTELLIGENCE_HERO;

  return (
    <section
      data-testid="platform-core-syntha-style-banner"
      aria-label={`Syntha · ${SYNTHA_STYLE_INTELLIGENCE_TAGLINE}`}
      className="group/card relative flex h-[min(200px,28vh)] min-h-[180px] items-center overflow-hidden rounded-xl border border-slate-100 bg-[#fcfcfc] shadow-md shadow-slate-200/30 sm:h-[min(240px,32vh)] sm:min-h-[200px] md:h-[min(280px,34vh)] md:min-h-[240px] lg:shadow-2xl lg:shadow-slate-200/50"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={hero.imageUrl}
          alt={hero.imageAlt}
          className="h-full w-full object-cover object-[center_30%] transition-transform duration-[30s] group-hover/card:scale-105 md:object-center"
        />
        {/* Mobile: только левый градиент — без затемнения снизу */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/5 to-transparent md:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-black/80 via-black/25 to-transparent md:block" />
      </div>

      <div className="relative z-10 w-full px-3 py-3 sm:px-8 sm:py-6 md:px-10 md:py-8 lg:px-14">
        <div className="max-w-3xl space-y-1 sm:space-y-4 md:space-y-5">
          <div className="space-y-0.5 sm:space-y-2 md:space-y-3">
            <p
              data-testid="platform-core-syntha-style-tagline"
              className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/70 sm:text-[10px] md:text-sm"
            >
              {SYNTHA_STYLE_INTELLIGENCE_TAGLINE}
            </p>
            <h2 className="text-xl font-bold leading-[0.95] tracking-tight text-white sm:text-2xl md:text-4xl lg:text-5xl">
              {hero.title}
            </h2>
          </div>
          <p className="hidden max-w-xl truncate border-l-2 border-indigo-500/50 pl-3 text-sm font-medium text-slate-300 sm:block md:line-clamp-1 md:pl-5 md:text-[15px] lg:line-clamp-none lg:whitespace-normal lg:overflow-visible">
            {hero.description}
          </p>
        </div>
      </div>
    </section>
  );
}
