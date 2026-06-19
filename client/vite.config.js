import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const CRITICAL_CSS = String.raw`
:root{--pine:#2e4636;--sage:#8a9a6b;--sage-dark:#6f8052;--cream:#f4f1ea;--ink:#2b2c27;--ink-muted:#5d6058;--heading:var(--pine);--heading-strong:var(--pine);--header-bg:rgba(244,241,234,.82);--f-serif:Georgia,"Times New Roman",serif;--f-display:"Helvetica Neue",Arial,sans-serif;--f-body:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
[data-theme=dark]{color-scheme:dark;--cream:#171b17;--ink:#e9eae2;--ink-muted:#adb2a4;--sage-dark:#a4b487;--heading:#eef1e8;--heading-strong:#f3f5ee;--header-bg:rgba(23,27,23,.82)}
*,*:before,*:after{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font-family:var(--f-body);font-size:17px;line-height:1.7;-webkit-font-smoothing:antialiased}a{color:inherit;text-decoration:none}.container{width:100%;margin-inline:auto;padding-inline:22px}.site-header{position:sticky;top:0;z-index:60;background:var(--header-bg)}.header-inner{display:flex;align-items:center;justify-content:space-between;height:86px}.nav-links,.header-cta .btn,.mobile-nav{display:none}.logo{display:inline-flex;align-items:center;gap:13px}.logo .mark{width:46px;height:46px;flex:none;background:url(/logo-mark-128.webp) center/contain no-repeat}[data-theme=dark] .logo .mark{background-image:url(/logo-mark-dark-128.webp)}.logo .word{display:flex;flex-direction:column;line-height:1}.logo .word .name{font-family:var(--f-serif);font-weight:600;font-size:25px;letter-spacing:.14em;color:var(--heading);white-space:nowrap}.logo .word .sub{font-family:var(--f-display);font-weight:600;font-size:9.5px;letter-spacing:.42em;text-transform:uppercase;color:var(--sage-dark);margin-top:4px}.menu-toggle,.theme-toggle{width:44px;height:44px;border:0;background:transparent;color:var(--heading)}
.hero{padding:72px 0 0;overflow:hidden}.hero-grid{display:grid;grid-template-columns:1fr;gap:40px}.hero-copy{max-width:560px}.eyebrow{display:inline-flex;font-family:var(--f-display);font-weight:600;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--sage-dark);margin:0 0 22px}.hero h1{font-family:var(--f-serif);font-weight:500;font-size:clamp(2.7rem,5vw,4.1rem);line-height:1.06;letter-spacing:-.015em;margin:0;color:var(--heading-strong)}.hero h1 em{font-style:italic;color:var(--sage-dark)}.hero .rule{width:64px;height:2px;background:var(--sage);margin:28px 0}.hero p.sub{font-size:1rem;line-height:1.5;color:var(--ink-muted);margin:0}.hero p.sub strong{color:var(--ink);font-weight:600}.hero-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:34px}.btn{display:inline-flex;align-items:center;gap:10px;font-family:var(--f-display);font-weight:700;font-size:14px;letter-spacing:.04em;padding:15px 28px;border-radius:999px;border:1.5px solid transparent}.btn-primary{background:#5f7044;color:#fff}.btn-ghost-dark{color:var(--heading);border-color:rgba(46,70,54,.32)}.hero-media{display:none}.warum-photo{position:relative;aspect-ratio:4/4.2;overflow:hidden}.warum-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0}.warum-photo img.is-active{opacity:1}.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}.field input,.field textarea{min-height:48px}.footer-col a,.footer-bottom .legal a,.footer-bottom .legal button{display:inline-flex;align-items:center;min-height:48px}.footer-col ul{gap:0}.footer-bottom .legal{gap:18px}
`;

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
        const delayedLoads = [];

        for (const [fileName] of cssAssets) {
          const href = `/${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`;
          const stylesheetLink = new RegExp(
            `<link(?=[^>]*rel="stylesheet")(?=[^>]*href="${href}")[^>]*>`,
            'g'
          );
          html = html.replace(stylesheetLink, () => {
            if (cssInjected) return '';
            cssInjected = true;
            return criticalStyleTag;
          });
          delayedLoads.push(
            `var css=document.createElement('link');css.rel='stylesheet';css.href='/${fileName}';document.head.appendChild(css);`
          );
        }

        for (const [fileName] of entryChunks) {
          const src = `/${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`;
          const entryScript = new RegExp(
            `<script(?=[^>]*type="module")(?=[^>]*src="${src}")[^>]*></script>`,
            'g'
          );
          html = html.replace(entryScript, '');
          delayedLoads.push(`import('/${fileName}');`);
        }

        if (!cssInjected) html = html.replace('</head>', `${criticalStyleTag}</head>`);
        if (delayedLoads.length) {
          const loadCode = delayedLoads.join('');
          html = html.replace(
            '</body>',
            `<script>(function(){var loaded=false;function load(){if(loaded)return;loaded=true;${loadCode}}['pointerdown','keydown','touchstart','focus'].forEach(function(e){window.addEventListener(e,load,{once:true,passive:true});});window.addEventListener('load',function(){setTimeout(load,6000);},{once:true});})();</script></body>`
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
