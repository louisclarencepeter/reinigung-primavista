// Single source of truth for the above-the-fold critical CSS that gets inlined
// into the prerendered <head> (see vite.config.js / inlineCssAssets).
//
// The DESIGN TOKENS are not duplicated here — they are read straight from
// styles.css at build time (tokenLayer), so token values can never drift.
//
// The STRUCTURAL rules below are hand-curated (a deliberately small subset of
// styles.css, so the inline stays tiny). To stop *those* from drifting,
// auditCriticalCss() compares every structural declaration against styles.css
// and the build fails on any mismatch — see scripts/check-critical-css.mjs.

import postcss from 'postcss';

// Hand-curated above-the-fold rules. Values must match styles.css (enforced by
// the audit); layout-flow props (display, etc.) may legitimately differ because
// this block is mobile-first while styles.css is desktop-first.
export const STRUCTURAL_CRITICAL_CSS = String.raw`*,*:before,*:after{box-sizing:border-box}.skip-link{position:absolute;left:-9999px;top:0}html{scroll-behavior:smooth}body{margin:0;background:var(--cream);color:var(--ink);font-family:var(--f-body);font-size:17px;line-height:1.7;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}img{display:block;max-width:100%}a{color:inherit;text-decoration:none}button{font-family:inherit;cursor:pointer}.container{width:100%;max-width:var(--container);margin-inline:auto;padding-inline:32px}.site-header{position:sticky;top:0;z-index:60;background:var(--header-bg);backdrop-filter:saturate(140%) blur(14px);-webkit-backdrop-filter:saturate(140%) blur(14px);border-bottom:1px solid transparent}.header-inner{display:flex;align-items:center;justify-content:space-between;height:86px;gap:24px}.nav-links,.header-cta .btn,.mobile-nav{display:none}.logo{display:inline-flex;align-items:center;gap:13px}.logo .mark{width:46px;height:46px;flex:none;display:block;background:url(/logo-mark-128.webp) center/contain no-repeat}[data-theme=dark] .logo .mark{background-image:url(/logo-mark-dark-128.webp)}.logo .word{display:flex;flex-direction:column;line-height:1}.logo .word .name{font-family:var(--f-serif);font-weight:600;font-size:25px;letter-spacing:.14em;color:var(--heading);padding-left:2px;white-space:nowrap}.logo .word .sub{font-family:var(--f-display);font-weight:600;font-size:9.5px;letter-spacing:.42em;text-transform:uppercase;color:var(--sage-dark);margin-top:4px;padding-left:4px}.menu-toggle{width:44px;height:44px;border:0;background:transparent;color:var(--heading)}.theme-toggle{width:44px;height:44px;border-radius:50%;border:1.5px solid var(--hair-light);background:transparent;color:var(--heading)}.hero{position:relative;padding:72px 0 0;overflow:hidden}.hero-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:56px;align-items:center}.hero-copy{max-width:560px;min-width:0}.eyebrow{display:inline-flex;align-items:center;gap:12px;font-family:var(--f-display);font-weight:600;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--sage-dark);margin:0 0 22px}.eyebrow:before{content:"";width:30px;height:2px;background:var(--sage);border-radius:2px}.hero h1{font-family:var(--f-serif);font-weight:500;font-size:clamp(2.7rem,5vw,4.1rem);line-height:1.06;letter-spacing:-.015em;margin:0;color:var(--heading-strong)}.hero h1 em{font-style:italic;color:var(--sage-dark)}.hero .rule{width:64px;height:2px;background:var(--sage);margin:28px 0;border-radius:2px}.hero p.sub{font-size:1.2rem;line-height:1.6;color:var(--ink-muted);margin:0}.hero p.sub strong{color:var(--ink);font-weight:600}.hero-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:34px}.btn{display:inline-flex;align-items:center;gap:10px;font-family:var(--f-display);font-weight:600;font-size:14px;letter-spacing:.04em;padding:15px 28px;border-radius:var(--r-pill);border:1.5px solid transparent}.btn-primary{background:var(--sage-cta);color:#fff}.btn-ghost-dark{color:var(--heading);border-color:var(--ghost-border)}.hero-media{position:relative;width:100%;min-width:0}.hero-media .photo{border-radius:var(--r-lg);overflow:hidden;box-shadow:0 30px 70px -30px rgba(35,52,40,.5);aspect-ratio:4/4.2}.hero-media .photo img{width:100%;height:100%;object-fit:cover}.hero-media .photo picture{display:contents}.hero-badge{position:absolute;left:-34px;bottom:44px;background:var(--cream-soft);border:1px solid var(--hair-light);border-radius:var(--r-md);padding:20px 24px;max-width:260px;box-shadow:0 24px 50px -24px rgba(35,52,40,.4);display:flex;gap:14px;align-items:flex-start}.hero-badge .leaf{color:var(--sage-dark);flex:none;margin-top:2px}.hero-badge .t{font-family:var(--f-serif);font-style:italic;font-size:1.28rem;line-height:1.2;color:var(--heading)}.hero-badge .d{font-size:.82rem;color:var(--ink-muted);margin-top:6px;line-height:1.5}.warum-photo{position:relative;border-radius:var(--r-lg);overflow:hidden;aspect-ratio:4/3.3;box-shadow:0 30px 60px -30px rgba(35,52,40,.45)}.warum-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0}.warum-photo img.is-active{opacity:1}.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}.field input{min-height:48px}.field textarea{min-height:120px}.footer-col a,.footer-bottom .legal a,.footer-bottom .legal button{display:inline-flex;align-items:center;min-height:48px}.footer-col ul{gap:0}.footer-bottom .legal{gap:18px 26px}@media(max-width:1000px){.hero-grid{grid-template-columns:1fr;gap:40px}.hero-media{max-width:560px}.hero-badge{left:auto;right:18px}.hero p.sub{font-size:1rem;line-height:1.5}}@media(max-width:720px){.container{padding-inline:22px}.header-inner{gap:12px}.header-cta{gap:8px}.logo{gap:10px}.logo .mark{width:40px;height:40px}.logo .word .name{font-size:22px;letter-spacing:.1em}.logo .word .sub{font-size:8.5px;letter-spacing:.32em}.hero-badge{position:static;margin-top:18px;max-width:none}}@media(max-width:359px){.header-inner{gap:10px}.header-cta{gap:6px}.logo{gap:8px}.logo .mark{width:34px;height:34px}.logo .word .name{font-size:18px;letter-spacing:.04em}.logo .word .sub{font-size:8px;letter-spacing:.28em}}@media(min-width:981px){.nav-links{display:flex;align-items:center;gap:38px;list-style:none;margin:0;padding:0}.header-cta .btn{display:inline-flex}.menu-toggle{display:none}}`;

