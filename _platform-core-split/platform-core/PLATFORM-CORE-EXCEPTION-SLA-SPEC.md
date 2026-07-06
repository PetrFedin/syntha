# Platform Core Exception SLA Spec

Исключение - это не просто warning. Это рабочий объект с владельцем, сроком и выходом.

## Exception Types

```text
missing data;
missing document;
price conflict;
terms conflict;
reserve conflict;
capacity conflict;
material shortage;
supplier late;
QC fail;
marking issue;
shipment delay;
delivery discrepancy;
payment overdue;
integration failed;
permission denied.
```

## Required Fields

```text
ticketId;
entityType;
entityId;
ownerRole;
ownerUser;
severity;
SLA;
calendar due date;
chat thread;
allowed resolution;
business impact;
event trace;
state;
recovery action.
```

## States

```text
open;
assigned;
waiting_for_role;
waiting_for_document;
resolved;
accepted_with_risk;
escalated;
closed.
```

## Rule

Любой blocked gate должен создавать exception или показывать уже существующий exception.
