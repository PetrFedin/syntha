# 02 — Functional Map

## Обозначения приоритета

- **P0** — обязательно для первого законченного commercial MVP.
- **P1** — следующий релиз после подтверждения основного потока.
- **P2** — расширение, не должно задерживать MVP.

---

# A. Shared Platform Foundation

## A1. Organisation and identity

- **P0** Brand organisation creation and profile.
- **P0** Shop organisation creation and profile.
- **P0** Multi-user organisation membership.
- **P0** Role-based access control.
- **P0** Invitation by email.
- **P0** User activation/deactivation.
- **P0** Organisation switcher for users with multiple memberships.
- **P1** SSO/SAML.
- **P1** SCIM provisioning.
- **P1** Custom permission sets.
- **P2** Delegated agency/representative access.

## A2. Global navigation

- **P0** Persistent desktop sidebar.
- **P0** Compact tablet navigation.
- **P0** Mobile review navigation.
- **P0** Organisation context.
- **P0** Season/campaign context.
- **P0** Global search.
- **P0** Notification centre.
- **P0** Quick create.
- **P0** Recent entities.
- **P1** Command palette.
- **P1** Keyboard shortcuts.

## A3. Shared entity capabilities

For Campaign, Collection, Order, Buyer/Brand, Appointment and DealSpace:

- **P0** Entity Header.
- **P0** Status.
- **P0** Owner/team.
- **P0** Tags.
- **P0** Activity timeline.
- **P0** Files.
- **P0** Notes.
- **P0** Tasks.
- **P0** Comments/messages when applicable.
- **P0** Audit history.
- **P0** Permissions.
- **P0** Archive/restore.
- **P1** Custom fields.
- **P1** Templates.
- **P1** Automations.

## A4. Notifications

- **P0** In-app notifications.
- **P0** Email notifications.
- **P0** Mention notifications.
- **P0** Assignment notifications.
- **P0** Deadline reminders.
- **P0** Order status notifications.
- **P0** Appointment invitation/update notifications.
- **P0** Read/unread state.
- **P1** Digest mode.
- **P1** Per-entity notification preferences.
- **P1** Push notifications.

---

# B. Brand Dashboard

## B1. Today

- **P0** Today’s appointments.
- **P0** Orders requiring action.
- **P0** Buyer messages requiring reply.
- **P0** Campaign deadlines.
- **P0** Assigned tasks.
- **P0** Recent showroom activity.

## B2. Sales performance

- **P0** Submitted order value.
- **P0** Confirmed order value.
- **P0** Order count.
- **P0** Average order value.
- **P0** Appointment-to-order conversion.
- **P0** Showroom-to-selection conversion.
- **P1** Target vs actual.
- **P1** Sales by market/country.
- **P1** Sales by manager.
- **P1** Forecast based on open opportunities.

## B3. Buyer activity

- **P0** Recently active shops.
- **P0** Showrooms opened.
- **P0** Selections started.
- **P0** Draft orders shared.
- **P0** Buyers inactive near campaign deadline.
- **P1** Engagement score.
- **P1** Recommended follow-ups.

---

# C. Sales Campaigns

## C1. Campaign registry

- **P0** Create campaign.
- **P0** Duplicate campaign.
- **P0** Campaign template.
- **P0** Status filters: draft, scheduled, active, closing, completed, archived.
- **P0** Search and saved views.
- **P0** Owner/team filters.
- **P0** Date filters.
- **P0** Bulk archive.

## C2. Campaign setup

- **P0** Name and season.
- **P0** Campaign type: main, pre, capsule, carry-over, immediate.
- **P0** Start/end dates.
- **P0** Time zone.
- **P0** Selling markets.
- **P0** Currencies.
- **P0** Default price lists.
- **P0** Default delivery windows.
- **P0** Team and ownership.
- **P0** Buyer access model.
- **P0** Campaign visual identity.
- **P0** Campaign status lifecycle.
- **P1** Revenue targets.
- **P1** Market targets.
- **P1** Campaign cloning across seasons.

