# Phase 23 — Platform Core UI Surface Audit

**Status:** active cleanup baseline · **Scope:** Brand + Shop, five pillars only  
**Rule:** a visible Platform Core tab must open, contain useful content, and lead to the next step.

## 1. Why this audit exists

Previous phases separated Platform Core from B2C, advanced B2B, extended roles and archive imports. The remaining risk is user-facing: tabs, cards, links, peer strips or CTAs that still appear in the baseline but are only partial, legacy-only, demo-only, duplicated, or dead-end.

Platform Core v1 now uses a **strict visible allowlist** instead of a soft denylist. This prevents future partial sections from leaking into the Brand/Shop cabinet.

## 2. Surface status taxonomy

| Status | Meaning | UI decision |
|--------|---------|-------------|
| `CORE_WORKING` | Visible, opens, has useful data/action and next/back link | Keep |
| `CORE_PARTIAL` | Needed for five pillars but incomplete | Fix before broad rollout |
| `PENDING_P0` | Commercially required but not ready | Hide from baseline until implemented |
| `DEMO_ONLY` | Investor/demo only, not a working section | Hide or archive |
| `LEGACY_ONLY` | Exists only through legacy route/workspace | Hide from baseline or wrap with core bridge |
| `DUPLICATE` | Repeats another action/surface | Merge |
| `EMPTY` | Opens but provides no usable action/data | Hide or fix |
| `BROKEN` | Does not open, bad href, missing handler | Fix immediately |

## 3. Current visible allowlist

### Brand

| Pillar | Visible section IDs | Decision |
|--------|---------------------|----------|
| `development` | `brand-dev-w2-hub`, `brand-dev-dossier` | Keep |
| `sample_collection` | `brand-sc-linesheets`, `brand-sc-showroom`, `brand-sc-publish` | Keep; publish must become primary hub CTA |
| `collection_order` | `brand-co-registry`, `brand-co-detail` | Keep; revision is pending |
| `order_production` | `brand-op-handoff`, `brand-op-registry`, `brand-op-dossier` | Keep; QC/packing/closeout are pending |
| `comms` | `brand-cm-order-chat`, `brand-cm-article-chat`, `brand-cm-calendar`, `brand-cm-notes` | Keep; collection chat is pending |

### Shop

| Pillar | Visible section IDs | Decision |
|--------|---------------------|----------|
| `development` | none | Correct: read-only bridge stays hidden until fully wired |
| `sample_collection` | `shop-sc-showroom` | Keep |
| `collection_order` | `shop-co-matrix`, `shop-co-checkout`, `shop-co-registry`, `shop-co-detail`, `shop-co-buyer-tracking` | Keep; tracking should migrate conceptually into OP |
| `order_production` | none yet | Pending: tracking/acceptance/closeout |
| `comms` | `shop-cm-order-chat`, `shop-cm-calendar-order` | Keep; collection chat is pending |

## 4. Pending commercial sections — hidden until implemented

| Role | Pillar | Pending section IDs | Why pending |
|------|--------|---------------------|-------------|
| Brand | `collection_order` | `brand-co-revision` | Revision must be inside the 12-step flow, not side-panel only |
| Brand | `order_production` | `brand-op-qc`, `brand-op-packing`, `brand-op-closeout` | OP tail is weakest pillar; needs PG/BFF/UI |
| Brand | `comms` | `brand-cm-collection-chat` | Collection-level thread does not exist yet |
| Shop | `development` | `shop-dev-bridge` | Useful read-only bridge but should not appear as full pillar tab until comments/request flow is real |
| Shop | `collection_order` | `shop-co-revision` | Revision needs shared state with brand |
| Shop | `order_production` | `shop-op-tracking`, `shop-op-acceptance`, `shop-op-closeout` | Tracking/acceptance/closeout must be real, not stub |
| Shop | `comms` | `shop-cm-collection-chat` | Collection-level thread missing |

## 5. Known dead ends from Phase 22

| Dead end | Problem | Required fix |
|----------|---------|--------------|
| `documents-gateway` | Exported but not consumed by core UI | Wire into dossier/documents panel |
| `collection` comms | Entity undefined | Add collection thread kind |
| `closeout` | No shop reverse link | Add buyer acceptance + closeout |
| `revision` | No return into 12-step CO flow | Add revision step and status cycle |
| `factory.materials` | Leads outside Brand/Shop baseline | Replace with core-facing material/BOM panel |

## 6. Action cleanup rules

Only one primary action may exist for each domain action on a given surface tier:

- Publish
- Approve
- Reject
- Revision
- Export
- Archive
- Open chat
- Track shipment
- Close order

Duplicates should be secondary links to the canonical action, not independent buttons.

## 7. Acceptance criteria

A Platform Core baseline section may be visible only if all are true:

1. It belongs to `brand` or `shop`.
2. It belongs to one of the five pillars.
3. It is listed in `PLATFORM_CORE_TWO_ROLE_VISIBLE_SECTION_ALLOWLIST`.
4. It is not listed in `PLATFORM_CORE_TWO_ROLE_PENDING_SECTION_BACKLOG`.
5. Its primary CTA opens a non-archive, non-legacy baseline route.
6. It has a next or back link in the lifecycle.
7. It is not demo-only, empty, or duplicate primary action.

## 8. Next implementation order

1. Guard tests for visible allowlist and pending backlog.
2. Publish CTA in Brand Sample Collection hub.
3. Revision in Collection Order flow.
4. Order Production tail: QC, packing, closeout.
5. Collection-level comms.
6. Documents gateway wiring.
7. DataTable/EmptyState/PeerStrip consolidation.
