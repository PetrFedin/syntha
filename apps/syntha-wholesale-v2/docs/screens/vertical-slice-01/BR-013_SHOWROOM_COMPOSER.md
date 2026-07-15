# BR-013 — Showroom Composer

## 1. Screen identity

- **Role:** Brand
- **Route:** `/wholesale-v2/brand/collections/:collectionId/presentation`
- **Template:** Builder Workspace
- **Priority:** P0
- **Primary job:** compose a buyer-ready, shoppable collection presentation.
- **Primary action:** `Preview as buyer`
- **Save model:** autosaved draft with explicit save state.

## 2. Product intent

The Composer must combine:

- visual storytelling;
- commercial clarity;
- product discovery;
- buyer-specific content;
- fast conversion into selection/order.

It is not a free-form website builder. It uses a controlled set of blocks to preserve consistency, accessibility and responsive behaviour.

## 3. Entry points

- Collection Overview → Build/Continue showroom;
- Presentation tab;
- return from Buyer Preview;
- publish readiness issue;
- duplicated collection setup.

## 4. Exit points

- Buyer Preview;
- Collection Overview;
- product management;
- Publish Review;
- media library;
- buyer access configuration.

Unsaved local state must never be lost on exit. Autosave failure blocks destructive navigation until user chooses retry/discard/export recovery.

## 5. Data contract

```ts
type ShowroomComposerVM = {
  collection: CollectionSummary;
  draftVersion: CollectionVersionSummary;
  publishedVersion?: CollectionVersionSummary;
  showroom: {
    id: string;
    status: 'draft' | 'scheduled' | 'live' | 'closed';
    presentationConfig: PresentationConfig;
  };
  blocks: StoryBlockEditorModel[];
  products: ComposerProductSummary[];
  looks: ComposerLookSummary[];
  media: MediaAssetSummary[];
  buyerContexts: BuyerPreviewContextSummary[];
  readiness: PresentationReadinessResult;
  saveState: {
    state: 'saved' | 'saving' | 'unsaved' | 'failed' | 'conflict';
    savedAt?: string;
    version: number;
  };
  permissions: {
    canEdit: boolean;
    canPreview: boolean;
    canPublish: boolean;
  };
};
```

## 6. Canonical desktop layout

```text
BuilderHeader 56 px
├── Back to Collection
├── Collection / Presentation
├── Draft version
├── Save state
├── Undo / Redo
├── Readiness count
└── Preview as buyer

Source rail 240–280 px
├── Blocks
├── Products
├── Looks
├── Media
└── Structure navigator

Canvas flexible
├── Selected responsive preview width
├── Story/product blocks
├── Drop position
└── Inline block toolbar

Inspector 320–380 px
├── Selected block settings
├── Visibility rules
├── Content/commercial settings
└── Validation issues
```

Canvas receives priority width. At widths below the full builder threshold, Source or Inspector becomes a drawer according to the responsive contract.

## 7. Builder header

Shows:

- collection identity;
- `Draft` or `Editing changes to vN`;
- autosave state;
- current buyer context if preview mode is active;
- undo/redo;
- validation issue count;
- primary `Preview as buyer`;
- More: discard draft changes, view published version, keyboard shortcuts.

No direct Publish button in the Composer. Publication happens through Publish Review after buyer preview/readiness.

## 8. Allowed presentation blocks

### P0 blocks

1. `Hero`
2. `Rich text`
3. `Image`
4. `Video`
5. `Gallery`
6. `Moodboard`
7. `Look grid`
8. `Product grid`
9. `Featured product`
10. `Linesheet entry`
11. `Quote / sales note`
12. `Divider / spacing`

### P1 blocks

- 360 media;
- 3D viewer;
- interactive styleboard;
- live appointment whiteboard;
- buyer-specific recommendation block.

## 9. Block rules

Every block has:

