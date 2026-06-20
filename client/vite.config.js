import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const CRITICAL_CSS = String.raw`
:root{--pine:#2e4636;--sage:#8a9a6b;--sage-dark:#6f8052;--sage-cta:#647449;--cream:#f4f1ea;--cream-soft:#faf8f2;--ink:#2b2c27;--ink-muted:#5d6058;--heading:var(--pine);--heading-strong:var(--pine);--header-bg:rgba(244,241,234,.82);--hair-light:rgba(43,44,39,.12);--ghost-border:rgba(46,70,54,.32);--r-md:14px;--r-lg:22px;--r-pill:999px;--container:1200px;--f-serif:Georgia,"Times New Roman",serif;--f-display:"Helvetica Neue",Arial,sans-serif;--f-body:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
[data-theme=dark]{color-scheme:dark;--cream:#171b17;--cream-soft:#1f251f;--ink:#e9eae2;--ink-muted:#adb2a4;--sage-dark:#a4b487;--heading:#eef1e8;--heading-strong:#f3f5ee;--header-bg:rgba(23,27,23,.82);--hair-light:rgba(233,234,226,.14);--ghost-border:rgba(238,241,232,.28)}
*,*:before,*:after{box-sizing:border-box}.skip-link{position:absolute;left:-9999px;top:0}html{scroll-behavior:smooth}body{margin:0;background:var(--cream);color:var(--ink);font-family:var(--f-body);font-size:17px;line-height:1.7;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}img{display:block;max-width:100%}a{color:inherit;text-decoration:none}button{font-family:inherit;cursor:pointer}.container{width:100%;max-width:var(--container);margin-inline:auto;padding-inline:32px}.site-header{position:sticky;top:0;z-index:60;background:var(--header-bg);backdrop-filter:saturate(140%) blur(14px);-webkit-backdrop-filter:saturate(140%) blur(14px);border-bottom:1px solid transparent}.header-inner{display:flex;align-items:center;justify-content:space-between;height:86px;gap:24px}.nav-links,.header-cta .btn,.mobile-nav{display:none}.logo{display:inline-flex;align-items:center;gap:13px}.logo .mark{width:46px;height:46px;flex:none;display:block;background:url(/logo-mark-128.webp) center/contain no-repeat}[data-theme=dark] .logo .mark{background-image:url(/logo-mark-dark-128.webp)}.logo .word{display:flex;flex-direction:column;line-height:1}.logo .word .name{font-family:var(--f-serif);font-weight:600;font-size:25px;letter-spacing:.14em;color:var(--heading);padding-left:2px;white-space:nowrap}.logo .word .sub{font-family:var(--f-display);font-weight:600;font-size:9.5px;letter-spacing:.42em;text-transform:uppercase;color:var(--sage-dark);margin-top:4px;padding-left:4px}.menu-toggle{width:44px;height:44px;border:0;background:transparent;color:var(--heading)}.theme-toggle{width:44px;height:44px;border-radius:50%;border:1.5px solid var(--hair-light);background:transparent;color:var(--heading)}
.hero{position:relative;padding:72px 0 0;overflow:hidden}.hero-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:56px;align-items:center}.hero-copy{max-width:560px;min-width:0}.eyebrow{display:inline-flex;align-items:center;gap:12px;font-family:var(--f-display);font-weight:600;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--sage-dark);margin:0 0 22px}.eyebrow:before{content:"";width:30px;height:2px;background:var(--sage);border-radius:2px}.hero h1{font-family:var(--f-serif);font-weight:500;font-size:clamp(2.7rem,5vw,4.1rem);line-height:1.06;letter-spacing:-.015em;margin:0;color:var(--heading-strong)}.hero h1 em{font-style:italic;color:var(--sage-dark)}.hero .rule{width:64px;height:2px;background:var(--sage);margin:28px 0;border-radius:2px}.hero p.sub{font-size:1.2rem;line-height:1.6;color:var(--ink-muted);margin:0}.hero p.sub strong{color:var(--ink);font-weight:600}.hero-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:34px}.btn{display:inline-flex;align-items:center;gap:10px;font-family:var(--f-display);font-weight:600;font-size:14px;letter-spacing:.04em;padding:15px 28px;border-radius:var(--r-pill);border:1.5px solid transparent}.btn-primary{background:var(--sage-cta);color:#fff}.btn-ghost-dark{color:var(--heading);border-color:var(--ghost-border)}.hero-media{position:relative;width:100%;min-width:0}.hero-media .photo{border-radius:var(--r-lg);overflow:hidden;box-shadow:0 30px 70px -30px rgba(35,52,40,.5);aspect-ratio:4/4.2}.hero-media .photo img{width:100%;height:100%;object-fit:cover}.hero-media .photo picture{display:contents}.hero-badge{position:absolute;left:-34px;bottom:44px;background:var(--cream-soft);border:1px solid var(--hair-light);border-radius:var(--r-md);padding:20px 24px;max-width:260px;box-shadow:0 24px 50px -24px rgba(35,52,40,.4);display:flex;gap:14px;align-items:flex-start}.hero-badge .leaf{color:var(--sage-dark);flex:none;margin-top:2px}.hero-badge .t{font-family:var(--f-serif);font-style:italic;font-size:1.28rem;line-height:1.2;color:var(--heading)}.hero-badge .d{font-size:.82rem;color:var(--ink-muted);margin-top:6px;line-height:1.5}.warum-photo{position:relative;border-radius:var(--r-lg);overflow:hidden;aspect-ratio:4/3.3;box-shadow:0 30px 60px -30px rgba(35,52,40,.45)}.warum-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0}.warum-photo img.is-active{opacity:1}.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}.field input,.field textarea{min-height:48px}.footer-col a,.footer-bottom .legal a,.footer-bottom .legal button{display:inline-flex;align-items:center;min-height:48px}.footer-col ul{gap:0}.footer-bottom .legal{gap:18px}@media(max-width:1000px){.hero-grid{grid-template-columns:1fr;gap:40px}.hero-media{max-width:560px}.hero-badge{left:auto;right:18px}.hero p.sub{font-size:1rem;line-height:1.5}}@media(max-width:720px){.container{padding-inline:22px}.header-inner{gap:12px}.header-cta{gap:8px}.logo{gap:10px}.logo .mark{width:40px;height:40px}.logo .word .name{font-size:22px;letter-spacing:.1em}.logo .word .sub{font-size:8.5px;letter-spacing:.32em}.hero-badge{position:static;margin-top:18px;max-width:none}}@media(max-width:359px){.header-inner{gap:10px}.header-cta{gap:6px}.logo{gap:8px}.logo .mark{width:34px;height:34px}.logo .word .name{font-size:18px;letter-spacing:.04em}.logo .word .sub{font-size:8px;letter-spacing:.28em}}@media(min-width:981px){.nav-links{display:flex;align-items:center;gap:38px;list-style:none;margin:0;padding:0}.header-cta .btn{display:inline-flex}.menu-toggle{display:none}}
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
          delayedScripts.push(`import('/${fileName}');`);
        }

        if (!cssInjected) html = html.replace('</head>', `${criticalStyleTag}</head>`);
        if (delayedScripts.length) {
          const loadCode = delayedScripts.join('');
          html = html.replace(
            '</body>',
            `<script>(function(){var loaded=false;function load(){if(loaded)return;loaded=true;${loadCode}}['pointerdown','keydown','touchstart','focus','wheel','scroll'].forEach(function(e){window.addEventListener(e,load,{once:true,passive:true});});window.addEventListener('load',function(){setTimeout(load,6000);},{once:true});})();</script></body>`
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
