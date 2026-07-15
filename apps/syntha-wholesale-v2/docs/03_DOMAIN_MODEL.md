# 03 — Domain Model

## 1. Общие правила модели

- Все идентификаторы — непрозрачные UUID/ULID, не бизнес-номера.
- Бизнес-номера (`orderNumber`, `campaignCode`) уникальны в пределах организации.
- Все сущности имеют `createdAt`, `createdBy`, `updatedAt`, `updatedBy`.
- Архивирование предпочтительнее физического удаления.
- Shared-данные и internal-only данные разделены явно.
- Денежные значения хранятся в minor units + ISO currency.
- Даты кампаний и встреч хранятся в UTC с исходным time zone.
- Любое изменение Submitted/Confirmed Order создаёт новую версию.

---

# 2. Identity and Organisations

## 2.1 User

Поля:

- `id`
- `email`
- `displayName`
- `avatarUrl?`
- `locale`
- `timeZone`
- `status: invited | active | suspended`
- `lastActiveAt?`

Связи:

- `memberships[]`
- `notificationPreferences`

## 2.2 Organisation

Поля:

- `id`
- `type: brand | shop`
- `legalName`
- `displayName`
- `slug`
- `logoUrl?`
- `countryCode`
- `defaultCurrency`
- `defaultLocale`
- `status: active | suspended | archived`

Инварианты:

- тип организации не меняется после создания;
- одна организация не может одновременно быть Brand и Shop;
- все коммерческие сущности принадлежат одной owning organisation.

## 2.3 Membership

Поля:

- `id`
- `userId`
- `organisationId`
- `roleId`
- `status: invited | active | disabled`
- `teamIds[]`

## 2.4 Role / PermissionSet

Базовые Brand roles:

- `brand_admin`
- `sales_director`
- `sales_manager`
- `showroom_manager`
- `brand_viewer`

Базовые Shop roles:

- `shop_admin`
- `buying_director`
- `buyer`
- `merchandiser`
- `finance_approver`
- `shop_viewer`

Permission scopes:

- campaign.read/write/publish;
- collection.read/write/publish;
- buyer.read/manage;
- appointment.read/write;
- order.read/write/submit/confirm/cancel;
- dealspace.read/write;
- document.read/write;
- analytics.read;
- settings.manage.

---

# 3. Relationship Domain

## 3.1 TradingRelationship

Представляет связь Brand ↔ Shop.

Поля:

- `id`
- `brandOrganisationId`
- `shopOrganisationId`
- `status: pending | active | suspended | ended`
- `initiatedBy: brand | shop`
- `defaultPriceListId?`
- `defaultCurrency?`
- `assignedBrandUserIds[]`
- `assignedShopUserIds[]`
- `tags[]`
- `startedAt?`
- `endedAt?`

Инварианты:

- уникальная активная связь для пары Brand + Shop;
- доступ к showroom/order требует active relationship или explicit invitation grant.

## 3.2 Contact

Поля:

- `id`
- `organisationId`
- `userId?`
- `name`
- `email`
- `phone?`
- `jobTitle?`
- `isPrimary`
- `visibility: internal | shared`

## 3.3 Location / Store

Поля:

- `id`
- `shopOrganisationId`
- `name`
- `code?`
- `address`
- `countryCode`
- `currency?`
- `status: active | inactive`

---

# 4. Sales Campaign Domain

## 4.1 SalesCampaign

Поля:

- `id`
- `brandOrganisationId`
- `name`
- `code`
- `seasonLabel`
- `type: main | pre | capsule | carry_over | immediate`
- `status: draft | scheduled | active | closing | completed | archived`
- `startsAt`
- `endsAt`
- `timeZone`
- `defaultCurrency`
- `defaultPriceListId?`
- `defaultDeliveryWindowIds[]`
- `ownerUserId`
- `teamUserIds[]`
- `coverMediaId?`
- `description?`
- `targetAmount?`
- `targetCurrency?`

