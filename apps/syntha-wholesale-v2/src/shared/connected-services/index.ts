import type { CommercialEntityReference } from '@/shared/commercial-context';
import type { WorkspaceHref } from '@/shared/workspace/workspace-links';

export interface EntityMessageThread {
  readonly id: string;
  readonly entityType: CommercialEntityReference['type'];
  readonly entityId: string;
  readonly threadId: string;
  readonly title: string;
  readonly targetHref: WorkspaceHref;
}

export interface WorkspaceNotification {
  readonly id: string;
  readonly type: 'deadline' | 'decision' | 'status';
  readonly title: string;
  readonly description: string;
  readonly sourceEntity: CommercialEntityReference;
  readonly targetHref: WorkspaceHref;
  readonly createdAt: string;
  readonly priority: 'low' | 'normal' | 'high';
  readonly readState: 'unread' | 'read';
}

export interface WorkspaceCalendarEvent {
  readonly id: string;
  readonly entityType: CommercialEntityReference['type'];
  readonly entityId: string;
  readonly eventType: 'opens' | 'deadline' | 'review';
  readonly startsAt: string;
  readonly endsAt: string;
  readonly title: string;
  readonly targetHref: WorkspaceHref;
}

export interface WorkspaceSearchResult {
  readonly id: string;
  readonly entityType: CommercialEntityReference['type'];
  readonly title: string;
  readonly subtitle: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly href: WorkspaceHref;
}
