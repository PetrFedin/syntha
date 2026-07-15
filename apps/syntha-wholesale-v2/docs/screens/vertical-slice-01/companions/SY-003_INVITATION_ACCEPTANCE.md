# SY-003 — Invitation Acceptance

## 1. Identity

- **Role:** Shared/System onboarding
- **Route:** `/wholesale-v2/invitations/:token`
- **Template:** Focus Mode
- **Priority:** P0
- **Capabilities:** CAP-PLT-002, CAP-REL-002–004, CAP-SHO-009
- **Primary action:** context-dependent `Accept invitation`, `Create account`, `Continue to showroom`

## 2. User goal

Securely convert a Brand invitation into an authenticated Shop membership/relationship/access context without exposing confidential buyer data or forcing duplicate organisation creation.

## 3. Invitation types

```text
team_membership
brand_shop_relationship
campaign_access
appointment
```

First vertical slice requires `campaign_access`, which may also establish relationship and membership.

## 4. Token exchange model

The raw invitation token is inspected server-side and exchanged for a short-lived invitation session.

Flow:

```text
raw token URL
→ server validation
→ invitation preview without sensitive details
→ sign in/create account
→ organisation resolution
→ explicit accept
→ token consumed
→ authenticated redirect
```

After exchange, raw token must be removed from browser URL/history where practical.

## 5. Screen states

### Valid — existing authenticated Shop member

Show:

- Brand name/logo;
- campaign/collection summary;
- invitation sender;
- access expiry/order deadline;
- target Shop organisation;
- terms/privacy summary;
- Accept/Decline.

### Valid — existing user, no matching Shop membership

- sign in if needed;
- choose eligible existing Shop organisation or request admin approval;
- create membership only according invitation policy.

### Valid — new user/new Shop

Minimal onboarding:

1. name/email/password or identity provider;
2. verify email when required;
3. create Shop organisation with legal/display name, country, currency;
4. accept invitation;
5. continue to Showroom.

### Already accepted

- show accepted state;
- sign in/continue;
- never re-run side effects.

### Expired/revoked

- human explanation;
- request new invitation action;
- Brand contact/support route where allowed;
- no sensitive campaign details.

### Wrong organisation

- explain target Shop;
- switch organisation if user belongs;
- request correction;
- do not allow accepting into arbitrary Shop.

## 6. Data contract

```ts
type InvitationPreviewVM = {
  invitationId: string;
  type: 'campaign_access';
  status: 'valid' | 'expired' | 'revoked' | 'accepted';
  expiresAt?: string;
  sender: UserSummary;
  brand: OrganisationPublicSummary;
  campaign?: CampaignInvitationSummary;
  targetShop?: OrganisationSummary;
  recipientEmail?: string;
  requiresAuthentication: boolean;
  requiresOrganisationSelection: boolean;
  eligibleOrganisations: OrganisationSummary[];
  permissions: {
    accept: boolean;
    decline: boolean;
    requestReplacement: boolean;
  };
};
```

Sensitive price/product data is not in preview. It is resolved only after successful acceptance and authenticated Shop context.

## 7. Commands

```text
InspectInvitationToken
ExchangeInvitationToken
CreateUserFromInvitation
CreateShopOrganisationFromInvitation
AcceptCampaignInvitation
DeclineCampaignInvitation
RequestReplacementInvitation
```

Acceptance command includes:

- invitation session ID;
- selected/created Shop organisation ID;
- authenticated user;
- expected invitation version;
- idempotency key.

## 8. Acceptance transaction

Atomic steps:

1. validate invitation session and original token state;
2. validate authenticated user/email policy;
3. validate selected Shop eligibility;
4. create/activate membership if allowed;
5. create/activate TradingRelationship if required;
6. activate CampaignAccessGrant;
7. mark invitation accepted/consumed;
8. create audit/domain events;
9. redirect using server-provided safe route.

No partial accepted invitation with missing access grant.

## 9. Security requirements

- signed high-entropy token;
- hashed token storage;
- expiry/revocation;
- one-time or bounded reuse;
- rate limiting;
- no token in logs/analytics;
- CSRF protection for acceptance;
- membership/organisation server validation;
- invitation preview data minimisation;
- redirect allowlist;
- session fixation prevention;
- audit success/failure classes without secret.

## 10. Layout

Desktop:

```text
Centered Focus card max 560 px
Brand/campaign visual header
Invitation summary
Account/organisation resolution
Terms and access summary
Primary/secondary action
Help/replacement link
```

Do not create oversized marketing landing page.

Mobile:

- full-width within 16 px padding;
- form fields 48 px;
- primary CTA sticky only for long onboarding step;
- safe-area respected;
- no hidden organisation mismatch warnings.

## 11. Decline

Decline requires optional reason and confirmation. It:

- updates invitation status;
- does not create relationship/access;
- notifies assigned Brand user;
- allows future new invitation.

## 12. Success redirect

Server decides:

```text
campaign access → Shop Showroom or Available Campaign detail
team invitation  → organisation home
appointment      → appointment detail
```

Redirect includes no raw invitation token.

## 13. Events

```text
invitation.inspected analytics-safe
invitation.accepted
invitation.declined
membership.activated
relationship.activated
campaign.access_grant_activated
```

## 14. Error codes

```text
INVITATION_INVALID
INVITATION_EXPIRED
INVITATION_REVOKED
INVITATION_ALREADY_ACCEPTED
INVITATION_EMAIL_MISMATCH
INVITATION_ORGANISATION_MISMATCH
INVITATION_VERSION_CONFLICT
RELATIONSHIP_SUSPENDED
ACCOUNT_VERIFICATION_REQUIRED
```

## 15. Acceptance criteria

- [ ] Valid invited user can accept and reach correct Shop Showroom.
- [ ] New user can create minimum required Shop context without duplicate side effects.
- [ ] Existing user cannot accept into unrelated Shop.
- [ ] Repeated acceptance request is idempotent.
- [ ] Expired/revoked token exposes no confidential pricing/products.
- [ ] Token is not stored in analytics/log output.
- [ ] Membership, relationship and access grant are created atomically.
- [ ] Decline notifies Brand and creates no access.
- [ ] Successful redirect contains no raw token.
- [ ] Desktop/mobile/accessibility states are complete.

## 16. Non-goals

- full Shop profile onboarding;
- payment verification;
- public brand discovery;
- marketplace retailer underwriting.
