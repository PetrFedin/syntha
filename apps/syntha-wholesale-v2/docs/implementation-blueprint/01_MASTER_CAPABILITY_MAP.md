# 01 — Master Capability Map

## 1. Назначение

Этот документ — канонический каталог функций Syntha Wholesale V2.

Каждая функция имеет постоянный `Capability ID`. Screen Bible, API, события, permissions и Cursor tasks должны ссылаться на этот ID.

Формат:

```text
CAP-[DOMAIN]-[NNN]
```

Приоритеты:

- `P0` — коммерческий MVP;
- `P1` — следующий релиз после основного потока;
- `P2` — расширение;
- `LATER` — предусмотрено архитектурно, но не входит в текущую программу.

Референс означает источник сильного продуктового паттерна, а не буквальное копирование интерфейса.

---

# 2. Platform Foundation

| ID | Возможность | Основные роли | Экран/контекст | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-PLT-001 | Вход и защищённая сессия | все | Sign in | User, Session | authenticated | P0 | — | enterprise baseline |
| CAP-PLT-002 | Invitation onboarding | все | Invitation acceptance | User, Membership, Invitation | invitation.accept | P0 | 001 | JOOR/NuORDER/WFX pattern |
| CAP-PLT-003 | Выбор активной организации | multi-membership user | AppShell | Organisation, Membership | organisation.switch | P0 | 001 | JOOR/NuORDER pattern |
| CAP-PLT-004 | Единый AppShell Brand/Shop | все | все authenticated routes | OrganisationContext | authenticated | P0 | 001,003 | Syntha principle |
| CAP-PLT-005 | Role-based navigation | все | AppShell | Role, PermissionSet | derived | P0 | 004 | enterprise baseline |
| CAP-PLT-006 | Global search | все | Command/Search | SearchIndex | entity.read | P1 | domain modules | JOOR/NuORDER |
| CAP-PLT-007 | Notification centre | все | Notifications | Notification | notification.read | P0 | events | common best practice |
| CAP-PLT-008 | Quick create | authorised editors | AppShell | target entity | entity.create | P1 | 004 | modern B2B UX |
| CAP-PLT-009 | Recent/pinned entities | все | AppShell | UserPreference | entity.read | P1 | 004 | modern workspace UX |
| CAP-PLT-010 | Localisation | все | Settings | LocaleConfig | settings.read | P1 | 001 | global wholesale |
| CAP-PLT-011 | Multi-currency display | Brand/Shop | commercial screens | Money, PriceList | price.read | P0 | pricing | JOOR/NuORDER |
| CAP-PLT-012 | Audit history | admins/managers | entity timeline | AuditEvent | audit.read | P0 | all writes | enterprise baseline |
| CAP-PLT-013 | Archive/restore | authorised owner | registries | entity | entity.archive | P0 | target domain | common baseline |
| CAP-PLT-014 | Saved views | operational users | registries | SavedView | saved_view.manage | P1 | canonical filters | JOOR/NuORDER |
| CAP-PLT-015 | Responsive iPhone/iPad/MacBook | все | all screens | UI contract | n/a | P0 | design system | Syntha requirement |

---

# 3. Organisations, Teams and Permissions

| ID | Возможность | Роли | Контекст | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-ORG-001 | Brand profile | Brand Admin | Brand Settings | Organisation | settings.manage | P0 | PLT | platform baseline |
| CAP-ORG-002 | Shop profile | Shop Admin | Shop Settings | Organisation | settings.manage | P0 | PLT | platform baseline |
| CAP-ORG-003 | Team registry | Admin | Team & Permissions | Membership | team.read | P0 | PLT-002 | enterprise baseline |
| CAP-ORG-004 | Invite team member | Admin | Team & Permissions | Invitation | team.manage | P0 | 003 | enterprise baseline |
| CAP-ORG-005 | Disable/reactivate user | Admin | Team & Permissions | Membership | team.manage | P0 | 003 | enterprise baseline |
| CAP-ORG-006 | Preset roles | Admin | Team & Permissions | Role | role.assign | P0 | 003 | enterprise baseline |
| CAP-ORG-007 | Custom permission set | Admin | Team & Permissions | PermissionSet | role.manage | P1 | 006 | JOOR/NuORDER enterprise pattern |
| CAP-ORG-008 | Teams/territories | Brand Admin/Head of Sales | Team & Permissions | Team, Territory | team.manage | P1 | 003 | Brandboom/RepSpark sales-team pattern |
| CAP-ORG-009 | Assignment by buyer/campaign | Head of Sales | Buyer/Campaign | Assignment | assignment.manage | P0 | campaign/buyer | sales operations |
| CAP-ORG-010 | Organisation-level defaults | Admin | Settings | Currency, Locale, Terms | settings.manage | P0 | ORG-001/002 | platform baseline |

---