Инварианты:

- `startsAt < endsAt`;
- active campaign должен иметь минимум одну published collection;
- archived campaign read-only;
- status transitions контролируются policy.

Переходы:

```text
draft → scheduled → active → closing → completed → archived
  └──────────────────────→ archived
```

## 4.2 CampaignAccessGrant

Поля:

- `id`
- `campaignId`
- `shopOrganisationId`
- `status: invited | opened | active | revoked | expired`
- `priceListId`
- `currency`
- `collectionIds[] | all`
- `orderDeadline?`
- `invitedAt`
- `openedAt?`
- `revokedAt?`
- `assignedSalesUserId?`

## 4.3 CampaignTarget

Поля:

- `id`
- `campaignId`
- `dimension: total | market | manager | shop_segment`
- `dimensionId?`
- `amount`
- `currency`

---

# 5. Collection and Product Domain

## 5.1 Collection

Поля:

- `id`
- `brandOrganisationId`
- `campaignId`
- `name`
- `code`
- `seasonLabel`
- `dropLabel?`
- `status: draft | incomplete | ready | published | closed | archived`
- `description?`
- `coverMediaId?`
- `storyDocument`
- `defaultPriceListId?`
- `orderDeadline?`
- `ownerUserId`
- `publishedVersionId?`
- `publishedAt?`

Инварианты:

- published collection имеет valid readiness result;
- только Brand может publish/unpublish;
- published content version immutable; изменения создают draft version.

## 5.2 CollectionVersion

Поля:

- `id`
- `collectionId`
- `versionNumber`
- `state: draft | published | superseded`
- `snapshot`
- `changeSummary?`
- `createdAt`
- `publishedAt?`

## 5.3 Product

В V2 Product — коммерческая buyer-facing сущность. Глубокий PLM не входит в MVP.

Поля:

- `id`
- `brandOrganisationId`
- `styleCode`
- `name`
- `categoryId`
- `subcategoryId?`
- `description?`
- `status: draft | active | inactive | archived`
- `gender?`
- `materialSummary?`
- `countryOfOrigin?`
- `mediaIds[]`
- `tags[]`

## 5.4 ProductVariant

Поля:

- `id`
- `productId`
- `colourCode`
- `colourName`
- `colourHex?`
- `mediaIds[]`
- `status: active | unavailable | discontinued`

## 5.5 SizeScale

Поля:

- `id`
- `organisationId`
- `name`
- `sizes[]` ordered
- `locale?`

## 5.6 CollectionProduct

Связь Product с Collection.

Поля:

- `id`
- `collectionId`
- `productId`
- `displayOrder`
- `dropId?`
- `capsuleId?`
- `buyerDescription?`
- `internalNotes?`
- `deliveryWindowIds[]`
- `sizeScaleId`
- `availabilityStatus: available | limited | unavailable`
- `minimumOrderQuantity?`
- `packRuleId?`
- `isHighlighted`

## 5.7 PriceList

Поля:

- `id`
- `brandOrganisationId`
- `name`
- `currency`
- `marketCodes[]`
- `status: draft | active | archived`

## 5.8 PriceListItem

Поля:

- `priceListId`
- `productVariantId`
- `wholesalePriceMinor`
- `suggestedRetailPriceMinor?`
- `taxIncluded`
- `validFrom?`
- `validUntil?`

## 5.9 DeliveryWindow

Поля:

- `id`
- `brandOrganisationId`
- `label`
- `startsOn`
- `endsOn`
- `status: planned | active | closed`
- `markets[]`

## 5.10 PackRule

Поля:

- `id`
- `brandOrganisationId`
- `name`
- `type: fixed_pack | ratio_pack | free_units`
- `sizeQuantities`
- `minimumPacks?`

## 5.11 Look

Поля:

- `id`
- `collectionId`
- `name`
- `description?`
- `mediaId`
- `displayOrder`
- `items[]: { collectionProductId, productVariantId?, anchor? }`
- `status: draft | published`

