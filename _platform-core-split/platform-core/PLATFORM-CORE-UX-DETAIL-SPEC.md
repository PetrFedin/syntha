# Platform Core UX Detail Spec

Визуальная задача Platform Core - спокойная операционная ясность.

## Every Screen

```text
top line: entity, state, owner, next action;
second line: source/confidence and blocker;
primary action: one clear next step;
secondary actions: menu;
details: allowed tabs only;
right/bottom panel: chat/calendar/trace;
empty state: why empty and what to do;
error state: what failed and who owns fix;
loading state: stable skeleton;
mobile: one action per screen;
iPad: master-detail;
MacBook: matrix + cockpit.
```

## Visual Rules

```text
radius: 8px max for cards/buttons;
palette: neutral, conservative, low contrast noise;
typography: compact, no hero-scale inside app;
copy: short labels, no long descriptions;
effects: no decorative gradients/orbs;
layout: no nested cards;
buttons: action label only, no explanation paragraph;
tables: no horizontal mobile overflow.
```

## JOOR / NuORDER Balance

Use:

```text
clean linesheet/order clarity;
fast matrix entry;
clear buyer-safe product/collection state;
compact order status;
simple action path from collection to order.
```

Do not use:

```text
marketing showroom noise;
too many campaign/analytics tabs;
fashion editorial hero;
AI side panels without output;
duplicate order routes.
```
