import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Runway Embed · Syntha',
  description: 'Минимальный iframe-friendly runway switcher для партнёров и investor decks.',
  robots: { index: false, follow: false },
};

export default function EmbedRunwayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-0 bg-white" data-runway-embed-root>
      {children}
    </div>
  );
}