## 5.12 StoryBlock

Типы:

- hero;
- rich_text;
- image;
- video;
- gallery;
- look_grid;
- product_grid;
- quote;
- divider.

Поля:

- `id`
- `collectionId`
- `type`
- `content`
- `displayOrder`
- `visibilityRule?`

---

# 6. Showroom Domain

## 6.1 Showroom

Поля:

- `id`
- `collectionId`
- `collectionVersionId`
- `status: draft | scheduled | live | closed`
- `slug`
- `presentationConfig`
- `accessMode: relationship | invitation | private_link`
- `scheduledPublishAt?`
- `publishedAt?`
- `closedAt?`

## 6.2 ShowroomSession

Поля:

- `id`
- `showroomId`
- `shopOrganisationId`
- `userId`
- `startedAt`
- `lastActiveAt`
- `completedAt?`
- `lastPosition?`
- `source: invitation | appointment | direct`

## 6.3 ProductInteraction

Поля:

- `id`
- `showroomSessionId`
- `collectionProductId`
- `productVariantId?`
- `type: view | favourite | shortlist | skip | compare | add_to_selection | note`
- `metadata?`
- `occurredAt`

Brand-visible analytics must aggregate interactions according to privacy policy; private Shop notes are never exposed.

---

# 7. Buying Domain

## 7.1 BuyingWorkspace

Поля:

- `id`
- `shopOrganisationId`
- `campaignId`
- `status: active | completed | archived`
- `ownerUserId`
- `collaboratorUserIds[]`
- `budgetPlanId?`

## 7.2 Selection

Поля:

- `id`
- `buyingWorkspaceId`
- `collectionId`
- `brandOrganisationId`
- `status: draft | review | approved | converted_to_order | archived`
- `ownerUserId`
- `totalUnits?`
- `totalWholesaleMinor?`
- `currency`

## 7.3 SelectionItem

Поля:

- `id`
- `selectionId`
- `collectionProductId`
- `productVariantId?`
- `decision: undecided | shortlisted | approved | excluded`
- `buyerNote?`
- `quantityIntent?`
- `deliveryWindowId?`
- `displayOrder`

## 7.4 ComparisonSet

Поля:

- `id`
- `buyingWorkspaceId`
- `name`
- `selectionItemIds[]`
- `createdBy`

## 7.5 BudgetPlan

Поля:

- `id`
- `shopOrganisationId`
- `campaignId`
- `currency`
- `totalBudgetMinor`
- `status: draft | active | locked`

## 7.6 BudgetAllocation

Поля:

- `id`
- `budgetPlanId`
- `dimension: brand | category | store | delivery_window`
- `dimensionId`
- `amountMinor`

Инвариант: сумма allocations может быть меньше total budget, но превышение отображается явно.

---

# 8. Order Domain

## 8.1 Order

Поля:

- `id`
- `orderNumber`
- `brandOrganisationId`
- `shopOrganisationId`
- `campaignId`
- `collectionIds[]`
- `dealSpaceId`
- `status: draft | internal_review | submitted | brand_review | changes_requested | resubmitted | confirmed | cancelled | closed`
- `currency`
- `priceListId`
- `buyerReference?`
- `billingAddress`
- `shippingAddress`
- `commercialTermsSnapshot`
- `currentVersionId`
- `submittedAt?`
- `confirmedAt?`
- `cancelledAt?`
- `createdBy`
- `ownerUserId`

Инварианты:

- Brand и Shop совпадают с active TradingRelationship;
- submitted/confirmed order имеет immutable version;
- confirmed order нельзя редактировать без explicit amendment flow;
- totals вычисляются, не вводятся вручную.

## 8.2 OrderVersion

Поля:

- `id`
- `orderId`
- `versionNumber`
- `status: draft | submitted | superseded | confirmed`
- `createdByOrganisationId`
- `createdByUserId`
- `changeSummary?`
- `totalsSnapshot`
- `createdAt`

