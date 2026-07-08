/**
 * Wave 35b: журнал human UAT signoff SS27 (file journal — без fake gov ACK).
 */
import fs from 'node:fs';
import path from 'node:path';

export type Workshop2Ss27UatSignoffRole = 'ops' | 'staging' | 'product';

export type Workshop2Ss27UatSignoffEntry = {
  role: Workshop2Ss27UatSignoffRole;
  signedBy: string;
  notes?: string;
  signedAt: string;
};

export type Workshop2Ss27UatSignoffJournal = {
  collectionId: string;
  entries: Workshop2Ss27UatSignoffEntry[];
  updatedAt: string;
};

export function getWorkshop2Ss27UatSignoffJournalPath(): string {
  return path.join(process.cwd(), '.planning/workshop2-ss27-uat-signoff.json');
}

export function loadWorkshop2Ss27UatSignoffJournal(): Workshop2Ss27UatSignoffJournal {
  const journalPath = getWorkshop2Ss27UatSignoffJournalPath();
  try {
    const raw = fs.readFileSync(journalPath, 'utf8');
    const parsed = JSON.parse(raw) as Workshop2Ss27UatSignoffJournal;
    if (parsed && Array.isArray(parsed.entries)) {
      return {
        collectionId: parsed.collectionId ?? 'SS27',
        entries: parsed.entries,
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      };
    }
  } catch {
    /* empty journal */
  }
  return {
    collectionId: 'SS27',
    entries: [],
    updatedAt: new Date().toISOString(),
  };
}

export function persistWorkshop2Ss27UatSignoffJournal(
  journal: Workshop2Ss27UatSignoffJournal
): void {
  const journalPath = getWorkshop2Ss27UatSignoffJournalPath();
  const dir = path.dirname(journalPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(journalPath, `${JSON.stringify(journal, null, 2)}\n`, 'utf8');
}

export function appendWorkshop2Ss27UatSignoff(input: {
  role: Workshop2Ss27UatSignoffRole;
  signedBy: string;
  notes?: string;
}): Workshop2Ss27UatSignoffJournal {
  const signedBy = input.signedBy.trim();
  if (!signedBy) {
    throw new Error('signedBy_required');
  }
  const journal = loadWorkshop2Ss27UatSignoffJournal();
  const signedAt = new Date().toISOString();
  const withoutRole = journal.entries.filter((e) => e.role !== input.role);
  const entry: Workshop2Ss27UatSignoffEntry = {
    role: input.role,
    signedBy,
    signedAt,
    ...(input.notes?.trim() ? { notes: input.notes.trim() } : {}),
  };
  const next: Workshop2Ss27UatSignoffJournal = {
    collectionId: 'SS27',
    entries: [...withoutRole, entry].sort((a, b) => a.role.localeCompare(b.role)),
    updatedAt: signedAt,
  };
  persistWorkshop2Ss27UatSignoffJournal(next);
  return next;
}

export function summarizeWorkshop2Ss27UatHumanSignoff(journal: Workshop2Ss27UatSignoffJournal): {
  humanSignoffs: Partial<Record<Workshop2Ss27UatSignoffRole, Workshop2Ss27UatSignoffEntry>>;
  humanSignoffAt: string | null;
  humanSignoffComplete: boolean;
} {
  const humanSignoffs: Partial<Record<Workshop2Ss27UatSignoffRole, Workshop2Ss27UatSignoffEntry>> =
    {};
  for (const e of journal.entries) {
    humanSignoffs[e.role] = e;
  }
  const latest = journal.entries
    .map((e) => e.signedAt)
    .sort()
    .at(-1);
  const humanSignoffComplete = Boolean(humanSignoffs.ops && humanSignoffs.staging);
  return {
    humanSignoffs,
    humanSignoffAt: latest ?? null,
    humanSignoffComplete,
  };
}

/** Wave 55: investor freeze gate — ops + product (отдельно от ops+staging cutover). */
export function summarizeWorkshop2Wave55InvestorFreezeSignoff(
  journal: Workshop2Ss27UatSignoffJournal
): {
  wave55FreezeSignoffs: Partial<Record<'ops' | 'product', Workshop2Ss27UatSignoffEntry>>;
  wave55FreezeComplete: boolean;
  wave55FreezeAt: string | null;
} {
  const wave55FreezeSignoffs: Partial<Record<'ops' | 'product', Workshop2Ss27UatSignoffEntry>> = {};
  for (const e of journal.entries) {
    if (e.role === 'ops' || e.role === 'product') {
      wave55FreezeSignoffs[e.role] = e;
    }
  }
  const latest = journal.entries
    .filter((e) => e.role === 'ops' || e.role === 'product')
    .map((e) => e.signedAt)
    .sort()
    .at(-1);
  const wave55FreezeComplete = Boolean(wave55FreezeSignoffs.ops && wave55FreezeSignoffs.product);
  return {
    wave55FreezeSignoffs,
    wave55FreezeComplete,
    wave55FreezeAt: latest ?? null,
  };
}
