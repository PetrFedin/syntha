# Full Architecture Audit — Syntha Platform Core v1

**Date:** 2026-07-08 · Phase 18

> Автоматический скан + ручная классификация. Ничего не удалено — только inventory.

## Frontend Routes

### 🟢 Core
- platform-core-routes.ts (brand/shop)
- /platform
- /brand/core
- /shop/core
- shop/b2b/{orders,checkout,matrix,tracking,showroom,partners,working-order}

### 🟡 Supporting
- brand/{linesheets,showroom,b2b-orders,messages,calendar,materials,production}
- platform-core-native-href

### 🟠 Extended
- platform-core-extended-routes.ts
- /factory/production/*
- /factory/supplier/*

### 🔵 Archive
- platform-core-legacy-routes.ts
- _archive/b2b-advanced/*
- _archive/client-b2c/*

### 🔴 Dead code
- Legacy Workshop2 UI paths redirected to /platform

## Backend API

### 🟢 Core
- platform_core_baseline.py: auth, org, brand, product, collections, showrooms, wholesale, orders, dam, plm, pricing, inventory, collaboration, tasks, platform_stack, ai

### 🟠 Extended
- platform_core_extended.py: factory, retail, marketing, analytics, ...

### 🔵 Archive
- client, wardrobe, academy, auctions, marketplace, smart_contracts

## Components

### 🟢 Core
- RoleCoreCabinetHub (baseline path)
- PlatformCoreCabinetPage
- pillar workspace shells

### 🟠 Extended
- FactoryDossierCoreChrome
- SupplierProcurementPillarCard
- workspaces/*Manufacturer*

### 🔵 Archive
- *RetailPeerStrip stubs → _archive/platform-core-legacy

### 🔴 Dead code
- Duplicated B2B order detail paths in legacy app/shop/b2b-orders

## Lib / Stores

### 🟢 Core
- platform-core-hub-matrix*
- platform-core-demo-context
- platform-core-article-spine

### 🟡 Supporting
- platform-core-readiness-routes bridge
- platform-core-handoff-* server

### 🔵 Archive
- platform-core-wave7/wave9 archive manifests

## Duplicates & tech debt (do not auto-delete)

| Issue | Location | Recommendation |
|-------|----------|----------------|
| Full `@/lib/routes` in readiness tests only | `__tests__/platform-core-*` | OK for contract tests |
| Static factory imports in pillar cards | 8 files in `components/platform` | Dynamic import by role |
| Archive peer strip re-exports | 10 `*RetailPeerStrip.tsx` | Lazy load or move to extended bundle |
| Backend monolith still loads all models | SQLAlchemy | Baseline router isolates HTTP only |
| Dual collaboration mount | baseline only | extended router excludes duplicate ✅ |