# 4. Trading Relationships and Network

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-REL-001 | Brand ↔ Shop relationship | Brand/Shop Admin | Buyer/Brand Detail | TradingRelationship | relationship.read | P0 | organisations | JOOR/NuORDER network concept |
| CAP-REL-002 | Brand invites Shop | Brand sales | Campaign/Buyer | Invitation, AccessGrant | buyer.manage | P0 | 001 | WFX secure invitation |
| CAP-REL-003 | Shop requests access | Shop Admin/Buyer | Brand Detail | AccessRequest | relationship.request | P1 | directory | JOOR/RepSpark discovery |
| CAP-REL-004 | Accept/decline relationship | recipient admin | Invitation | TradingRelationship | relationship.accept | P0 | 002/003 | common network flow |
| CAP-REL-005 | Suspend/end relationship | Admin | Relationship settings | TradingRelationship | relationship.manage | P1 | 001 | enterprise baseline |
| CAP-REL-006 | Account-specific defaults | Brand sales/admin | Buyer Detail | PriceList, Currency, Terms | buyer.manage | P0 | 001 | NuORDER/JOOR/WFX |
| CAP-REL-007 | Assigned contacts | Brand/Shop | Buyer/Brand Detail | Contact, Assignment | contact.manage | P0 | 001 | CRM baseline |
| CAP-REL-008 | Buyer segmentation/tags | Brand sales | Buyer Registry | Segment, Tag | buyer.manage | P1 | 001 | campaign targeting |
| CAP-REL-009 | Discovery directory | Shop | Brand Directory | BrandProfile | directory.read | P1 | 001 | JOOR Discover, Faire, RepSpark |
| CAP-REL-010 | Recommended brands | Shop | Brand Directory | Recommendation | directory.read | P2 | analytics | JOOR/Faire pattern |

---

# 5. Sales Campaigns

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-CAM-001 | Campaign registry | Brand sales | BR-002 | SalesCampaign | campaign.read | P0 | PLT | Syntha core |
| CAP-CAM-002 | Create campaign | Brand Admin/Head/Sales Manager | Create flow | SalesCampaign | campaign.create | P0 | ORG defaults | wholesale baseline |
| CAP-CAM-003 | Duplicate/template campaign | Brand sales | Registry | SalesCampaign | campaign.create | P1 | 002 | operational efficiency |
| CAP-CAM-004 | Campaign setup | Brand owner | Campaign Settings | SalesCampaign | campaign.update | P0 | 002 | Syntha core |
| CAP-CAM-005 | Campaign lifecycle | Brand owner | Overview | SalesCampaign | campaign.lifecycle | P0 | readiness | enterprise state machine |
| CAP-CAM-006 | Campaign overview | Brand sales | BR-003 | CampaignSummary | campaign.read | P0 | 001 | Syntha core |
| CAP-CAM-007 | Collections in campaign | Brand sales | Campaign Collections | Collection | collection.read | P0 | collection | core relation |
| CAP-CAM-008 | Audience management | Brand sales | Campaign Buyers | CampaignAccessGrant | buyer.manage | P0 | relationships | WFX personalised showroom |
| CAP-CAM-009 | Individual/segment invitations | Brand sales | Campaign Buyers | Invitation | buyer.manage | P0 | 008 | WFX/JOOR pattern |
| CAP-CAM-010 | Buyer-specific price/currency | Brand sales/admin | Campaign Buyers | AccessGrant, PriceList | pricing.assign | P0 | pricing | WFX/NuORDER |
| CAP-CAM-011 | Buyer-specific assortment | Brand sales/showroom | Campaign Buyers | VisibilityRule | audience.manage | P0 | collection | WFX/NuORDER |
| CAP-CAM-012 | Order deadline by audience | Brand sales | Campaign Buyers | AccessGrant | audience.manage | P0 | 008 | wholesale baseline |
| CAP-CAM-013 | Campaign team ownership | Head of Sales | Overview/Settings | Assignment | campaign.assign | P0 | ORG-009 | sales operations |
| CAP-CAM-014 | Campaign calendar | Brand sales | Campaign Calendar | CalendarEvent | calendar.manage | P0 | calendar | Syntha core |
| CAP-CAM-015 | Campaign documents | Brand sales | Campaign Documents | Document | document.manage | P1 | documents | common baseline |
| CAP-CAM-016 | Campaign activity | Brand sales | Overview/Activity | ActivityEvent | campaign.read | P0 | events | common baseline |
| CAP-CAM-017 | Targets and plan/fact | Head of Sales | Overview/Analytics | CampaignTarget | analytics.read | P1 | orders | sales management |
| CAP-CAM-018 | Invitation/open/selection/order funnel | Brand sales | Analytics | AnalyticsProjection | analytics.read | P1 | event catalog | Brandboom/WFX analytics |
| CAP-CAM-019 | Reminder/follow-up campaigns | Brand sales | Campaign Buyers | NotificationCampaign | campaign.communicate | P1 | notifications | WFX targeted outreach |
| CAP-CAM-020 | Archive completed campaign | Brand Admin | Registry | SalesCampaign | campaign.archive | P0 | lifecycle | baseline |

