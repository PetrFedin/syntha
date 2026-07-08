# ADR-002: Article as central spine entity

**Status:** Accepted  
**Date:** 2026-07-08

## Context

Multiple identifiers (SKU, style, product, feature proposal) appeared across FastAPI, W2, and marketing modules.

## Decision

**Article** (`workshop2_articles` + dossier JSON) is the central entity of the golden path.

- Collection groups articles for a season
- Sample lifecycle attaches to article
- B2B order lines reference articles
- Production handoff uses article + collection context
- Comms threads use article/order context keys

All other names (product, style, SKU) are views or attributes of Article, not parallel masters.

## Consequences

- Development pillar owns article write path
- FastAPI `/product` module is NOT Article — label as Extended/AI
- Spine URLs: `brandDevelopmentArticleHref`, dossier routes keyed by collectionId + articleId

## Alternatives rejected

- Order-centric model — orders come after collection assembly
- Product master in FastAPI only — breaks W2 PG spine