## C3. Campaign overview

- **P0** Progress summary.
- **P0** Collections included.
- **P0** Invited shops.
- **P0** Appointments.
- **P0** Draft/submitted/confirmed orders.
- **P0** Campaign calendar.
- **P0** Tasks and alerts.
- **P0** Latest activity.

## C4. Campaign buyer management

- **P0** Add shops individually.
- **P0** Add shops by segment.
- **P0** Import buyer list.
- **P0** Assign sales manager.
- **P0** Configure collection access.
- **P0** Configure price list.
- **P0** Configure currency.
- **P0** Configure order deadline.
- **P0** Invitation status.
- **P0** Resend/revoke invitation.
- **P1** Buyer-specific assortment.
- **P1** Buyer-specific commercial terms.

## C5. Campaign calendar

- **P0** Campaign launch.
- **P0** Showroom periods.
- **P0** Appointment slots.
- **P0** Order deadlines.
- **P0** Internal review dates.
- **P0** Buyer reminders.
- **P1** Market weeks and events.
- **P1** Shared deadline proposals.

## C6. Campaign analytics

- **P0** Invitation/open funnel.
- **P0** Collection engagement.
- **P0** Selection funnel.
- **P0** Order funnel.
- **P0** Revenue by collection/shop/manager.
- **P1** Drop-off analysis.
- **P1** Engagement cohort comparison.

---

# D. Collections

## D1. Collection registry

- **P0** Create collection.
- **P0** Duplicate collection.
- **P0** Add to campaign.
- **P0** Status: draft, incomplete, ready, published, closed, archived.
- **P0** Gallery/table view.
- **P0** Search, filters and saved views.
- **P0** Bulk campaign assignment.

## D2. Collection identity and story

- **P0** Title.
- **P0** Season/drop.
- **P0** Cover image/video.
- **P0** Description.
- **P0** Story blocks.
- **P0** Moodboard.
- **P0** Campaign media.
- **P0** Designer/sales notes.
- **P1** Localised story content.
- **P1** Buyer-segment-specific intro.

## D3. Product catalogue within collection

- **P0** Product list.
- **P0** Product gallery.
- **P0** Product import.
- **P0** Add existing product.
- **P0** Product order/sorting.
- **P0** Categories.
- **P0** Drops/capsules.
- **P0** Colourways.
- **P0** Size ranges.
- **P0** Wholesale prices.
- **P0** Suggested retail prices.
- **P0** Delivery windows.
- **P0** MOQ and pack rules.
- **P0** Availability state.
- **P0** Product media.
- **P0** Buyer-facing description.
- **P0** Internal-only notes.
- **P1** Product variants by market.
- **P1** Buyer-specific availability.

## D4. Looks and visual merchandising

- **P0** Create look.
- **P0** Add products to look.
- **P0** Look image/video.
- **P0** Reorder looks.
- **P0** Quick add entire look to selection.
- **P0** Partial look selection.
- **P1** Shop-the-look recommendations.
- **P1** Outfit alternatives.
- **P2** Virtual rack/planogram.

## D5. Commercial terms

- **P0** Price lists.
- **P0** Currency.
- **P0** Incoterm/free-text delivery terms.
- **P0** Order minimum.
- **P0** Product MOQ.
- **P0** Pack configuration.
- **P0** Delivery windows.
- **P0** Order deadline.
- **P0** Payment terms display.
- **P0** Tax mode display.
- **P1** Discount rules.
- **P1** Buyer-specific terms.

## D6. Readiness

- **P0** Required field validation.
- **P0** Missing image validation.
- **P0** Missing commercial data validation.
- **P0** Invalid size/colour matrix validation.
- **P0** Unavailable price list validation.
- **P0** Buyer access validation.
- **P0** Publish checklist.
- **P0** Blocking vs warning issues.

## D7. Publish and versioning