---

# 6. Product and Commercial Catalogue

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-CAT-001 | Product registry | Brand catalogue/editor | Product Registry | Product | product.read | P0 | organisation | JOOR/NuORDER/Brandboom |
| CAP-CAT-002 | Create/edit commercial product | Brand editor | Product Detail | Product | product.update | P0 | 001 | wholesale baseline |
| CAP-CAT-003 | Product variants/colourways | Brand editor | Product Detail | ProductVariant | product.update | P0 | 002 | fashion baseline |
| CAP-CAT-004 | Size scales | Brand editor | Settings/Product | SizeScale | product.update | P0 | 002 | fashion baseline |
| CAP-CAT-005 | Product media | Brand editor | Product Detail | MediaAsset | media.manage | P0 | upload | WFX/JOOR/NuORDER |
| CAP-CAT-006 | Buyer-facing specifications | Brand editor | Product Detail | ProductSpec | product.update | P0 | 002 | WFX detailed specs |
| CAP-CAT-007 | Internal product notes | Brand team | Product Detail | InternalNote | product.internal_note | P0 | 002 | internal-only data |
| CAP-CAT-008 | CSV/XLSX import | Brand operations | Import flow | ImportJob | product.import | P0 | mapping engine | operational baseline |
| CAP-CAT-009 | Import mapping preview | Brand operations | Import flow | MappingProfile | product.import | P0 | 008 | data quality |
| CAP-CAT-010 | Bulk edit | Brand operations | Product/Collection Table | Product | product.bulk_update | P0 | 001 | JOOR/NuORDER |
| CAP-CAT-011 | Price lists | Brand admin/sales | Price Lists | PriceList | pricing.manage | P0 | products | JOOR/NuORDER |
| CAP-CAT-012 | Account/market-specific prices | Brand admin | Price List Detail | PriceListItem | pricing.manage | P0 | 011 | NuORDER/WFX |
| CAP-CAT-013 | Suggested retail and margin inputs | Brand/Shop permitted roles | Product/Order | PriceListItem | pricing.read | P0 | 011 | buying support |
| CAP-CAT-014 | Delivery windows | Brand sales/operations | Terms | DeliveryWindow | terms.manage | P0 | campaign | wholesale baseline |
| CAP-CAT-015 | MOQ/order minimum | Brand sales/operations | Terms | CommercialTerms | terms.manage | P0 | product/campaign | wholesale baseline |
| CAP-CAT-016 | Pack/size curve rules | Brand operations | Terms/Product | PackRule | terms.manage | P0 | size scale | RepSpark/NuORDER pattern |
| CAP-CAT-017 | Availability/ATS | Brand operations | Product/Showroom | AvailabilitySnapshot | inventory.read | P1 | ERP sync | JOOR/NuORDER/RepSpark |
| CAP-CAT-018 | Market visibility rules | Brand sales | Product/Access | VisibilityRule | audience.manage | P1 | relationships | WFX personalised assortment |
| CAP-CAT-019 | Versioned product snapshot in release/order | system | publish/order | ProductSnapshot | system | P0 | versioning | audit correctness |
| CAP-CAT-020 | PIM/PLM/ERP import adapter | Integration Admin | Integration | ExternalMapping | integration.manage | P1 | integration layer | JOOR/NuORDER/WFX |

---

# 7. Collections

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-COL-001 | Collection registry | Brand | Collection Registry | Collection | collection.read | P0 | campaign | Syntha core |
| CAP-COL-002 | Create/duplicate collection | Brand editor | Create flow | Collection | collection.create | P0 | CAM-002 | baseline |
| CAP-COL-003 | Collection overview | Brand | BR-009 | Collection | collection.read | P0 | 001 | Syntha core |
| CAP-COL-004 | Add/import products | Brand editor | Product Table | CollectionProduct | collection.update | P0 | CAT | JOOR/NuORDER |
| CAP-COL-005 | Product ordering/merchandising | Brand editor | Product Table | CollectionProduct | collection.update | P0 | 004 | digital linesheet |
| CAP-COL-006 | Drops/capsules/chapters | Brand editor | Collection | Drop, Chapter | collection.update | P0 | 003 | fashion selling |
| CAP-COL-007 | Looks | Brand editor | Looks | Look | collection.update | P0 | CAT media | WFX/NuORDER |
| CAP-COL-008 | Shoppable look | Brand editor/Shop | Showroom | LookItem | selection.create | P0 | 007 | WFX shoppable lookbook |
| CAP-COL-009 | Story/editorial blocks | Brand editor | Composer | StoryBlock | collection.update | P0 | media | WFX/NuORDER/Brandboom |
| CAP-COL-010 | Collection commercial terms | Brand sales | Collection Terms | Price/Delivery/MOQ | collection.update | P0 | CAT terms | wholesale baseline |
| CAP-COL-011 | Collection readiness engine | Brand editor | Overview/Publish | ReadinessResult | collection.readiness | P0 | required data | Syntha differentiator |
| CAP-COL-012 | Buyer-context preview | Brand sales/showroom | BR-014 | AccessResolvedView | collection.preview | P0 | audience/pricing | WFX personalised showroom |
| CAP-COL-013 | Publish review | Brand publisher | BR-015 | CollectionVersion | collection.publish | P0 | 011,012 | versioned release |
| CAP-COL-014 | Scheduled publish | Brand publisher | Publish Review | Showroom | collection.publish | P1 | 013 | WFX/enterprise |
| CAP-COL-015 | Immutable release | system | release | CollectionVersion | system | P0 | 013 | audit correctness |
| CAP-COL-016 | Draft against live release | Brand editor | Collection | CollectionVersion | collection.update | P1 | 015 | enterprise versioning |
| CAP-COL-017 | Release history/compare | Brand | Release History | CollectionVersion | collection.read | P1 | 015 | enterprise baseline |
| CAP-COL-018 | Material-change buyer notification | Brand publisher | Publish Review | Notification | collection.publish | P1 | 017 | change management |
| CAP-COL-019 | Close/archive collection | Brand owner | Overview | Collection | collection.lifecycle | P0 | lifecycle | baseline |

