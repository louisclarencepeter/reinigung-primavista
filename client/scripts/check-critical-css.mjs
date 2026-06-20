// Build/CI guard: fail if the hand-curated structural critical CSS has drifted
// from styles.css. Token blocks can't drift (they're read from styles.css), so
// this only checks the structural declarations. Run via `npm run build`.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditCriticalCss } from './critical-css.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stylesPath = path.resolve(__dirname, '..', 'src', 'styles.css');
const stylesCss = readFileSync(stylesPath, 'utf8');

const issues = auditCriticalCss(stylesCss);

if (issues.length) {
  console.error(`\n✖ Critical CSS drift: ${issues.length} declaration(s) in scripts/critical-css.mjs disagree with src/styles.css:\n`);
  for (const i of issues) console.error(`  - ${i}`);
  console.error('\nSync the structural block in scripts/critical-css.mjs with styles.css (or fix styles.css).\n');
  process.exit(1);
}

console.log('✓ Critical CSS in sync with styles.css');
