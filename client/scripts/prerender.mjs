import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(__dirname, '..');
const distIndexPath = path.join(clientRoot, 'dist', 'index.html');

const vite = await createServer({
  root: clientRoot,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
});

try {
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
  const appHtml = renderToString(React.createElement(App));
  const html = await fs.readFile(distIndexPath, 'utf8');

  if (!html.includes('<div id="root"></div>')) {
    throw new Error('Could not find empty #root placeholder in dist/index.html');
  }

  await fs.writeFile(
    distIndexPath,
    html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
  );
} finally {
  await vite.close();
}