---

# 8. Digital Showroom

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-SHO-001 | Showroom Composer | Brand showroom/editor | BR-013 | Showroom, PresentationConfig | showroom.update | P0 | Collection | WFX/NuORDER/Brandboom |
| CAP-SHO-002 | Editorial story mode | Brand/Shop | Composer/SH-006 | StoryBlock | showroom.read | P0 | COL-009 | WFX/NuORDER |
| CAP-SHO-003 | Product grid mode | Brand/Shop | Showroom | CollectionProduct | showroom.read | P0 | Collection | all competitors |
| CAP-SHO-004 | Digital linesheet mode | Brand/Shop | Showroom | ProductCommercialView | showroom.read | P0 | Collection | JOOR/Brandboom/WFX |
| CAP-SHO-005 | Looks mode | Brand/Shop | Showroom | Look | showroom.read | P0 | COL-007 | WFX/NuORDER |
| CAP-SHO-006 | Fullscreen presentation | Brand/Shop | Showroom | SessionState | showroom.read | P0 | UI system | JOOR/WFX |
| CAP-SHO-007 | Drag/reorder presentation blocks | Brand editor | Composer | StoryBlock | showroom.update | P0 | 001 | modern editor |
| CAP-SHO-008 | Buyer-context preview | Brand sales | BR-014 | AccessResolver | showroom.preview | P0 | COL-012 | WFX |
| CAP-SHO-009 | Secure buyer access | Shop | SH-006 | AccessGrant | showroom.read | P0 | Campaign invitation | WFX |
| CAP-SHO-010 | Buyer-specific assortment | Shop | SH-006 | VisibilityRule | showroom.read | P0 | CAM-011 | WFX/NuORDER |
| CAP-SHO-011 | Buyer-specific pricing/terms | Shop | SH-006 | PriceContext | pricing.read | P0 | CAM-010 | WFX/NuORDER |
| CAP-SHO-012 | Product quick view | Shop | SH-007 | ProductView | showroom.read | P0 | CAT | all competitors |
| CAP-SHO-013 | High-resolution media/zoom | Shop | Product Viewer | MediaAsset | media.read | P0 | media pipeline | WFX/JOOR |
| CAP-SHO-014 | Video blocks/product video | Shop | Showroom | MediaAsset | media.read | P0 | media pipeline | WFX/NuORDER/Brandboom |
| CAP-SHO-015 | 360/3D media adapter | Shop | Product Viewer | RichMediaAsset | media.read | P1 | viewer adapter | WFX/JOOR pattern |
| CAP-SHO-016 | Search/filter/sort | Shop | Showroom | ProductSearch | showroom.read | P0 | index | all competitors |
| CAP-SHO-017 | Persistent selection tray | Shop | SH-006 | Selection | selection.update | P0 | Buying domain | Syntha differentiator |
| CAP-SHO-018 | Favourite/shortlist/skip | Shop | SH-006 | ProductInteraction | selection.update | P0 | session | NuORDER/JOOR |
| CAP-SHO-019 | Private Shop note | Shop | Showroom/Product | PrivateNote | note.private | P0 | permission model | Syntha/WFX feedback |
| CAP-SHO-020 | Shared product comment | Brand/Shop | Showroom/DealSpace | ConversationThread | dealspace.message | P0 | DealSpace | WFX chat improved |
| CAP-SHO-021 | Resume last position | Shop | SH-006 | ShowroomSession | showroom.read | P0 | session persistence | modern commerce |
| CAP-SHO-022 | Engagement event capture | system | Showroom | ProductInteraction | system | P0 | event catalog | WFX/Brandboom analytics |
| CAP-SHO-023 | Live appointment presentation state | Brand/Shop | Live Showroom | AppointmentSession | appointment.use | P1 | Calendar/DealSpace | JOOR/WFX hybrid |
| CAP-SHO-024 | Native video call | Brand/Shop | Live Showroom | CallSession | appointment.call | P2 | realtime/media | WFX |