- **P0** Preview before publish.
- **P0** Publish.
- **P0** Schedule publish.
- **P0** Unpublish.
- **P0** Buyer access after publish.
- **P0** Version history.
- **P0** Change summary.
- **P0** Buyer notification for material changes.
- **P1** Draft changes against live version.
- **P1** Compare versions.

---

# E. Digital Showroom

## E1. Presentation modes

- **P0** Editorial story.
- **P0** Product grid.
- **P0** Linesheet/table.
- **P0** Looks.
- **P0** Fullscreen presentation.
- **P0** Search and filters.
- **P0** Quick product preview.
- **P0** Persistent selection tray.
- **P1** Runway/video mode.
- **P1** Moodboard mode.
- **P1** Rack mode.

## E2. Product viewer

- **P0** Images.
- **P0** Video.
- **P0** Zoom.
- **P0** Colour switch.
- **P0** Key commercial data.
- **P0** Delivery windows.
- **P0** Size range.
- **P0** MOQ/pack.
- **P0** Suggested retail and margin when permitted.
- **P0** Add to selection.
- **P0** Add note.
- **P0** Share internally.
- **P0** Previous/next navigation.
- **P1** 360 media.
- **P1** Compare colourways.

## E3. Buyer interaction

- **P0** Favourite.
- **P0** Shortlist.
- **P0** Reject/skip privately.
- **P0** Buyer note.
- **P0** Team comment.
- **P0** Add to selection.
- **P0** Add look to selection.
- **P0** View selection count and value.
- **P0** Resume from last position.
- **P1** Reaction markers.
- **P1** Brand-visible interest signal with permission.

## E4. Showroom access

- **P0** Authenticated access.
- **P0** Invitation access.
- **P0** Buyer-specific price list.
- **P0** Buyer-specific currency.
- **P0** Buyer-specific collection visibility.
- **P0** Access expiry.
- **P0** Revoke access.
- **P1** Public/private share link.
- **P1** Watermarking.

## E5. Live appointment mode

- **P0** Host starts appointment.
- **P0** Shared current product/look.
- **P0** Participant list.
- **P0** Shared selection updates.
- **P0** Shared notes.
- **P0** Agenda.
- **P0** Chat.
- **P0** Create task/follow-up.
- **P0** End meeting and summary.
- **P1** Native audio/video.
- **P1** Screen share.
- **P1** Meeting recording subject to consent.

---

# F. Buyers and Brand Relationships

## F1. Brand-side buyer registry

- **P0** Shop company profile.
- **P0** Contacts.
- **P0** Locations/stores.
- **P0** Assigned sales manager.
- **P0** Segment/tags.
- **P0** Campaign access.
- **P0** Price list/currency.
- **P0** Appointment history.
- **P0** Order history.
- **P0** DealSpace.
- **P0** Activity timeline.
- **P1** Engagement score.
- **P1** Buyer preferences.

## F2. Shop-side brand registry

- **P0** Connected brands.
- **P0** Pending invitations.
- **P0** Access request.
- **P0** Brand contacts.
- **P0** Active campaigns.
- **P0** Appointment history.
- **P0** Order history.
- **P0** DealSpace.
- **P1** Favourite brands.
- **P1** Internal brand rating/notes.

## F3. Relationship permissions

- **P0** Brand controls collection access.
- **P0** Shop controls internal visibility.
- **P0** Shared vs private notes.
- **P0** Shared vs private files.
- **P0** Contact-level permissions.
- **P0** Relationship revoke/suspend.

---

# G. Appointments and Calendar

## G1. Calendar views

- **P0** Month.
- **P0** Week.
- **P0** Day.
- **P0** Agenda/list.
- **P0** Time zone display.
- **P0** Filters by campaign, collection, shop/brand, owner and event type.
- **P0** Personal/team/shared calendars.
- **P1** Resource/room calendar.

## G2. Appointment scheduling

