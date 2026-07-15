# 11 — Security and Data Architecture

## 1. Security goals

Syntha Wholesale V2 must protect:

- commercial price lists;
- unreleased collections;
- buyer-specific assortments;
- draft and confirmed orders;
- internal notes;
- brand-shop communications;
- documents and media;
- user and organization data;
- audit history.

The platform is multi-tenant. A tenant isolation failure is a critical P0 incident.

## 2. Tenant model

Primary tenant entity: `Organization`.

Organization types:

- `brand`;
- `shop`.

Every business entity contains `ownerOrganizationId` or an explicit access relationship.

Access between brand and shop is granted through explicit entities:

- `BrandShopRelationship`;
- `CampaignInvitation`;
- `CollectionAudienceGrant`;
- `DealSpaceMembership`;
- `OrderParty`.

A shop cannot read a collection merely because it knows the ID.

## 3. Authentication

Requirements:

- secure server-managed session;
- short-lived access token or session cookie;
- refresh rotation where token model is used;
- MFA-ready architecture;
- invitation-based onboarding;
- session revocation;
- device/session list P1;
- SSO/SAML P2.

## 4. Authorization

Authorization combines:

1. authenticated user;
2. active organization membership;
3. organization type;
4. role;
5. fine-grained permissions;
6. entity relationship;
7. entity state.

Example permissions:

```text
campaign.read
campaign.create
campaign.update
campaign.publish
collection.read
collection.update
collection.publish
buyer.manage
appointment.manage
order.create
order.submit
order.review
order.confirm
order.revise
dealspace.read
dealspace.message
dealspace.task.manage
document.upload
analytics.read
team.manage
settings.manage
```

No client-provided role or organization ID is trusted without server validation.

## 5. Canonical role presets

### Brand Admin

Full organization access.

### Head of Sales

Campaigns, collections, buyers, appointments, orders, analytics, DealSpace.

### Sales Manager

Assigned campaigns/buyers/orders, appointments and communications.

### Showroom Manager

Collections, presentations, appointments and buyer preview.

### Finance Reviewer

Orders, totals, exports; no collection editing by default.

### Shop Admin

Full shop organization access.

### Buying Director

Campaigns, selections, budgets, orders, approvals and analytics.

### Buyer

Assigned brands/campaigns, selections, order drafting and DealSpace.

### Merchandiser

Selections, budget/planning and internal comments; submit permission optional.

### Finance Approver

Order review/approval and exports; no product selection editing by default.

## 6. Data classification

### Public

- public brand profile;
- explicitly public campaign assets.

### Partner confidential

- published showroom available to approved shops;
- buyer-specific price lists;
- order documents;
- DealSpace messages.

### Organization internal

- internal notes;
- private tasks;
- campaign preparation data;
- unpublished collection versions;
- buyer strategy notes.

### Restricted

- authentication secrets;
- payment data when introduced;
- security logs;
- personally identifiable data requiring limited access.

## 7. Data model invariants

- Every record has stable ID, timestamps and version where concurrent editing matters.
- Soft delete is used only where recovery/audit is required; it must not substitute archival state.
- Order totals are reproducible from immutable price and currency snapshots.
- Confirmed order versions are immutable; changes create revisions.
- Published collection release is immutable; edits create a new draft/release.
- Message deletion preserves an audit marker where legally and operationally required.
- Price visibility is evaluated server-side.
- Internal notes never enter shared DealSpace payloads.

## 8. Audit log

Audit events required for:

- sign-in and security-sensitive session changes;
- invitations and membership changes;
- permission changes;
- collection publish/unpublish;
- buyer audience changes;
- price list assignment;
- order submit/withdraw/revision/confirmation;
- document upload/delete;
- appointment create/reschedule/cancel;
- export of sensitive commercial data.

Audit event fields:

```text
id
organizationId
actorUserId
actorOrganizationId
action
entityType
entityId
previousVersion
nextVersion
occurredAt
requestId
ipHash / security context where allowed
metadata
```

## 9. Documents and uploads

- Upload uses presigned URLs.
- Server finalizes document after storage verification.
- MIME type and extension are validated.
- File size limits by type.
- Malware scanning is required before external sharing.
- Private bucket/object ACL by default.
- Download URLs are short-lived.
- Document access is checked at request time.
- Image/video derivatives do not inherit public access accidentally.

## 10. Messaging safety

- Message access is based on DealSpace membership.
- Mentions cannot notify users outside the entity audience.
- Attachments inherit DealSpace access only after validation.
- Internal organization messages must be a separate channel type.
- Editing/deleting messages follows a documented retention policy.
- Rate limiting and abuse controls are required.

## 11. Realtime security

- Subscriptions are authorized server-side.
- Channel names alone never grant access.
- Membership/permission changes revoke subscriptions.
- Events contain minimum necessary data; clients refetch sensitive detail.
- Replay cursors are scoped by organization and user.

## 12. Privacy and retention

Before production launch define:

- data retention schedule;
- account deletion policy;
- user export process;
- organization offboarding;
- communication retention;
- backup retention;
- regional storage requirements;
- GDPR/UK GDPR responsibilities;
- DPA and subprocessor inventory.

## 13. Operational security

Required controls:

- environment separation;
- no production secrets in repository;
- secret rotation;
- dependency scanning;
- code review for auth and permissions;
- database backups and restore test;
- structured security logs;
- alerting for authorization failures and unusual exports;
- incident response runbook;
- least-privilege service accounts.

## 14. Testing requirements

Mandatory tests:

- brand A cannot access brand B data;
- shop A cannot access shop B data;
- uninvited shop cannot access collection;
- revoked buyer loses access immediately;
- buyer-specific price list cannot leak to another shop;
- internal note never appears in shared API;
- order mutation checks party and permission;
- realtime subscription rejects unauthorized entity;
- exported files require current authorization;
- ID enumeration does not bypass access.

## 15. Security definition of done

A feature is not complete until:

- data classification is known;
- permission matrix is documented;
- server authorization exists;
- negative authorization tests exist;
- audit requirements are implemented;
- sensitive UI does not rely on hiding controls alone;
- logs do not expose secrets or full sensitive payloads;
- security review findings are resolved or explicitly accepted.
