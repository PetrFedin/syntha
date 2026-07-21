---
task_id: TASK-0005
status: QA
priority: P0
product_area: product-canon
capability_ids:
  - WSC-001
  - WSC-002
  - WSC-003
  - WSC-004
  - WSC-005
  - WSC-006
  - WSC-007
  - WSC-008
  - WSC-009
  - WSC-010
  - WSC-011
  - WSC-012
  - WSC-013
  - WSC-014
  - WSC-015
  - WSC-016
  - WSC-017
  - WSC-018
  - WSC-019
  - WSC-020
workflow_ids:
  - WF-001
  - WF-002
  - WF-003
  - WF-004
  - WF-005
  - WF-006
  - WF-007
  - WF-008
screen_ids:
  - access
  - organisation-chooser
  - accounts
  - commercial-policy
  - catalog
  - collection
  - showroom
  - selection
  - order-builder
  - order-detail
  - dealspace
  - calendar
  - analytics
  - integrations
permissions:
  - organisation.members.manage
  - accounts.manage
  - commercial-policy.manage
  - catalog.manage
  - showroom.publish
  - selection.manage
  - order.submit
  - order.approve
  - order.confirm
  - dealspace.collaborate
commands:
  - SwitchActiveOrganisation
  - AssignCommercialPolicy
  - PublishShowroom
  - AddSelectionItem
  - SubmitOrder
  - ConfirmOrder
  - PostDealMessage
  - PublishAvailabilitySnapshot
domain_events:
  - ActiveOrganisationChanged
  - CommercialPolicyAssigned
  - ShowroomPublished
  - SelectionItemAdded
  - OrderSubmitted
  - OrderConfirmed
  - DealMessagePosted
  - AvailabilitySnapshotPublished
dependencies:
  - TASK-0001
  - TASK-0002
  - TASK-0003
source_documents:
  - docs/product/WHOLESALE_PLATFORM_BENCHMARK.md
  - docs/product/wholesale-capability-benchmark.json
  - docs/product/SYNTHA_WHOLESALE_PRODUCT_CANON.md
  - docs/architecture/context-map.json
  - CURSOR_MASTER_RULES.md
---

# Wholesale capability canon

## Outcome

Convert the competitor benchmark into a controlled Syntha product canon with explicit scope, ownership, workflows, permissions, commands, events, screens and acceptance rules.

## Delivered

- final decisions for WSC-001 through WSC-020;
- canonical lifecycle and organisation model;
- MVP, post-MVP and excluded boundaries;
- one owning module for every MVP capability;
- eight core workflows with commands, events, screens and permissions;
- explicit Legacy isolation and external integration boundaries.

## QA focus

- verify that all MVP capabilities have one clear owner;
- verify that deferred and excluded areas have revisit conditions;
- confirm terminology and workflow order before TASK-0005 moves to DONE.