- **P0** Create appointment.
- **P0** Invite participants.
- **P0** Select campaign/collection.
- **P0** Propose date/time.
- **P0** Accept/decline.
- **P0** Suggest another time.
- **P0** Reschedule/cancel.
- **P0** Time zone handling.
- **P0** Reminder settings.
- **P0** Meeting link.
- **P0** Agenda.
- **P0** Files.
- **P0** Notes.
- **P0** Follow-up tasks.
- **P1** Availability booking page.
- **P1** Round-robin sales assignment.

## G3. Sales and industry events

- **P0** Brand showroom event.
- **P0** Sales campaign event.
- **P0** Buying deadline.
- **P0** Market week/trade show custom event.
- **P1** Curated industry calendar.
- **P1** Event import/subscription.

## G4. Calendar integrations

- **P1** Google Calendar sync.
- **P1** Microsoft Outlook sync.
- **P1** ICS export/import.
- **P1** External meeting provider links.

---

# H. Shop Buying Workspace

## H1. Selection

- **P0** Selection per campaign/collection.
- **P0** Products and looks.
- **P0** Favourite/shortlist state.
- **P0** Buyer notes.
- **P0** Team comments.
- **P0** Status: undecided, shortlisted, approved, excluded.
- **P0** Bulk status update.
- **P0** Filter by category/brand/delivery/status.
- **P0** Total value and SKU count.
- **P0** Missing decision indicator.

## H2. Comparison

- **P0** Compare products side by side.
- **P0** Compare colours.
- **P0** Compare price/margin.
- **P0** Compare delivery.
- **P0** Compare MOQ/pack.
- **P1** Compare across brands.
- **P1** Save comparison set.

## H3. Budget and category planning

- **P0** Campaign budget.
- **P0** Category budgets.
- **P0** Brand budget.
- **P0** Current selection vs budget.
- **P0** Over/under budget indicators.
- **P0** Units/value/margin views.
- **P1** Store-level budget.
- **P1** Delivery-period budget.
- **P1** Scenario planning.

## H4. Team buying

- **P0** Assign reviewer.
- **P0** Internal comments.
- **P0** Private notes.
- **P0** Approval status.
- **P0** Activity history.
- **P1** Voting/reactions.
- **P1** Category owner workflow.

---

# I. Order Builder

## I1. Entry and persistence

- **P0** Create draft from selection.
- **P0** Create empty draft.
- **P0** Autosave.
- **P0** Version number.
- **P0** Last saved indicator.
- **P0** Resume draft.
- **P0** Duplicate draft.
- **P0** Draft owner and collaborators.

## I2. Product source rail

- **P0** Search.
- **P0** Categories.
- **P0** Drops/capsules.
- **P0** Looks.
- **P0** Selection status.
- **P0** Delivery window.
- **P0** Availability.
- **P0** Saved filters.
- **P0** Add product/look to order.

## I3. Matrix editing

- **P0** Product rows.
- **P0** Colour grouping.
- **P0** Size columns.
- **P0** Quantity input.
- **P0** Keyboard navigation.
- **P0** Paste from spreadsheet.
- **P0** Fill across sizes.
- **P0** Apply size curve.
- **P0** Clear row/colour/product.
- **P0** Duplicate quantities.
- **P0** Undo/redo.
- **P0** Row totals.
- **P0** Product totals.
- **P0** Validation inline.
- **P1** Suggested size curve.
- **P1** Historical size curve.

## I4. Pack and MOQ handling

- **P0** Pack definition display.
- **P0** Pack quantity input.
- **P0** MOQ validation.
- **P0** Order minimum validation.
- **P0** Rounding suggestion.
- **P0** Explain validation reason.
- **P1** Alternative pack suggestion.

## I5. Deliveries

- **P0** Delivery window per line.
- **P0** Split line across deliveries.
- **P0** Delivery totals.
- **P0** Invalid delivery warning.
- **P1** Store-level delivery split.
- **P1** Delivery scenario comparison.

## I6. Commercial summary

- **P0** Units.
- **P0** Wholesale value.
- **P0** Suggested retail value.
- **P0** Expected margin when data available.
- **P0** Currency.
- **P0** Discounts when permitted.
- **P0** Budget comparison.
- **P0** Order minimum progress.
- **P0** Delivery split summary.
- **P0** Tax/payment term informational summary.