- stable ID;
- type;
- display order;
- content;
- responsive settings from constrained options;
- visibility rule;
- analytics tag;
- validation state;
- accessibility metadata.

Blocks cannot contain arbitrary HTML, arbitrary CSS, custom scripts or unbounded layout properties.

## 10. Source rail

### Blocks tab

Grouped by job:

- Story;
- Products;
- Looks;
- Media;
- Navigation.

Each block entry includes icon, name and one-line purpose.

Drag-and-drop is optional convenience. Keyboard/click insertion is mandatory.

### Products tab

- search by style/name/code;
- filters: category, drop, colour, delivery, readiness;
- product thumbnail and commercial readiness;
- add as featured product;
- add to selected product grid;
- open product editing in a new focused route/drawer without losing composer state.

### Looks tab

- look thumbnail;
- product count;
- readiness;
- add look grid or single look.

### Media tab

- image/video search;
- type/filter;
- usage count;
- upload when permitted;
- no untracked external image URL in P0.

### Structure navigator

Tree/list of blocks with:

- drag/reorder;
- keyboard reorder;
- visibility icon;
- issue marker;
- duplicate;
- delete.

## 11. Canvas

### Viewport controls

- Desktop;
- Tablet;
- Mobile.

These are preview widths inside the Composer, not separate designs.

### Canvas behaviour

- selected block has subtle border and toolbar;
- hover does not become the only way to reveal actions;
- product actions are disabled in editor mode unless `Interaction preview` is enabled;
- content width follows Showroom template;
- media skeletons preserve ratio;
- drag insertion uses clear drop zones;
- scroll position preserved after inspector changes.

### Inline block toolbar

Maximum visible actions:

- move;
- edit/select;
- duplicate;
- More.

Delete lives in More with confirmation when content/links exist.

## 12. Inspector

Inspector content changes by selected block.

### Common settings

- block title/internal label;
- width: contained / wide / full bleed where allowed;
- alignment;
- background: system/brand-approved values only;
- spacing tokens, not pixels;
- visibility;
- analytics label;
- accessibility label/alt/poster.

### Buyer visibility

Rules may use:

- all allowed buyers;
- market;
- buyer segment;
- explicit shop allow/exclude;
- price-list context;
- language.

The UI must show how many active buyers are affected. Contradictory rules are blocking errors.

### Product grid settings

- source: all products / selected products / category / drop / look;
- sort order;
- card density;
- visible commercial fields;
- quick selection enabled;
- maximum initial items;
- filter availability.

### Hero settings

- media;
- headline;
- supporting copy;
- optional CTA to a section;
- overlay strength from controlled choices;
- focal point;
- mobile crop/focal preview.

### Video settings

- source asset;
- poster;
- muted autoplay allowed only with no sound;
- controls;
- captions/transcript metadata;
- fallback image.

## 13. WFX-inspired requirements

P0 Composer must enable:

- high-resolution imagery;
- HD video;
- detailed product specifications through shoppable blocks;
- personalised buyer/segment content;
- shoppable lookbook and linesheet modes;
- secure buyer-preview context;
- future adapter slot for 3D/360 media.

It must improve on a simple catalogue by connecting every shoppable product reference to the same Selection and Order domain entities.

## 14. Navigation within showroom

Composer configures a restrained navigation model:

- Story;
- Products;
- Looks;
- Linesheet;
- optional named chapters/drops.

Maximum primary navigation items: 6. Extra sections live in a section menu.

Changing modes must preserve buyer selection and current filters in buyer-facing runtime.

## 15. Autosave and versioning

### Autosave

- debounce after content change;
- immediate save for destructive/reorder actions when practical;
- visible `Saving…`, `Saved`, `Save failed`;
- retry action;
- local recovery buffer where architecture permits.

### Version conflict

If server version changes:

- stop autosave;
- show conflict banner;
- identify editor/time when available;
- actions: Reload latest, Compare, Save a recovery copy;
- never overwrite automatically.

