import path from 'node:path';
import { scanPlatformCoreUiDedup } from '../platform-core-ui-dedup-scan.server';

describe('platform-core-ui-dedup-scan.server', () => {
  it('returns array (may be empty) for synth-1-full src', async () => {
    const root = path.join(__dirname, '..', '..');
    const hits = await scanPlatformCoreUiDedup(root);
    expect(Array.isArray(hits)).toBe(true);
    for (const hit of hits) {
      expect(hit.agentId).toBe('ui_improvement');
      expect(hit.file).toMatch(/^src\//);
    }
  });
});