---

# 9. Shop Buying Workspace and Selection

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-BUY-001 | Persistent selection | Buyer/Merchandiser | SH-008 | Selection | selection.read | P0 | Showroom | Syntha core |
| CAP-BUY-002 | Selection decisions | Buyer/Merchandiser | SH-008 | SelectionItem | selection.update | P0 | 001 | NuORDER assortment pattern |
| CAP-BUY-003 | Internal notes/comments | Shop team | SH-008 | InternalComment | selection.comment | P0 | 001 | NuORDER collaboration |
| CAP-BUY-004 | Add/remove/reorder items | Buyer | SH-008 | SelectionItem | selection.update | P0 | 001 | baseline |
| CAP-BUY-005 | Filter by decision/category/delivery | Buyer | SH-008 | SelectionProjection | selection.read | P0 | 001 | buying UX |
| CAP-BUY-006 | Compare products/colourways | Buyer/Merchandiser | Compare | ComparisonSet | selection.read | P1 | 001 | NuORDER assortment |
| CAP-BUY-007 | Budget plan | Buying Director | Budget Planner | BudgetPlan | budget.manage | P1 | 001 | NuORDER Assortments |
| CAP-BUY-008 | Budget allocations | Buying Director | Budget Planner | BudgetAllocation | budget.manage | P1 | 007 | NuORDER Assortments |
| CAP-BUY-009 | Visual assortment roll-up | Buying team | Buying Workspace | AssortmentProjection | selection.read | P1 | 001 | NuORDER/JOOR |
| CAP-BUY-010 | Duplicate detection | Buying team | Buying Workspace | AssortmentRule | selection.read | P1 | 009 | NuORDER verified |
| CAP-BUY-011 | Team approval readiness | Buying Director | SH-008/Approval | Approval | selection.approve | P1 | 001 | enterprise retail buying |
| CAP-BUY-012 | Convert selection to draft order | Buyer | SH-008 | Order | order.create | P0 | approved items | Syntha core |
| CAP-BUY-013 | Preserve source lineage | system | Selection/Order | SourceReference | system | P0 | 012 | Syntha differentiator |
| CAP-BUY-014 | Multi-store allocation planning | Buying Director | Buying Workspace | StoreAllocation | budget.manage | P1 | Stores | NuORDER assortment |
| CAP-BUY-015 | Multi-brand workspace | Shop | Buying Workspace | BuyingWorkspace | buying.read | P2 | relationships | JOOR/NuORDER direction |

---

