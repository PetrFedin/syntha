#!/usr/bin/env node
/**
 * Перекалибровка static/live в *-audit.ts от HEAD-базы + содержимого good/bad/fix.
 * Запуск: npx tsx scripts/recalibrate-readiness-scores.ts
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  calibrateHonestStaticScore,
  deriveHonestLiveScore,
} from '../src/lib/platform-core-readiness-sections/scoring';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sectionsDir = path.join(root, 'src/lib/platform-core-readiness-sections');
const gitPrefix = '_ai-share/synth-1-full/src/lib/platform-core-readiness-sections';

function countGoodLines(block: string): number {
  const goodStart = block.indexOf('good: [');
  if (goodStart < 0) return 0;
  const rest = block.slice(goodStart);
  const end = rest.indexOf('\n      ],') >= 0 ? rest.indexOf('\n      ],') : rest.indexOf('\n        ],');
  const slice = end > 0 ? rest.slice(0, end) : rest;
  return (slice.match(/^\s+'/gm) ?? []).length;
}

function parseHeadSections(source: string) {
  const map = new Map<string, { staticScore: number; goodLines: number }>();
  const re =
    /id: '([^']+)'[\s\S]*?staticScore: ([\d.]+)[\s\S]*?good: \[([\s\S]*?)\],/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    map.set(m[1], {
      staticScore: Number(m[2]),
      goodLines: (m[3].match(/^\s+'/gm) ?? []).length,
    });
  }
  return map;
}

function extractSectionFields(block: string) {
  const summary =
    block.match(/summary:\s*\n?\s*'([^']*(?:\\'[^']*)*)'/)?.[1]?.replace(/\\'/g, "'") ?? '';
  const goodBlock = block.match(/good: \[([\s\S]*?)\],/)?.[1] ?? '';
  const badBlock = block.match(/bad: \[([\s\S]*?)\],/)?.[1] ?? '';
  const fixBlock = block.match(/fix: \[([\s\S]*?)\],/)?.[1] ?? '';
  const parseList = (inner: string) =>
    [...inner.matchAll(/'([^']*(?:\\'[^']*)*)'/g)].map((x) => x[1].replace(/\\'/g, "'"));
  return {
    summary,
    good: parseList(goodBlock),
    bad: parseList(badBlock),
    fix: parseList(fixBlock),
  };
}

function recalibrateFile(filename: string) {
  const filePath = path.join(sectionsDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  const headContent = execSync(`git show HEAD:${gitPrefix}/${filename}`, {
    cwd: path.join(root, '..'),
    encoding: 'utf8',
  });
  const headMap = parseHeadSections(headContent);

  let updates = 0;
  content = content.replace(
    /(\bid: '([^']+)'[\s\S]*?staticScore: )([\d.]+)(,[\s\S]*?liveScore: )([\d.]+)/g,
    (full, prefix, id, oldStatic, mid) => {
      const head = headMap.get(id);
      const fields = extractSectionFields(full);
      const headStatic = head?.staticScore ?? Number(oldStatic);
      const waveBoost =
        head && fields.good.length > head.goodLines + 1
          ? 0.1
          : head && fields.good.length > head.goodLines
            ? 0.05
            : 0;
      const staticScore = calibrateHonestStaticScore(
        headStatic,
        fields.summary,
        fields.good,
        fields.bad,
        fields.fix,
        waveBoost
      );
      const liveScore = deriveHonestLiveScore(staticScore, fields.good, fields.bad, fields.fix);
      updates += 1;
      return `${prefix}${staticScore}${mid}${liveScore}`;
    }
  );

  fs.writeFileSync(filePath, content);
  return updates;
}

const files = fs
  .readdirSync(sectionsDir)
  .filter((f) => f.endsWith('-audit.ts'))
  .sort();

let total = 0;
for (const f of files) {
  const n = recalibrateFile(f);
  console.log(`${f}: ${n} sections recalibrated`);
  total += n;
}
console.log(`Total: ${total} sections`);