## 8.3 OrderLine

Поля:

- `id`
- `orderVersionId`
- `collectionProductId`
- `productVariantId`
- `deliveryWindowId`
- `unitWholesalePriceMinor`
- `suggestedRetailPriceMinor?`
- `discountPercent?`
- `sizeQuantities`
- `totalUnits`
- `lineTotalMinor`
- `buyerComment?`
- `brandComment?`

## 8.4 OrderDeliverySplit

Поля:

- `id`
- `orderVersionId`
- `deliveryWindowId`
- `startsOn`
- `endsOn`
- `totalUnits`
- `totalMinor`

## 8.5 OrderSuggestion

Brand-proposed change without silent overwrite.

Поля:

- `id`
- `orderId`
- `baseVersionId`
- `type: line_change | quantity_change | delivery_change | commercial_change`
- `patch`
- `reason`
- `status: pending | accepted | rejected | superseded`
- `createdBy`
- `resolvedBy?`
- `resolvedAt?`

## 8.6 OrderApproval

Поля:

- `id`
- `orderId`
- `organisationId`
- `type: internal_submit | finance | final_confirmation`
- `requiredRoleId?`
- `assignedUserId?`
- `status: pending | approved | rejected | skipped`
- `comment?`
- `resolvedAt?`

## 8.7 OrderValidationResult

Поля:

- `orderVersionId`
- `blockingIssues[]`
- `warnings[]`
- `calculatedAt`

Issue fields:

- `code`
- `message`
- `entityRef`
- `suggestedFix?`

---

# 9. Appointment and Calendar Domain

## 9.1 CalendarEvent

Поля:

- `id`
- `ownerOrganisationId`
- `type: appointment | campaign_milestone | order_deadline | internal_meeting | industry_event | reminder`
- `title`
- `description?`
- `startsAt`
- `endsAt`
- `timeZone`
- `status: tentative | confirmed | cancelled | completed`
- `visibility: private | organisation | shared`
- `linkedEntityRefs[]`
- `participantIds[]`
- `externalCalendarRefs[]`

## 9.2 Appointment

Поля:

- `id`
- `brandOrganisationId`
- `shopOrganisationId`
- `campaignId`
- `collectionIds[]`
- `dealSpaceId`
- `calendarEventId`
- `format: physical | video | hybrid`
- `location?`
- `meetingUrl?`
- `status: proposed | confirmed | declined | reschedule_requested | cancelled | live | completed`
- `hostUserId`
- `participantUserIds[]`
- `agendaItems[]`
- `summary?`
- `startedAt?`
- `completedAt?`

## 9.3 AppointmentProposal

Поля:

- `id`
- `appointmentId`
- `proposedStartsAt`
- `proposedEndsAt`
- `timeZone`
- `proposedBy`
- `status: pending | accepted | declined | superseded`

---

# 10. DealSpace and Collaboration Domain

## 10.1 DealSpace

Поля:

- `id`
- `brandOrganisationId`
- `shopOrganisationId`
- `campaignId?`
- `status: active | quiet | closed | archived`
- `title`
- `participantUserIds[]`
- `linkedCollectionIds[]`
- `linkedOrderIds[]`
- `linkedAppointmentIds[]`
- `lastActivityAt`

## 10.2 ConversationThread

Поля:

- `id`
- `dealSpaceId`
- `contextType: dealspace | campaign | collection | product | order | order_line | appointment | document`
- `contextId`
- `title?`
- `status: open | resolved | archived`
- `participantUserIds[]`
- `lastMessageAt?`

## 10.3 Message

Поля:

- `id`
- `threadId`
- `senderUserId`
- `body`
- `richBody?`
- `attachmentIds[]`
- `mentionedUserIds[]`
- `replyToMessageId?`
- `createdAt`
- `editedAt?`
- `deletedAt?`

## 10.4 MessageReadReceipt

- `messageId`
- `userId`
- `readAt`

## 10.5 CommentAnchor

Поля:

- `id`
- `threadId`
- `entityType`
- `entityId`
- `productVariantId?`
- `imageCoordinate?`
- `orderLineId?`

## 10.6 Task

Поля:

- `id`
- `organisationId`
- `dealSpaceId?`
- `title`
- `description?`
- `status: open | in_progress | blocked | completed | cancelled`
- `priority: low | normal | high | urgent`
- `assigneeUserId?`
- `dueAt?`
- `linkedEntityRefs[]`
- `sourceMessageId?`
- `visibility: private | organisation | shared`

## 10.7 Note

Поля:

- `id`
- `organisationId`
- `dealSpaceId?`
- `title?`
- `body`
- `visibility: private | organisation | shared`
- `linkedEntityRefs[]`

## 10.8 ActivityEvent

Поля:

- `id`
- `actorUserId?`
- `actorOrganisationId?`
- `type`
- `entityType`
- `entityId`
- `dealSpaceId?`
- `payload`
- `occurredAt`
- `visibility`

---

# 11. Documents Domain

## 11.1 Document

Поля:

- `id`
- `ownerOrganisationId`
- `type: lookbook | linesheet | price_list | order_pdf | order_export | commercial_terms | campaign_asset | meeting_file | other`
- `name`
- `mimeType`
- `sizeBytes`
- `storageKey`
- `status: uploading | ready | failed | archived`
- `visibility: private | organisation | shared`
- `linkedEntityRefs[]`
- `versionNumber`
- `checksum`

## 11.2 GeneratedDocument

Поля:

- `documentId`
- `templateId`
- `sourceEntityType`
- `sourceEntityId`
- `sourceVersionId?`
- `generatedAt`

---

# 12. Analytics Domain

## 12.1 AnalyticsEvent

Поля:

- `id`
- `type`
- `actorOrganisationId`
- `actorUserId?`
- `subjectType`
- `subjectId`
- `campaignId?`
- `collectionId?`
- `shopOrganisationId?`
- `brandOrganisationId?`
- `metadata`
- `occurredAt`

## 12.2 MetricDefinition

Поля:

- `id`
- `name`
- `description`
- `formula`
- `dimensions[]`
- `currencyHandling?`
- `privacyRule`

---

# 13. Audit and Idempotency

## 13.1 AuditRecord

Поля:

- `id`
- `actorUserId`
- `actorOrganisationId`
- `action`
- `entityType`
- `entityId`
- `before?`
- `after?`
- `occurredAt`
- `requestId`

## 13.2 IdempotencyRecord

Поля:

- `key`
- `organisationId`
- `operation`
- `requestHash`
- `responseSnapshot`
- `createdAt`
- `expiresAt`

---

# 14. Domain policies

Обязательные policies:

- `CanPublishCollection`
- `CanInviteShopToCampaign`
- `CanViewShowroom`
- `CanEditSelection`
- `CanCreateOrderFromSelection`
- `CanSubmitOrder`
- `CanRequestOrderChanges`
- `CanConfirmOrder`
- `CanCancelOrder`
- `CanShareDocument`
- `CanJoinAppointment`
- `CanViewDealSpace`
- `CanWriteSharedMessage`

Policies возвращают не только boolean, но и понятный reason code.

---

# 15. Versioning rules

Versioned entities:

- Collection;
- Showroom publication;
- Order;
- generated commercial documents.

Неверсионируемые операционные сущности:

- Message (edit history отдельно);
- Task;
- CalendarEvent;
- Selection draft (revision log, но не immutable versions до Order creation).

---

# 16. Privacy boundaries

Brand никогда не видит без разрешения:

- private buyer notes;
- excluded products;
- internal shop comments;
- internal approval discussion;
- shop budget details, если Shop не поделился ими.

Shop никогда не видит:

- internal brand notes;
- other shops’ access, activity or orders;
- internal sales targets;
- internal buyer segmentation labels, если они не предназначены для shared use.

Shared data всегда помечается явно.