# 10. Order Builder and Orders

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-ORD-001 | Draft order creation | Buyer | Selection/Order | Order | order.create | P0 | BUY-012 | core |
| CAP-ORD-002 | Three-panel Order Builder | Buyer | SH-012 | OrderVersion | order.update | P0 | design system | Syntha differentiator |
| CAP-ORD-003 | Add/remove product lines | Buyer | SH-012 | OrderLine | order.update | P0 | CAT | all competitors |
| CAP-ORD-004 | Size × colour quantity matrix | Buyer | SH-012 | SizeQuantities | order.update | P0 | SizeScale | JOOR/NuORDER/RepSpark |
| CAP-ORD-005 | Keyboard quantity entry | Buyer | SH-012 | EditCommand | order.update | P0 | matrix | Syntha differentiator |
| CAP-ORD-006 | Paste from spreadsheet | Buyer | SH-012 | EditCommand | order.update | P0 | matrix parser | spreadsheet replacement |
| CAP-ORD-007 | Apply pack/size curve | Buyer | SH-012 | PackRule | order.update | P0 | CAT-016 | RepSpark/NuORDER |
| CAP-ORD-008 | Delivery assignment/split | Buyer | SH-012 | OrderDeliverySplit | order.update | P0 | CAT-014 | wholesale baseline |
| CAP-ORD-009 | Store allocation split | Buyer | SH-012 | StoreAllocation | order.update | P1 | stores | enterprise buying |
| CAP-ORD-010 | Real-time totals | system | SH-012 | OrderTotals | system | P0 | pricing | all competitors |
| CAP-ORD-011 | Budget comparison | Buyer/Director | SH-012 | BudgetComparison | budget.read | P1 | BUY-007 | NuORDER |
| CAP-ORD-012 | MOQ/pack/order-min validation | system | Builder/Validation | ValidationResult | system | P0 | commercial terms | all competitors |
| CAP-ORD-013 | Availability warning | system | Builder | AvailabilitySnapshot | inventory.read | P1 | inventory sync | JOOR/NuORDER/RepSpark |
| CAP-ORD-014 | Autosave/version token | Buyer | SH-012 | OrderVersion | order.update | P0 | persistence | Syntha core |
| CAP-ORD-015 | Undo/redo | Buyer | SH-012 | CommandHistory | order.update | P0 | edit commands | advanced UX |
| CAP-ORD-016 | Concurrent edit conflict | Buyer/team | SH-012 | VersionConflict | order.update | P0 | optimistic concurrency | enterprise baseline |
| CAP-ORD-017 | Order validation/review | Buyer | SH-013 | ValidationResult | order.submit | P0 | 012 | core |
| CAP-ORD-018 | Internal approval | Shop approver | Approval | OrderApproval | order.approve | P1 | role matrix | enterprise retail |
| CAP-ORD-019 | Submit order | Buyer/Director | SH-013 | OrderVersion | order.submit | P0 | valid order | core |
| CAP-ORD-020 | Withdraw before review | Shop authorised | Order Detail | Order | order.withdraw | P1 | status policy | operational baseline |
| CAP-ORD-021 | Brand order inbox | Brand sales | BR-027 | Order | order.review | P0 | submitted orders | JOOR/NuORDER |
| CAP-ORD-022 | Brand order detail | Brand sales | BR-028 | OrderVersion | order.review | P0 | 021 | core |
| CAP-ORD-023 | Brand proposes revision | Brand sales | BR-029 | OrderSuggestion | order.revise | P0 | 022 | Syntha collaboration |
| CAP-ORD-024 | Shop accepts/rejects revision | Buyer/Director | SH-016 | OrderSuggestion | order.revision.resolve | P0 | 023 | Syntha collaboration |
| CAP-ORD-025 | Confirm order | Brand authorised | BR-028 | OrderVersion | order.confirm | P0 | agreed version | core |
| CAP-ORD-026 | Immutable confirmed snapshot | system | Order | OrderVersion | system | P0 | 025 | audit correctness |
| CAP-ORD-027 | Order export PDF/XLSX | authorised parties | Order Detail | ExportJob | order.export | P0 | snapshot | JOOR/Brandboom |
| CAP-ORD-028 | ERP order export | Brand integration | Integration | ExternalOrder | integration.manage | P1 | adapter | JOOR/NuORDER/Brandboom |
| CAP-ORD-029 | Payment/invoice layer | Finance | Order/Invoice | Payment, Invoice | payment.manage | P2 | PSP/finance | JOOR Pay, NuORDER, Faire, RepSpark |
| CAP-ORD-030 | Reorder from confirmed order | Shop | Order Detail | Order | order.create | P1 | confirmed order | RepSpark/Brandboom |

---

# 11. DealSpace and Collaboration

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-DSP-001 | Relationship DealSpace | Brand/Shop | DealSpace | DealSpace | dealspace.read | P0 | relationship | Syntha differentiator |
| CAP-DSP-002 | Context thread by campaign | Brand/Shop | Campaign DealSpace | Thread | dealspace.message | P0 | 001 | contextual collaboration |
| CAP-DSP-003 | Context thread by collection/product | Brand/Shop | Collection/Showroom | Thread | dealspace.message | P0 | 001 | WFX feedback improved |
| CAP-DSP-004 | Context thread by order/order line | Brand/Shop | Order DealSpace | Thread | dealspace.message | P0 | order | Syntha core |
| CAP-DSP-005 | Internal organisation channel | Brand or Shop team | DealSpace | InternalThread | internal.message | P0 | permissions | privacy requirement |
| CAP-DSP-006 | Message/mention/reaction | participants | Thread | Message | dealspace.message | P0 | 002-005 | modern collaboration |
| CAP-DSP-007 | Attachments | participants | Thread | Document | document.upload | P0 | upload | WFX/enterprise |
| CAP-DSP-008 | Task from message | participants | Thread | Task | task.create | P1 | 006 | Syntha productivity |
| CAP-DSP-009 | Shared notes | participants | entity | SharedNote | dealspace.message | P0 | 001 | WFX feedback |
| CAP-DSP-010 | Visibility selector | participant | composer | VisibilityScope | permission-derived | P0 | internal/shared model | Syntha safety |
| CAP-DSP-011 | Unified activity timeline | participants | DealSpace | ActivityEvent | dealspace.read | P1 | event catalog | modern workspace |
| CAP-DSP-012 | Search messages/files | participants | DealSpace | SearchIndex | dealspace.read | P1 | indexing | collaboration baseline |
| CAP-DSP-013 | Read/unread and notifications | participants | DealSpace | Notification | dealspace.read | P0 | notifications | messaging baseline |
| CAP-DSP-014 | Voice/video message | participants | DealSpace | MediaMessage | dealspace.message | P2 | media | later |
| CAP-DSP-015 | AI summary | authorised participants | Thread/Appointment | Summary | dealspace.read | P2 | AI policy | later |

---

