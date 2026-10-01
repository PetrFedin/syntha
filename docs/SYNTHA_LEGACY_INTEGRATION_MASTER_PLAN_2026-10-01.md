# Syntha Legacy — AI & Migration Integration Master Plan

**Document:** `docs/SYNTHA_LEGACY_INTEGRATION_MASTER_PLAN_2026-10-01.md`  
**Status:** PLANNED  
**Date:** 2026-10-01

## Strategic rule

Syntha legacy must **not** evolve into a second competing Fashion OS.

Its future role is:

1. AI/R&D laboratory;
2. migration donor to Synth-v2;
3. compatibility/contract test environment;
4. controlled experimentation surface for capabilities that may later graduate to Synth-v2.

Synth-v2 remains the business/product authority.

## Integration disposition

| Capability | Source | Decision |
|---|---|---|
| Capability Registry | native | ADOPT |
| Migration contracts | Pact | ADOPT |
| AI gateway | LiteLLM | ADOPT |
| LLM observability | Langfuse | ADOPT |
| Prompt regression | Promptfoo | ADOPT |
| Typed AI agents | PydanticAI | ADOPT |
| Output validation | Guardrails | ADAPT |
| RAG/loaders | LlamaIndex | ADAPT |
| Vector retrieval | pgvector | ADOPT for lab |
| AI experiments | GrowthBook | ADAPT |
| Batch AI jobs | Prefect | CONDITIONAL |
| Local GPU serving | vLLM | DEFER |

## Phase 0 — Capability Registry

Create one machine-readable registry for every meaningful legacy feature:

- KEEP in legacy;
- MIGRATE to Synth-v2;
- REPLACE with Synth-v2 native capability;
- RETIRE;
- EXPERIMENT ONLY.

Each record includes:

- capability ID;
- source paths;
- data dependencies;
- external APIs;
- target Synth-v2 module;
- migration status;
- verification test.

No new commercial feature is developed without a registry disposition.

## Phase 1 — Syntha -> Synth-v2 Migration Bridge

Use Pact-style contract tests.

For each migrated capability:

`legacy request/data -> canonical fixture -> Synth-v2 API/import -> expected domain state`

Do not share databases.

Migration jobs must be:

- read-only against legacy;
- idempotent into Synth-v2 staging;
- diffable;
- reject partial invalid records;
- produce migration evidence.

## Phase 2 — AI Gateway

Use LiteLLM as provider abstraction.

All model calls go through a bounded adapter that records:

- use case;
- model/provider;
- prompt/version;
- latency;
- token/cost data where available;
- result status.

Business code must not call provider SDKs directly after migration.

Secrets remain outside prompts/logs.

## Phase 3 — AI Observability + Evaluation

### Langfuse

Trace:

`request -> prompt version -> retrieval context -> model -> tool calls -> output -> user/validator outcome`

Redact sensitive/commercial data before telemetry where required.

### Promptfoo

Create regression suites for:

- fashion classification;
- product attribute extraction;
- tech-pack assistance;
- supplier-document extraction;
- visual/reference descriptions;
- summarisation.

A prompt/model change must not graduate to Synth-v2 solely because examples look good manually.

## Phase 4 — Typed AI execution

Use PydanticAI for new experimental agents.

Every agent gets:

- typed input;
- typed output;
- explicit tools;
- dependency injection;
- timeout/retry boundary;
- validation;
- no direct DB mutation.

Agent returns a **proposal**. A domain command in Synth-v2 decides whether it can be committed.

Guardrails may add additional output/content validation but does not replace domain rules.

## Phase 5 — Fashion RAG lab

Use LlamaIndex selectively for loading/chunking/metadata and pgvector for retrieval.

Allowed corpus examples:

- approved tech packs;
- supplier manuals;
- material specifications;
- internal process docs;
- product/copy guidelines.

Required lineage for every retrieved chunk:

- source document ID;
- version;
- page/section;
- ingestion timestamp;
- access scope.