## I7. Collaboration

- **P0** Shared draft.
- **P0** Presence indicator.
- **P0** Line/product comments.
- **P0** Mentions.
- **P0** Change log.
- **P0** Brand suggestion without silent overwrite.
- **P0** Buyer accepts/rejects suggestion.
- **P1** Real-time co-editing.

## I8. Review and submit

- **P0** Review screen.
- **P0** Blocking validations.
- **P0** Warnings.
- **P0** Buyer PO/reference.
- **P0** Billing/shipping information.
- **P0** Commercial terms acknowledgement.
- **P0** Internal approval.
- **P0** Submit.
- **P0** Submission receipt.
- **P0** Immutable submitted version.

## I9. Export

- **P0** PDF summary.
- **P0** XLSX export.
- **P0** CSV lines export.
- **P1** ERP/API export.
- **P1** Custom export mapping.

---

# J. Orders

## J1. Order lifecycle

```text
Draft
→ Internal Review (optional)
→ Submitted
→ Brand Review
→ Changes Requested (optional)
→ Resubmitted
→ Confirmed
→ Cancelled / Closed
```

## J2. Order registry

- **P0** Role-specific views.
- **P0** Status filters.
- **P0** Campaign/collection filters.
- **P0** Brand/shop filters.
- **P0** Owner filters.
- **P0** Deadline filters.
- **P0** Saved views.
- **P0** Export.

## J3. Order detail

- **P0** Overview.
- **P0** Lines.
- **P0** Delivery split.
- **P0** Commercial summary.
- **P0** Buyer reference.
- **P0** Terms.
- **P0** Approvals.
- **P0** Documents.
- **P0** DealSpace.
- **P0** Activity.
- **P0** Version history.

## J4. Brand review

- **P0** Confirm as submitted.
- **P0** Request changes.
- **P0** Suggest line/quantity changes.
- **P0** Add review comment.
- **P0** Confirm final version.
- **P0** Cancel/reject with reason.
- **P1** Partial confirmation.

## J5. Shop response

- **P0** View requested changes.
- **P0** Accept suggestion.
- **P0** Reject suggestion.
- **P0** Edit and resubmit.
- **P0** Withdraw before confirmation when allowed.

---

# K. DealSpace and Communications

## K1. DealSpace creation

- **P0** Automatically created for Brand ↔ Shop relationship in campaign/order context.
- **P0** Linked campaign.
- **P0** Linked collection(s).
- **P0** Linked appointment(s).
- **P0** Linked order(s).
- **P0** Participant permissions.

## K2. Conversation

- **P0** Threaded messages.
- **P0** Mentions.
- **P0** Reactions.
- **P0** Attachments.
- **P0** Product/order deep links.
- **P0** Edit/delete rules.
- **P0** Read receipts.
- **P0** Unread state.
- **P0** Search within DealSpace.
- **P1** Voice messages.
- **P1** Translation.

## K3. Contextual comments

- **P0** Comment on product.
- **P0** Comment on colourway.
- **P0** Comment on order line.
- **P0** Comment on document.
- **P0** Comment on appointment.
- **P0** Resolve/reopen comment.
- **P1** Pin comment to image coordinates.

## K4. Tasks

- **P0** Create from message.
- **P0** Assign to user.
- **P0** Due date.
- **P0** Status.
- **P0** Link to entity.
- **P0** Complete/reopen.
- **P0** My tasks / all tasks.
- **P1** Recurring task.
- **P1** Task template.

## K5. Files

- **P0** Upload.
- **P0** Preview.
- **P0** Download.
- **P0** Link to campaign/collection/order/message.
- **P0** Version metadata.
- **P0** Access control.
- **P1** File version replacement.
- **P1** Approval request.

## K6. Notes

- **P0** Shared note.
- **P0** Private note.
- **P0** Link to entity.
- **P0** Search.
- **P1** Rich collaborative note.