# 12. Calendar, Events and Appointments

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-CAL-001 | Unified calendar | Brand/Shop | Calendar | CalendarEvent | calendar.read | P0 | PLT | Syntha core |
| CAP-CAL-002 | Calendar layers | Brand/Shop | Calendar | CalendarLayer | calendar.read | P0 | 001 | modern calendar |
| CAP-CAL-003 | Campaign milestones | Brand | Campaign Calendar | CalendarEvent | calendar.manage | P0 | Campaign | core |
| CAP-CAL-004 | Sales/buying appointment | Brand/Shop | Appointment | Appointment | appointment.create | P0 | relationship | wholesale workflow |
| CAP-CAL-005 | Availability and proposed slots | Brand/Shop | Scheduler | AppointmentProposal | appointment.manage | P0 | 004 | scheduling baseline |
| CAP-CAL-006 | Accept/decline/reschedule | participants | Appointment | Appointment | appointment.respond | P0 | 004 | scheduling baseline |
| CAP-CAL-007 | Time-zone handling | participants | all calendar UI | TimeZone | system | P0 | user profile | global wholesale |
| CAP-CAL-008 | Linked campaign/collection/order | participants | Event detail | EntityRef | calendar.read | P0 | domains | Syntha contextual model |
| CAP-CAL-009 | Appointment preparation | Brand/Shop | Preparation | Agenda, Context | appointment.read | P1 | 004 | guided sales |
| CAP-CAL-010 | Live appointment room | Brand/Shop | Live Showroom | AppointmentSession | appointment.use | P1 | Showroom/DealSpace | JOOR/WFX hybrid |
| CAP-CAL-011 | Completion summary/follow-up | host | Summary | Appointment | appointment.complete | P1 | 010 | sales process |
| CAP-CAL-012 | Industry/fashion event calendar | all | Market Calendar | IndustryEvent | calendar.read | P1 | curated feed | JOOR Passport/event pattern |
| CAP-CAL-013 | Public/private/company/shared visibility | owner | Event editor | VisibilityScope | calendar.manage | P0 | permission model | Syntha safety |
| CAP-CAL-014 | Google/Outlook sync | user | Settings | ExternalCalendarRef | integration.manage | P1 | OAuth adapter | standard integration |
| CAP-CAL-015 | Reminder rules | owner | Event editor | ReminderRule | calendar.manage | P0 | notification service | baseline |

---

# 13. Documents and Media

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-DOC-001 | Secure upload | authorised users | any entity | Document | document.upload | P0 | storage | enterprise baseline |
| CAP-DOC-002 | Entity attachments | authorised users | entity Documents | EntityDocument | document.read | P0 | 001 | baseline |
| CAP-DOC-003 | Version and metadata | owner | Document detail | DocumentVersion | document.manage | P1 | 001 | enterprise baseline |
| CAP-DOC-004 | Audience visibility | owner | Document detail | AccessScope | document.manage | P0 | permission model | safety |
| CAP-DOC-005 | Expiring download URL | authorised reader | download | SignedAccess | document.read | P0 | storage | security baseline |
| CAP-DOC-006 | Malware/MIME validation | system | upload | ScanResult | system | P0 | storage | security baseline |
| CAP-DOC-007 | Lookbook/linesheet export | Brand | Collection/Showroom | ExportJob | collection.export | P1 | release snapshot | Brandboom/JOOR |
| CAP-DOC-008 | Order document export | Brand/Shop | Order | ExportJob | order.export | P0 | confirmed/draft snapshot | JOOR/Brandboom |
| CAP-DOC-009 | Press/marketing assets | Brand/Shop | Collection Documents | Document | document.read | P1 | access grant | showroom support |

---

# 14. Analytics and Intelligence

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-ANA-001 | Event taxonomy | system | all | AnalyticsEvent | system | P0 | event catalog | foundation |
| CAP-ANA-002 | Showroom open/browse depth | Brand sales | Analytics | ShowroomMetrics | analytics.read | P1 | SHO-022 | WFX/Brandboom |
| CAP-ANA-003 | Product view/favourite/selection funnel | Brand sales | Analytics | ProductMetrics | analytics.read | P1 | interactions | WFX/Brandboom |
| CAP-ANA-004 | Invitation conversion | Brand sales | Campaign Analytics | CampaignMetrics | analytics.read | P1 | invitations | WFX outreach |
| CAP-ANA-005 | Selection-to-order conversion | Brand/Shop | Analytics | FunnelMetrics | analytics.read | P1 | source lineage | Syntha |
| CAP-ANA-006 | Order value/status reporting | Brand/Shop | Dashboard/Analytics | OrderMetrics | analytics.read | P0 | orders | JOOR/NuORDER/Brandboom |
| CAP-ANA-007 | Sales manager/territory performance | Head of Sales | Analytics | SalesMetrics | analytics.read | P1 | assignments | Brandboom/RepSpark |
| CAP-ANA-008 | Buyer inactivity/follow-up queue | Brand sales | Dashboard | ActionRecommendation | analytics.read | P1 | events | Brandboom/RepSpark AI direction |
| CAP-ANA-009 | Assortment/budget analysis | Shop | Buying Analytics | BuyingMetrics | analytics.read | P1 | Buying domain | NuORDER |
| CAP-ANA-010 | Export report | authorised | Analytics | ExportJob | analytics.export | P1 | projections | baseline |
| CAP-ANA-011 | AI order insights | Brand sales | Analytics/Order | Insight | analytics.read | P2 | historical data | RepSpark pattern |
| CAP-ANA-012 | Recommendation engine | Brand/Shop | Directory/Buying | Recommendation | analytics.read | P2 | ML governance | JOOR/Faire pattern |

