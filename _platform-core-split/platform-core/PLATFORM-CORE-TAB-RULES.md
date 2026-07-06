# Platform Core Tab Rules

Таб в Platform Core разрешен только если относится к одному из типов ниже.

## Allowed Tab Types

| Tab | Purpose |
| --- | --- |
| Overview | state, next action, blockers, owner |
| Data | fields, source, confidence, completeness |
| Actions | allowed role actions from state machine |
| Documents | required, missing, issued, signed, exported |
| Timeline | events, stage changes, decisions, shipment, deadlines |
| Chat | entity-linked threads only |
| Calendar | entity-linked tasks/deadlines only |
| Exceptions | blockers, SLA, escalation, owner |
| Audit | decision ledger, source changes, integration sync history |

## Forbidden Tabs

```text
marketing explanation;
generic dashboard;
duplicate registry;
investor summary inside operator flow;
unconnected AI;
unconnected analytics;
generic chat;
generic calendar;
archive/demo page.
```

## UI Rule

На первом экране `/platform` нельзя импортировать тяжелые рабочие экраны. Только matrix, role/pillar state, score, next action, link.

## Copy Rule

Название таба должно быть коротким: `Overview`, `Data`, `Actions`, `Documents`, `Timeline`, `Chat`, `Calendar`, `Exceptions`, `Audit`.