## K7. Activity timeline

- **P0** Message sent.
- **P0** File added.
- **P0** Task created/completed.
- **P0** Appointment created/changed.
- **P0** Selection updated.
- **P0** Order submitted/changed/confirmed.
- **P0** Showroom opened.
- **P0** Filter by activity type.

---

# L. Documents

## L1. Library

- **P0** Central document registry.
- **P0** Entity links.
- **P0** Type filters.
- **P0** Search.
- **P0** Owner/source.
- **P0** Access visibility.
- **P0** Preview/download.
- **P0** Archive.

## L2. Document types

- **P0** Lookbook.
- **P0** Linesheet.
- **P0** Price list.
- **P0** Order PDF.
- **P0** Order XLSX/CSV.
- **P0** Commercial terms.
- **P0** Campaign assets.
- **P0** Meeting files.
- **P1** Invoice/packing list informational attachment.

## L3. Generation

- **P0** Generate linesheet PDF.
- **P0** Generate order summary PDF.
- **P0** Export order XLSX.
- **P0** Branded templates.
- **P1** Template editor.

---

# M. Analytics

## M1. Brand analytics

- **P0** Campaign funnel.
- **P0** Showroom engagement.
- **P0** Product views.
- **P0** Product saves.
- **P0** Product selection rate.
- **P0** Appointment conversion.
- **P0** Submitted/confirmed order value.
- **P0** Buyer conversion.
- **P0** Collection performance.
- **P0** Product performance.
- **P1** Engagement heatmap.
- **P1** Follow-up recommendations.
- **P1** Sales forecast.

## M2. Shop analytics

- **P0** Spend by campaign.
- **P0** Spend by brand.
- **P0** Spend by category.
- **P0** Units and SKU mix.
- **P0** Budget usage.
- **P0** Delivery mix.
- **P0** Order history.
- **P1** Margin mix.
- **P1** Scenario comparison history.

## M3. Data rules

- **P0** Clear metric definition.
- **P0** Time zone/currency context.
- **P0** Export.
- **P0** Permission-aware analytics.
- **P0** No vanity metric without actionability.

---

# N. Settings and Integrations

## N1. Organisation settings

- **P0** Profile.
- **P0** Logo/branding.
- **P0** Legal/commercial information.
- **P0** Users.
- **P0** Roles.
- **P0** Locations/stores.
- **P0** Currencies.
- **P0** Languages.
- **P0** Notification preferences.

## N2. Commercial settings

- **P0** Price lists.
- **P0** Size scales.
- **P0** Delivery windows.
- **P0** MOQ defaults.
- **P0** Pack defaults.
- **P0** Payment terms display.
- **P0** Order numbering.
- **P1** Discount policies.
- **P1** Approval rules.

## N3. Integrations

- **P0** CSV/XLSX import/export.
- **P0** Webhook foundation.
- **P1** ERP product/order API.
- **P1** PIM integration.
- **P1** Google Calendar.
- **P1** Microsoft Calendar.
- **P1** SSO.
- **P2** Payment services.

---

# O. AI Assistance — controlled scope

AI не входит в критический путь до завершения P0, но архитектура должна позволять добавить:

- **P1** Meeting summary.
- **P1** Conversation summary.
- **P1** Suggested follow-up task.
- **P1** Natural-language showroom search.
- **P1** Explainable order validation help.
- **P2** Assortment gaps.
- **P2** Budget-aware product suggestions.
- **P2** Historical size curve suggestion.
- **P2** Buyer engagement recommendation.

Любая рекомендация должна показывать основание и никогда не изменять заказ без подтверждения пользователя.

---

# P. Universal states

Каждый функциональный экран обязан иметь:

- loading;
- empty;
- no results;
- permission denied;
- offline/retry;
- validation error;
- server error;
- success confirmation;
- stale/conflict state where relevant.

Ни один пункт P0 не считается реализованным, если существует только визуальный элемент без рабочего write/read path.