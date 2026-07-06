/** BFF contract: normalize internal postgres modes to `pg` for Platform Core clients. */
export type BffStorageMode = 'pg' | 'file' | 'memory' | 'unavailable' | 'local';

export function toBffPgStorageMode(
  mode: 'postgres' | 'pg' | 'file' | 'memory' | 'unavailable' | 'local_only' | 'pg_only_blocked' | string
): BffStorageMode {
  if (mode === 'postgres' || mode === 'pg') return 'pg';
  if (mode === 'local_only' || mode === 'pg_only_blocked') return 'unavailable';
  if (mode === 'file' || mode === 'memory' || mode === 'unavailable' || mode === 'local') {
    return mode;
  }
  return 'memory';
}
