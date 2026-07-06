/**
 * Platform Core · заметки столпа «Связь».
 * Единый inbox: все точки создания пишут сюда; PG — следующий шаг (repository stub).
 */
import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix';
import { platformCoreCabinetSectionHref } from '@/lib/platform-core-cabinet-workspace';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';

export type PlatformCoreNoteStatus = 'open' | 'accepted' | 'cancelled';

export type PlatformCoreNote = {
  id: string;
  collectionId: string;
  roleId: CoreChainRoleId;
  title: string;
  body: string;
  assigneeId: string;
  assigneeLabel: string;
  dueAt: string | null;
  notify: boolean;
  attachmentName: string | null;
  attachmentDataUrl: string | null;
  status: PlatformCoreNoteStatus;
  sourceLabel: string | null;
  sourceHref: string | null;
  createdAt: string;
  updatedAt: string;
};

export const PLATFORM_CORE_COMMS_NOTES_SECTION: Record<
  'brand' | 'shop' | 'manufacturer' | 'supplier',
  string
> = {
  brand: 'brand-cm-notes',
  shop: 'shop-cm-notes',
  manufacturer: 'mfr-cm-notes',
  supplier: 'sup-cm-notes',
};

const STORAGE_KEY = 'platform_core_notes_v1';

type NoteStore = Record<string, PlatformCoreNote[]>;

function storageKey(collectionId: string, roleId: CoreChainRoleId): string {
  return `${collectionId}::${roleId}`;
}

function readStore(): NoteStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as NoteStore;
  } catch {
    return {};
  }
}

function writeStore(store: NoteStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function newId(): string {
  return `pcn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function listPlatformCoreNotes(
  collectionId: string,
  roleId: CoreChainRoleId
): PlatformCoreNote[] {
  const store = readStore();
  const rows = store[storageKey(collectionId, roleId)] ?? [];
  return [...rows].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export type CreatePlatformCoreNoteInput = {
  collectionId: string;
  roleId: CoreChainRoleId;
  title: string;
  body?: string;
  assigneeId?: string;
  assigneeLabel?: string;
  dueAt?: string | null;
  notify?: boolean;
  attachmentName?: string | null;
  attachmentDataUrl?: string | null;
  sourceLabel?: string | null;
  sourceHref?: string | null;
};

export function createPlatformCoreNote(input: CreatePlatformCoreNoteInput): PlatformCoreNote {
  const now = new Date().toISOString();
  const note: PlatformCoreNote = {
    id: newId(),
    collectionId: input.collectionId,
    roleId: input.roleId,
    title: input.title.trim() || 'Заметка',
    body: input.body?.trim() ?? '',
    assigneeId: input.assigneeId?.trim() || 'unassigned',
    assigneeLabel: input.assigneeLabel?.trim() || 'Не назначен',
    dueAt: input.dueAt ?? null,
    notify: input.notify ?? Boolean(input.dueAt),
    attachmentName: input.attachmentName ?? null,
    attachmentDataUrl: input.attachmentDataUrl ?? null,
    status: 'open',
    sourceLabel: input.sourceLabel ?? null,
    sourceHref: input.sourceHref ?? null,
    createdAt: now,
    updatedAt: now,
  };
  const store = readStore();
  const key = storageKey(input.collectionId, input.roleId);
  store[key] = [note, ...(store[key] ?? [])];
  writeStore(store);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('platform-core-notes-changed', { detail: { key } }));
  }
  return note;
}

export function updatePlatformCoreNoteStatus(
  collectionId: string,
  roleId: CoreChainRoleId,
  noteId: string,
  status: PlatformCoreNoteStatus
): PlatformCoreNote | null {
  const store = readStore();
  const key = storageKey(collectionId, roleId);
  const rows = store[key] ?? [];
  const idx = rows.findIndex((n) => n.id === noteId);
  if (idx < 0) return null;
  const updated: PlatformCoreNote = {
    ...rows[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  rows[idx] = updated;
  store[key] = rows;
  writeStore(store);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('platform-core-notes-changed', { detail: { key } }));
  }
  return updated;
}

export function platformCoreCommsNotesHref(
  variant: keyof typeof PLATFORM_CORE_COMMS_NOTES_SECTION,
  demo: Pick<PlatformCoreDemoContext, 'collectionId' | 'demoOrderId' | 'demoArticleId'>
): string {
  const roleId: CoreChainRoleId =
    variant === 'manufacturer'
      ? 'manufacturer'
      : variant === 'supplier'
        ? 'supplier'
        : variant;
  return platformCoreCabinetSectionHref(
    roleId,
    'comms',
    PLATFORM_CORE_COMMS_NOTES_SECTION[variant],
    demo
  );
}

export function isPlatformCoreCommsNotesSection(
  sectionId: string | null | undefined,
  variant: keyof typeof PLATFORM_CORE_COMMS_NOTES_SECTION
): boolean {
  return sectionId?.trim() === PLATFORM_CORE_COMMS_NOTES_SECTION[variant];
}

/** Демо-участники для назначения заметки (two-role: brand + shop). */
export const PLATFORM_CORE_NOTE_ASSIGNEES = [
  { id: 'brand-lead', label: 'Бренд · менеджер коллекции' },
  { id: 'shop-buyer', label: 'Магазин · байер' },
] as const;