Never index unauthorised documents into a shared global corpus.

## Phase 6 — Controlled experimentation

GrowthBook may manage experiment assignment for AI workflows:

- prompt A/B;
- retrieval strategy;
- model/provider;
- UI assistance.

Do not experiment on authoritative pricing, order acceptance or compliance rules without explicit human approval and guardrails.

## Phase 7 — Batch orchestration

Prefect is conditional.

Adopt only for genuinely durable/batch workflows such as:

- embedding corpus rebuild;
- migration batch;
- scheduled evaluation;
- large extraction job.

Do not use Prefect to replace Synth-v2 outbox/domain workflows.

## Phase 8 — vLLM gate

Only consider vLLM when there is:

- a real GPU environment;
- stable local-model use case;
- measured provider cost/latency reason;
- security/operations owner.

Until then, use hosted/local existing adapters.

## Graduation rule to Synth-v2

An experiment can move from Syntha to Synth-v2 only if:

1. capability owner is clear;
2. evaluation suite is green;
3. security/data boundary is documented;
4. no duplicate authority is introduced;
5. Synth-v2 has API/domain acceptance tests;
6. legacy capability is then marked MIGRATED/RETIRE.

## Prohibited

Do not:

- rebuild order/PLM/commercial truth in legacy;
- share production DB with Synth-v2;
- allow agents to write authoritative state directly;
- make Langfuse/LiteLLM a business source of truth;
- ship a RAG answer without source lineage;
- adopt vLLM without GPU/runtime justification.

## Suggested issue order

1. SYNTHA-INT-00 Capability Registry.
2. SYNTHA-INT-01 Migration contracts.
3. SYNTHA-INT-02 LiteLLM gateway.
4. SYNTHA-INT-03 Langfuse tracing.
5. SYNTHA-INT-04 Promptfoo regression.
6. SYNTHA-INT-05 PydanticAI typed agents.
7. SYNTHA-INT-06 RAG/pgvector lab.
8. SYNTHA-INT-07 Controlled experiments.
9. SYNTHA-INT-08 Optional Prefect jobs.
10. SYNTHA-INT-09 Retirement/migration closure.

**Implementation instruction:** every successful legacy capability should reduce long-term duplication, not increase it.

## Additional wave — reproducible AI datasets and model evaluation

### DVC evaluation-corpus versioning — ADOPT

Reference: https://github.com/iterative/dvc

Version large AI/RAG evaluation artefacts outside Git while keeping pointers/config in the repository.

Use for:

- image/reference sets;
- extraction benchmark documents;
- RAG corpora snapshots;
- labelled fashion/product test sets;
- migration comparison datasets.

Every Promptfoo/Langfuse evaluation should be able to reference an exact corpus version.

### MLflow experiment registry — ADAPT

Reference: https://github.com/mlflow/mlflow

Use for research experiments where prompt/model metrics alone are insufficient:

- embedding-model comparisons;
- classifier/extractor variants;
- local vs hosted model experiments;
- cost/latency/quality tradeoffs.

Record code SHA + DVC dataset ID + configuration.

MLflow is a research registry only; it cannot promote a capability to Synth-v2.

### Evidently evaluation/drift reports — ADAPT

Reference: https://github.com/evidentlyai/evidently

Use where a model/extractor has measurable distributions:

- attribute extraction quality;
- classification label mix;
- embedding retrieval metrics;
- input-data drift over time.

Drift alert means "review the capability", not "automatically retrain/replace production behavior".

### Graduation rule extension

A capability graduating to Synth-v2 must now carry:

- DVC/evaluation dataset reference where data-heavy;
- Promptfoo/Langfuse evidence;
- MLflow run reference where applicable;
- documented failure/drift thresholds;
- explicit owner and rollback path.

**Sequencing:** DVC first, then research registry/reporting; do not add MLflow/Evidently where Promptfoo alone already fully describes the experiment.