### Published collection

Edits create a draft version separate from published showroom. Buyer-facing live version remains unchanged until Publish Review.

## 16. Readiness panel

Blocking checks:

- no shoppable product surface;
- broken product reference;
- product hidden from every selected buyer;
- required media missing;
- video without poster/fallback;
- invalid buyer visibility rule;
- empty block;
- inaccessible text/media contrast;
- no buyer navigation mode;
- collection commercial readiness failure.

Warnings:

- no editorial intro;
- very large initial media payload;
- too many blocks;
- no mobile focal point;
- product grid with no filters for a large assortment.

Every issue deep-links to the affected block or collection setting.

## 17. Empty state

If no blocks exist:

- canvas shows a compact start panel;
- options: `Start from template`, `Build manually`;
- templates are controlled platform templates, not arbitrary themes;
- initial recommended template: Hero → Story → Looks → Product grid → Linesheet.

## 18. Loading state

- shell/header renders first;
- source data and canvas skeletons load independently;
- large media loads progressively;
- composer is read-only until draft version lock/context is established;
- no draggable UI before structure data is ready.

## 19. Error states

- draft failed to load;
- media upload failed;
- product reference unavailable;
- save failed;
- version conflict;
- permission changed while editing;
- published snapshot cannot be loaded.

Errors preserve existing content whenever possible.

## 20. Permissions

- `collection.read` — view composer read-only;
- `collection.write` — edit blocks/content;
- `collection.publish` — does not publish here, but enables Publish Review entry;
- media upload permission;
- buyer access permission for visibility rules.

Read-only mode still supports buyer preview when permitted.

## 21. Keyboard behaviour

- Tab navigates header/source/canvas/inspector;
- Enter inserts/selects focused block;
- arrow keys reorder through explicit command mode;
- Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z undo/redo;
- Delete removes selected block only after focus/confirmation rules;
- Escape deselects/closes layer;
- shortcut help available from More.

## 22. Responsive behaviour

### MacBook / full-screen

- full three-pane builder;
- canvas max width depends on selected preview mode;
- source and inspector independently collapsible;
- keyboard-first editing.

### iPad landscape

- source rail collapsible/overlay;
- canvas primary;
- inspector drawer or 320 px panel;
- touch reorder handles 44 px targets;
- hardware keyboard supported.

### iPad portrait

Modes:

- Structure;
- Canvas;
- Settings.

One primary work surface at a time with persistent save/readiness summary.

### iPhone

P0 supports review and light editing, not full layout construction.

- block list screen;
- block detail editor;
- mobile preview;
- reorder via dedicated move controls;
- source insertion via full-screen sheet;
- sticky Preview action;
- no squeezed three-pane UI.

## 23. Analytics events

- `showroom_composer_opened`;
- `showroom_block_added`;
- `showroom_block_reordered`;
- `showroom_block_updated`;
- `showroom_block_deleted`;
- `showroom_visibility_rule_changed`;
- `showroom_preview_viewport_changed`;
- `showroom_autosave_failed`;
- `showroom_readiness_issue_opened`;
- `buyer_preview_started_from_composer`.

Do not emit every keystroke.

## 24. Acceptance criteria

1. User can build a valid showroom from allowed blocks.
2. Every product/look reference remains linked to collection entities.
3. Autosave and conflict handling work.
4. Published version is unaffected by draft editing.
5. Buyer visibility rules are explicit and validated.
6. Desktop, tablet and mobile previews use canonical responsive rules.
7. High-resolution image/video blocks load progressively.
8. Composer is keyboard and touch accessible.
9. No arbitrary CSS/HTML/theme system exists.
10. Preview receives exact draft version and chosen buyer context.

## 25. Non-goals

- full website builder;
- custom code;
- PLM product creation;
- production/sample approval;
- native video calling;
- 3D editor;
- direct publish without review.
