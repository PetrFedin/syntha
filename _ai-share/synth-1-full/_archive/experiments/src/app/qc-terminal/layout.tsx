import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Мобильный терминал ОТК',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function QcTerminalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="selection:bg-accent-primary/20 min-h-screen bg-slate-50 font-sans text-slate-900">
      {children}
    </div>
  );
}
