import {
  createPlatformCoreNote,
  listPlatformCoreNotes,
  platformCoreCommsNotesHref,
  updatePlatformCoreNoteStatus,
  PLATFORM_CORE_COMMS_NOTES_SECTION,
} from '@/lib/platform-core-notes';

describe('platform-core-notes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates and lists notes per collection and role', () => {
    const note = createPlatformCoreNote({
      collectionId: 'SS27',
      roleId: 'brand',
      title: 'Проверить образец',
      assigneeId: 'brand-lead',
      assigneeLabel: 'Бренд · менеджер',
    });
    expect(note.status).toBe('open');
    const rows = listPlatformCoreNotes('SS27', 'brand');
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe('Проверить образец');
  });

  it('updates note status to accepted or cancelled', () => {
    const note = createPlatformCoreNote({
      collectionId: 'SS27',
      roleId: 'brand',
      title: 'Задача',
    });
    updatePlatformCoreNoteStatus('SS27', 'brand', note.id, 'accepted');
    expect(listPlatformCoreNotes('SS27', 'brand')[0].status).toBe('accepted');
    updatePlatformCoreNoteStatus('SS27', 'brand', note.id, 'cancelled');
    expect(listPlatformCoreNotes('SS27', 'brand')[0].status).toBe('cancelled');
  });

  it('builds comms notes cabinet href', () => {
    const href = platformCoreCommsNotesHref('brand', {
      collectionId: 'SS27',
      demoOrderId: 'ORD-1',
      demoArticleId: 'ART-1',
    });
    expect(href).toContain('pillar=comms');
    expect(href).toContain(`section=${PLATFORM_CORE_COMMS_NOTES_SECTION.brand}`);
    expect(href).toContain('collection=SS27');
  });
});
