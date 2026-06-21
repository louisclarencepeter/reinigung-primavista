import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCriticalCss } from './scripts/critical-css.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Above-the-fold critical CSS, generated at build time: design tokens are read
// straight from styles.css (so they can never drift) and combined with the
// curated structural rules in scripts/critical-css.mjs. The structural rules
// are guarded against drift by scripts/check-critical-css.mjs (run in build).
const CRITICAL_CSS = buildCriticalCss(
  readFileSync(path.resolve(__dirname, 'src', 'styles.css'), 'utf8')
);

function inlineCssAssets() {
  return {
    name: 'inline-css-assets',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const cssAssets = Object.entries(bundle).filter(
        ([fileName, asset]) => asset.type === 'asset' && fileName.endsWith('.css')
      );
      const entryChunks = Object.entries(bundle).filter(
        ([fileName, chunk]) => chunk.type === 'chunk' && chunk.isEntry && fileName.endsWith('.js')
      );

      if (!cssAssets.length && !entryChunks.length) return;

      const css = cssAssets.map(([, asset]) => String(asset.source)).join('\n');
      const criticalStyleTag = `<style>${CRITICAL_CSS}</style>`;

      for (const [, asset] of Object.entries(bundle)) {
        if (asset.type !== 'asset' || !asset.fileName.endsWith('.html')) continue;
        let html = String(asset.source);
        let cssInjected = false;
        const delayedScripts = [];

        for (const [fileName] of cssAssets) {
          const href = `/${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`;
          const stylesheetLink = new RegExp(
            `<link(?=[^>]*rel="stylesheet")(?=[^>]*href="${href}")[^>]*>`,
            'g'
          );
          html = html.replace(stylesheetLink, () => {
            if (cssInjected) return '';
            cssInjected = true;
            return `${criticalStyleTag}<link rel="preload" as="style" href="/${fileName}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="/${fileName}"></noscript>`;
          });
        }

        for (const [fileName] of entryChunks) {
          const src = `/${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`;
          const entryScript = new RegExp(
            `<script(?=[^>]*type="module")(?=[^>]*src="${src}")[^>]*></script>`,
            'g'
          );
          html = html.replace(entryScript, '');
          delayedScripts.push(`import('/${fileName}')`);
        }

        if (!cssInjected) html = html.replace('</head>', `${criticalStyleTag}</head>`);
        if (delayedScripts.length) {
          const loadCode = `Promise.all([${delayedScripts.join(',')}])`;
          html = html.replace(
            '</body>',
            `<script>(function(){var p;function load(e){if(p)return p;var t=e&&e.target&&e.target.closest&&e.target.closest('.menu-toggle');p=${loadCode}.then(function(){if(t&&t.isConnected&&t.getAttribute('aria-expanded')==='false'){setTimeout(function(){t.click();},50);}});return p;}['pointerdown','mousedown','click','keydown','touchstart','focus','wheel','scroll'].forEach(function(e){window.addEventListener(e,load,{once:true,passive:true});});window.addEventListener('load',function(){setTimeout(load,6000);},{once:true});})();</script></body>`
          );
        }
        asset.source = html;
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineCssAssets()],
  server: {
    // netlify dev proxies to 5173 (targetPort in netlify.toml); PORT lets a
    // harness move the standalone dev server when 5173 is taken.
    port: Number(process.env.PORT) || 5173,
  },
});