---

# 15. Integrations and Synchronisation

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-INT-001 | Integration registry | Admin | Integrations | IntegrationConnection | integration.read | P1 | ORG | enterprise baseline |
| CAP-INT-002 | CSV/XLSX import/export | Operations | Import/Export | ImportJob, ExportJob | integration.use | P0 | mapping | baseline |
| CAP-INT-003 | PIM/PLM product sync | Integration Admin | Integration | ExternalProduct | integration.manage | P1 | adapter | JOOR/NuORDER/WFX |
| CAP-INT-004 | ERP price/inventory sync | Integration Admin | Integration | ExternalPrice/Inventory | integration.manage | P1 | adapter | JOOR/NuORDER/Brandboom/RepSpark |
| CAP-INT-005 | ERP order export/status import | Integration Admin | Integration | ExternalOrder | integration.manage | P1 | orders | all major platforms |
| CAP-INT-006 | Shopify connector | Brand Admin | Integration | ShopifyMapping | integration.manage | P1 | adapter | JOOR/Brandboom |
| CAP-INT-007 | Webhooks | Integration Admin | Integration | WebhookSubscription | integration.manage | P1 | event catalog | API-first |
| CAP-INT-008 | Public API credentials | Integration Admin | Integration | ApiCredential | integration.manage | P1 | security | JOOR/NuORDER/RepSpark |
| CAP-INT-009 | Sync monitoring/retry | Integration Admin | Integration Runs | SyncRun | integration.read | P1 | observability | enterprise baseline |
| CAP-INT-010 | External calendar sync | User | Settings | ExternalCalendarRef | integration.manage | P1 | CAL-014 | baseline |
| CAP-INT-011 | Payment provider adapter | Finance/Admin | Payments | PaymentProvider | payment.manage | P2 | order finance | JOOR/NuORDER/Faire |
| CAP-INT-012 | Email delivery provider | system/admin | Notification settings | DeliveryProvider | settings.manage | P0 | notifications | foundation |

---

# 16. Marketplace, Discovery and Events

| ID | Возможность | Роли | Экран | Сущности | Permission | Приоритет | Зависимости | Референс |
|---|---|---|---|---|---|---|---|---|
| CAP-MKT-001 | Brand directory | Shop | Brand Directory | BrandProfile | directory.read | P1 | REL | JOOR Discover/Faire/RepSpark |
| CAP-MKT-002 | Search/filter brands | Shop | Brand Directory | SearchIndex | directory.read | P1 | 001 | marketplace baseline |
| CAP-MKT-003 | Brand access request | Shop | Brand Detail | AccessRequest | relationship.request | P1 | 001 | RepSpark/JOOR |
| CAP-MKT-004 | Curated collections/events | Shop | Discover | Curation | directory.read | P2 | content operations | Faire/JOOR Passport |
| CAP-MKT-005 | Trade show/event portal | Brand/Shop | Event Hub | TradeEvent | event.read | P2 | calendar/directory | JOOR Passport |
| CAP-MKT-006 | Event microsite | Brand | Event Hub | EventMicrosite | event.manage | P2 | showroom/catalog | RepSpark pattern |
| CAP-MKT-007 | Retailer recommendations | Shop | Discover | Recommendation | directory.read | P2 | analytics | Faire/JOOR |

---

# 17. Out-of-scope boundaries

Следующие capability-классы не входят в wholesale MVP и не могут появиться в navigation без изменения Product Canon:

- PLM lifecycle execution;
- BOM и tech packs;
- sourcing и vendor quotation;
- production planning;
- factory MES;
- quality inspection execution;
- raw-material inventory;
- accounting ledger;
- payroll;
- B2C storefront;
- consumer loyalty;
- marketplace fulfilment ownership.

Разрешены только integration adapters, импорт snapshots и deep links в отдельные будущие модули.

---

# 18. Правило реализации

Для любой Cursor task должны быть указаны:

```text
Capability IDs
→ Screen IDs
→ Domain entities
→ Permissions
→ Queries/Commands
→ Domain events
→ Notifications
→ Integration effects
→ Acceptance tests
```

Функция без Capability ID не реализуется.
