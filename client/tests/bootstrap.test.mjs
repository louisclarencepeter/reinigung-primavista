import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const consentScript = scripts.find((script) => script.includes('window.applyCookieConsent'));
const interactionScript = scripts.find((script) => script.includes('window.__pvMenuHydrated = false'));
const now = 1_800_000_000_000;

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, listener, capture = false) {
      const list = listeners.get(type) || [];
      list.push({ listener, capture });
      listeners.set(type, list);
    },
    dispatchEvent(event) {
      const list = [...(listeners.get(event.type) || [])].sort((a, b) => Number(b.capture) - Number(a.capture));
      for (const { listener } of list) {
        listener(event);
        if (event.stopped) break;
      }
      return !event.prevented;
    },
  };
}
function classList() {
  const values = new Set();
  return { toggle: (name, active) => active ? values.add(name) : values.delete(name), contains: (name) => values.has(name) };
}
function element(initial = {}) {
  const attributes = new Map(Object.entries(initial));
  return { classList: classList(), getAttribute: (key) => attributes.get(key), setAttribute: (key, value) => attributes.set(key, value) };
}
function environment({ choice, age = 0, storageBlocked = false } = {}) {
  const storage = new Map(choice ? [['primaVistaCookieConsent', choice], ['primaVistaCookieConsentAt', String(now - age)]] : []);
  const cookies = new Map([['_ga', 'synthetic'], ['_ga_TEST', 'synthetic'], ['essential', 'keep']]);
  const requests = [];
  const menu = element({ 'aria-expanded': 'false' });
  const nav = element();
  const document = Object.assign(eventTarget(), {
    head: { appendChild: (node) => requests.push(node.src) },
    createElement: () => ({}),
    body: { classList: classList() },
    querySelector: () => menu,
    getElementById: () => nav,
  });
  Object.defineProperty(document, 'cookie', {
    get: () => [...cookies].map(([key, value]) => `${key}=${value}`).join('; '),
    set: (value) => { const [key, content] = value.split(';')[0].split('='); if (content) cookies.set(key, content); else cookies.delete(key); },
  });
  const localStorage = {
    getItem: (key) => { if (storageBlocked) throw new Error('Storage blocked'); return storage.get(key) ?? null; },
    setItem: (key, value) => { if (storageBlocked) throw new Error('Storage blocked'); storage.set(key, value); },
  };
  const window = Object.assign(eventTarget(), {
    document, localStorage, location: new URL('https://reinigung.example.test/'), Event,
    Date: class extends Date { static now() { return now; } },
  });
  window.window = window;
  const context = vm.createContext(window);
  vm.runInContext(consentScript, context);
  vm.runInContext(interactionScript, context);
  let loadCalls = 0;
  window.__pvLoadApp = () => { loadCalls += 1; };
  function click(action, { native = false, mobileLink = false, menuButton = false } = {}) {
    const button = element({ 'data-pv-action': action });
    const target = { closest: (selector) => {
      if (selector === 'button[data-pv-action]') return native ? null : button;
      if (selector === '#mobile-nav a') return mobileLink ? target : null;
      if (selector === '.menu-toggle') return menuButton ? menu : null;
      return null;
    } };
    const event = { type: 'click', target, prevented: false, stopped: false,
      preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; } };
    document.dispatchEvent(event);
    return event;
  }
  return { window, document, storage, cookies, requests, click, menu, nav, get loadCalls() { return loadCalls; } };
}

test('absent, declined and expired stored choices load no analytics', () => {
  for (const options of [{}, { choice: 'declined' }, { choice: 'accepted', age: 366 * 86400000 }]) {
    assert.deepEqual(environment(options).requests, []);
  }
});

test('a current accepted choice retains the existing single analytics load', () => {
  const page = environment({ choice: 'accepted' });
  assert.equal(page.requests.length, 1);
  page.window.loadGoogleAnalytics();
  assert.equal(page.requests.length, 1);
});

