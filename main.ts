// main.ts — hands in the Vice City Trophy Ledger for make.fun's
// gta6-trophy-guide-01 bounty.
//
// It copies app/ and screenshots/ from this repository to the output
// directory (/output in the grader, MAKEFUN_OUTPUT_DIR outside it) and
// writes /output/dossier.json with buildDossier from the kit's
// vendor/makefun-frontend.ts. Node 22, standard library only, no network.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR
  ? resolve(process.env.MAKEFUN_OUTPUT_DIR)
  : '/output';

// The bounty's gate caps, from the kit's RULES.txt and competition.yaml:
// text at most 163,840 bytes; 3 to 4 screenshots, each at most 256 KiB;
// app/ at most 993 files and directories and 48 MiB; paths at most 1,000 bytes.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function copyEntry(name: string): void {
  const from = join(REPO_ROOT, name);
  const to = join(OUTPUT_DIR, name);
  if (!existsSync(from)) throw new Error(`main.ts: ${name}/ is missing from the repository`);
  cpSync(from, to, { recursive: true });
}

rmSync(OUTPUT_DIR, { recursive: true, force: true });
mkdirSync(OUTPUT_DIR, { recursive: true });
copyEntry('app');
copyEntry('screenshots');

const dossier = buildDossier(OUTPUT_DIR, CAPS);
writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
console.log(`Wrote ${join(OUTPUT_DIR, 'dossier.json')} (${dossier.length} bytes).`);