// Token blocks live ONLY in styles.css. Pull :root and [data-theme=dark] out of
// it and emit them minified, so the inlined tokens are byte-for-byte the source.
const TOKEN_SELECTORS = [':root', '[data-theme="dark"]'];

export function tokenLayer(stylesCssText) {
  const root = postcss.parse(stylesCssText);
  const blocks = [];
  root.walkRules((rule) => {
    if (rule.parent.type !== 'root') return; // only top-level token blocks
    if (!TOKEN_SELECTORS.includes(rule.selector)) return;
    const decls = [];
    rule.walkDecls((d) => decls.push(`${d.prop}:${d.value}`));
    const sel = rule.selector.replace('[data-theme="dark"]', '[data-theme=dark]');
    blocks.push(`${sel}{${decls.join(';')}}`);
  });
  if (blocks.length !== TOKEN_SELECTORS.length) {
    throw new Error(`critical-css: expected ${TOKEN_SELECTORS.length} token blocks in styles.css, found ${blocks.length}`);
  }
  return blocks.join('');
}

export function buildCriticalCss(stylesCssText) {
  return tokenLayer(stylesCssText) + STRUCTURAL_CRITICAL_CSS;
}

// ---- Drift audit -----------------------------------------------------------

// Props that may legitimately differ between the mobile-first critical block
// and desktop-first styles.css (display flow / list chrome reconciled by media
// queries). Everything else (colors, sizes, aspect-ratio, shadows…) must match.
const IGNORED_PROPS = new Set(['display', 'list-style']);

const norm = (prop, value) => {
  let v = value.toLowerCase().replace(/\s+/g, ' ').trim();
  v = v.replace(/\s*([,/])\s*/g, '$1'); // collapse spacing around , and / (e.g. 4 / 4.2 === 4/4.2)
  if ((prop === 'border' || prop === 'outline') && (v === 'none' || v === '0')) v = '0';
  return v;
};
const mediaKey = (params) => params.replace(/\s+/g, '');

function declIndex(cssText) {
  const root = postcss.parse(cssText);
  const index = new Map(); // "media||selector" -> Map(prop -> value)
  const addRule = (media, rule) => {
    rule.selectors.forEach((sel) => {
      const key = `${media}||${sel.trim()}`;
      if (!index.has(key)) index.set(key, new Map());
      const m = index.get(key);
      rule.walkDecls((d) => m.set(d.prop, norm(d.prop, d.value)));
    });
  };
  root.each((node) => {
    if (node.type === 'rule') addRule('', node);
    else if (node.type === 'atrule' && node.name === 'media') {
      node.walkRules((r) => addRule(mediaKey(node.params), r));
    }
  });
  return index;
}

// Returns an array of drift descriptions (empty = no drift). Only flags props
// present in BOTH the critical block and styles.css whose values disagree.
export function auditCriticalCss(stylesCssText) {
  const critical = declIndex(STRUCTURAL_CRITICAL_CSS);
  const source = declIndex(stylesCssText);
  const issues = [];
  for (const [key, cDecls] of critical) {
    const sDecls = source.get(key);
    if (!sDecls) continue; // selector not in styles.css (or pseudo-colon diff) — not comparable
    const [media, selector] = key.split('||');
    for (const [prop, cVal] of cDecls) {
      if (IGNORED_PROPS.has(prop)) continue;
      if (!sDecls.has(prop)) continue; // critical may carry a subset
      const sVal = sDecls.get(prop);
      if (cVal !== sVal) {
        issues.push(`${media ? media + ' ' : ''}${selector} { ${prop}: critical="${cVal}" vs styles.css="${sVal}" }`);
      }
    }
  }
  return issues;
}
