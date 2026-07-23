import Link from 'next/link';
import type { ReactNode } from 'react';

export type IconName =
  | 'home'
  | 'collections'
  | 'showroom'
  | 'selection'
  | 'orders'
  | 'messages'
  | 'calendar'
  | 'analytics'
  | 'settings'
  | 'search'
  | 'bell'
  | 'help'
  | 'chevron-down'
  | 'arrow-right'
  | 'sparkles'
  | 'trend-up'
  | 'clock'
  | 'check'
  | 'more';

interface IconProps {
  readonly name: IconName;
  readonly size?: number;
  readonly title?: string;
}

export function Icon({ name, size = 20, title }: IconProps) {
  const content = (() => {
    switch (name) {
      case 'home':
        return <><path d="M3 10.8 12 3l9 7.8" /><path d="M5.5 9.5V21h13V9.5" /><path d="M9.5 21v-7h5v7" /></>;
      case 'collections':
        return <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h6M7 16h8" /></>;
      case 'showroom':
        return <><path d="M4 7h16l-1.2 13H5.2L4 7Z" /><path d="M8 7a4 4 0 0 1 8 0" /></>;
      case 'selection':
        return <><path d="m4 5 2-2h12l2 2v16H4V5Z" /><path d="M8 3v5l4-2 4 2V3" /></>;
      case 'orders':
        return <><path d="M5 3h14v18H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>;
      case 'messages':
        return <><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 9h8M8 12h5" /></>;
      case 'calendar':
        return <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /><path d="M8 14h3v3H8z" /></>;
      case 'analytics':
        return <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>;
      case 'settings':
        return <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>;
      case 'search':
        return <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>;
      case 'bell':
        return <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>;
      case 'help':
        return <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.3 2.2c-.8.4-1.1.9-1.1 1.8M12 17h.01" /></>;
      case 'chevron-down':
        return <path d="m7 10 5 5 5-5" />;
      case 'arrow-right':
        return <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>;
      case 'sparkles':
        return <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" /><path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" /><path d="m5 13 .6 1.9 1.9.6-1.9.6L5 18l-.6-1.9-1.9-.6 1.9-.6L5 13Z" /></>;
      case 'trend-up':
        return <><path d="m4 16 5-5 4 4 7-8" /><path d="M15 7h5v5" /></>;
      case 'clock':
        return <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>;
      case 'check':
        return <path d="m5 12 4 4L19 6" />;
      case 'more':
        return <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>;
    }
  })();

  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {content}
    </svg>
  );
}

interface ButtonLinkProps {
  readonly href: string;
  readonly children: ReactNode;
  readonly variant?: 'primary' | 'secondary' | 'ghost';
  readonly icon?: IconName;
  readonly className?: string;
}

export function ButtonLink({ href, children, variant = 'primary', icon, className = '' }: ButtonLinkProps) {
  return (
    <Link className={`button button--${variant} ${className}`.trim()} href={href}>
      <span>{children}</span>
      {icon ? <Icon name={icon} size={18} /> : null}
    </Link>
  );
}

interface IconButtonProps {
  readonly href: string;
  readonly icon: IconName;
  readonly label: string;
  readonly badge?: string;
  readonly className?: string;
}

export function IconButton({ href, icon, label, badge, className = '' }: IconButtonProps) {
  return (
    <Link className={`iconButton ${className}`.trim()} href={href} aria-label={label} title={label}>
      <Icon name={icon} />
      {badge ? <span className="iconButton__badge">{badge}</span> : null}
    </Link>
  );
}

interface BadgeProps {
  readonly children: ReactNode;
  readonly tone?: 'neutral' | 'accent' | 'success' | 'warning';
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

interface MetricCardProps {
  readonly label: string;
  readonly value: string;
  readonly change: string;
  readonly tone?: 'positive' | 'neutral';
}

export function MetricCard({ label, value, change, tone = 'neutral' }: MetricCardProps) {
  return (
    <article className="metricCard">
      <p>{label}</p>
      <strong>{value}</strong>
      <span className={tone === 'positive' ? 'metricCard__change metricCard__change--positive' : 'metricCard__change'}>
        {tone === 'positive' ? <Icon name="trend-up" size={14} /> : null}
        {change}
      </span>
    </article>
  );
}