test('early decline revokes accepted storage, disables measurement and removes only GA cookies before app load', () => {
  const page = environment({ choice: 'accepted' });
  const event = page.click('declined');
  assert.equal(event.prevented, true);
  assert.equal(event.stopped, true);
  assert.equal(page.window.__pvAppHydrated, false);
  assert.equal(page.storage.get('primaVistaCookieConsent'), 'declined');
  assert.equal(page.window['ga-disable-G-ZS9VVJJVF5'], true);
  assert.deepEqual([...page.cookies], [['essential', 'keep']]);
  page.window.loadGoogleAnalytics();
  assert.equal(page.requests.length, 1, 'only the already-authorized initial request');
  const update = page.window.dataLayer.at(-1);
  assert.equal(update[0], 'consent');
  assert.equal(update[2].analytics_storage, 'denied');
  for (const key of ['ad_storage', 'ad_user_data', 'ad_personalization']) assert.equal(update[2][key], 'denied');
  assert.equal(page.loadCalls, 1);
});

test('explicit early acceptance works once with previous rejection and keeps advertising denied', () => {
  const page = environment({ choice: 'declined' });
  page.click('accepted');
  assert.equal(page.storage.get('primaVistaCookieConsent'), 'accepted');
  assert.equal(page.window['ga-disable-G-ZS9VVJJVF5'], false);
  page.window.loadGoogleAnalytics();
  assert.equal(page.requests.length, 1);
  const update = page.window.dataLayer.at(-1);
  assert.equal(update[2].analytics_storage, 'granted');
  assert.equal(update[2].ad_storage, 'denied');
});

test('blocked storage preserves an immediate in-page withdrawal and later explicit acceptance', () => {
  const page = environment({ choice: 'accepted', storageBlocked: true });
  page.click('declined');
  assert.equal(page.window.__pvCookieConsent.choice, 'declined');
  assert.equal(page.window['ga-disable-G-ZS9VVJJVF5'], true);
  page.window.loadGoogleAnalytics();
  assert.equal(page.requests.length, 0);
  page.click('accepted');
  assert.equal(page.window.__pvCookieConsent.choice, 'accepted');
  assert.equal(page.requests.length, 1);
});

test('repeated early decisions keep the last choice and cannot restart a withdrawn tag', () => {
  for (const storageBlocked of [false, true]) {
    const page = environment({ choice: 'accepted', storageBlocked });
    for (const choice of ['declined', 'accepted', 'declined']) page.click(choice);
    assert.equal(page.window.__pvCookieConsent.choice, 'declined');
    assert.equal(page.window['ga-disable-G-ZS9VVJJVF5'], true);
    page.window.loadGoogleAnalytics();
    assert.equal(page.requests.length, 1);
    assert.equal(page.window.dataLayer.at(-1)[2].analytics_storage, 'denied');
  }
});

test('only explicit supported actions are handled; pointer and keyboard clicks share one queue', () => {
  const page = environment();
  page.click('theme');
  page.click('cookie-settings');
  assert.deepEqual(Array.from(page.window.__pvDeferredActions), ['theme', 'cookie-settings']);
  assert.equal(page.loadCalls, 2);
  assert.equal(page.click('unknown').prevented, false);
  assert.equal(page.click(undefined, { native: true }).prevented, false);
  assert.equal(page.loadCalls, 2);
  page.window.__pvAppHydrated = true;
  assert.equal(page.click('theme').prevented, false);
  assert.deepEqual(Array.from(page.window.__pvDeferredActions), ['theme', 'cookie-settings']);
});

test('mobile fallback closes after a native link without suppressing navigation or reopening', () => {
  const page = environment();
  page.click(undefined, { native: true, menuButton: true });
  assert.equal(page.menu.getAttribute('aria-expanded'), 'true');
  const link = page.click(undefined, { native: true, mobileLink: true });
  assert.equal(link.prevented, false);
  assert.equal(page.menu.getAttribute('aria-expanded'), 'false');
  assert.equal(page.document.body.classList.contains('mobile-menu-open'), false);
});

test('invalid consent cannot grant tracking or overwrite an existing decision', () => {
  const page = environment({ choice: 'declined' });
  page.window.applyCookieConsent('yes');
  assert.equal(page.storage.get('primaVistaCookieConsent'), 'declined');
  assert.deepEqual(page.requests, []);
});
