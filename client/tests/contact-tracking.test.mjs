import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, test } from 'node:test';
import vm from 'node:vm';
import { transformWithEsbuild } from 'vite';

const compiled = new Map();
const validValues = {
  name: 'Private Name', phone: '+49123456789', email: 'private@example.test',
  message: 'Private inquiry text', website: '',
};
let moduleNumber = 0;
let analytics;
let calls;
let storage;

beforeEach(async () => {
  calls = [];
  storage = new Map([
    ['primaVistaCookieConsent', 'accepted'],
    ['primaVistaCookieConsentAt', String(Date.now())],
  ]);
  globalThis.window = {
    __gaLoaded: true,
    location: new URL('https://reinigung-primavista.com/?email=private%40example.test#private'),
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    gtag: (...args) => calls.push(args),
    loadGoogleAnalytics: () => { window.__gaLoaded = true; },
  };
  analytics = await import(`../src/lib/analytics.js?handler-test=${++moduleNumber}`);
});

afterEach(() => { delete globalThis.window; });

// Exercise the actual JSX handlers without a browser, network, new test
// dependency or mounted React effects. Vite is already a project dependency.
async function renderHandlers(component, { values, fetchImpl } = {}) {
  if (!compiled.has(component)) {
    const filename = new URL(`../src/components/${component}.jsx`, import.meta.url);
    const source = await readFile(filename, 'utf8');
    const result = await transformWithEsbuild(source, filename.pathname, { jsx: 'automatic', format: 'cjs' });
    compiled.set(component, result.code);
  }
  const states = [];
  const focused = [];
  const requests = [];
  const hooks = {
    useState: (initial) => {
      const index = states.length;
      states.push(index === 0 && values ? values : typeof initial === 'function' ? initial() : initial);
      return [states[index], (next) => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
    },
    useRef: (initial) => ({ current: initial }),
    useEffect: () => {},
  };
  const jsx = (type, props) => ({ type, props });
  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    window,
    document: {
      body: { classList: { contains: () => false } },
      getElementById: (id) => ({ focus: () => focused.push(id) }),
      cookie: '',
    },
    fetch: async (...args) => {
      requests.push(args);
      return fetchImpl(...args);
    },
    setTimeout: () => 0,
    require: (specifier) => {
      if (specifier === 'react') return hooks;
      if (specifier === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
      if (specifier === 'react-dom') return { flushSync: (callback) => callback() };
      if (specifier === 'lucide-react') return new Proxy({}, { get: (_target, key) => key });
      if (specifier === '../lib/analytics.js') return analytics;
      if (specifier === './Logo.jsx') return { default: () => null };
      throw new Error(`Unexpected component import: ${specifier}`);
    },
  });
  new vm.Script(compiled.get(component), { filename: component }).runInContext(context);
  return { tree: module.exports.default({}), states, focused, requests };
}

function findNodes(node, predicate) {
  if (Array.isArray(node)) return node.flatMap((child) => findNodes(child, predicate));
  if (!node || typeof node !== 'object') return [];
  return [...(predicate(node) ? [node] : []), ...findNodes(node.props?.children, predicate)];
}

const events = () => calls.filter((call) => call[0] === 'event');
const response = (body, status = 201) => ({
  status, ok: status >= 200 && status < 300, json: async () => body,
});
const submit = (harness) => findNodes(harness.tree, (node) => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });

test('actual form handler emits only after a saved-ID backend response', async () => {
  let finish;
  const harness = await renderHandlers('Contact', {
    values: validValues,
    fetchImpl: () => new Promise((resolve) => { finish = resolve; }),
  });
  const pending = submit(harness);
  assert.equal(harness.requests.length, 1);
  assert.deepEqual(events(), []);
  finish(response({ ok: true, id: 'saved-contact-1' }));
  await pending;
  assert.equal(harness.states[2], 'success');
  assert.equal(events().length, 1);
  assert.equal(events()[0][1], 'generate_lead');
  assert.equal(events()[0][2].form_name, 'contact');
  assert.equal(events()[0][2].send_to, 'G-ZS9VVJJVF5');
  for (const privateText of Object.values(validValues).filter(Boolean)) {
    assert.equal(JSON.stringify(events()).includes(privateText), false);
  }
});

test('invalid input neither submits nor records an event', async () => {
  const harness = await renderHandlers('Contact', {
    values: { ...validValues, email: 'invalid' },
    fetchImpl: () => { throw new Error('Must not submit'); },
  });
  await submit(harness);
  assert.equal(harness.requests.length, 0);
  assert.deepEqual(harness.focused, ['email']);
  assert.deepEqual(events(), []);
});

test('fake 201, failed responses, malformed JSON and network errors are never leads', async () => {
  const cases = [
    () => response({ ok: true }),
    () => response({ ok: false, id: 'not-saved' }),
    () => response({ ok: true, id: 'not-saved' }, 400),
    () => response({ ok: true, id: 'not-saved' }, 429),
    () => response({ ok: true, id: 'not-saved' }, 500),
    () => ({ status: 201, ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } }),
    () => { throw new Error('Network failed'); },
  ];
  for (const fetchImpl of cases) {
    const harness = await renderHandlers('Contact', { values: validValues, fetchImpl });
    await submit(harness);
    assert.deepEqual(events(), []);
  }
});

test('malformed HTTP-success JSON drops analytics without changing the success screen', async () => {
  const harness = await renderHandlers('Contact', {
    values: validValues,
    fetchImpl: () => ({ status: 201, ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } }),
  });
  await submit(harness);
  assert.equal(harness.states[2], 'success');
  assert.deepEqual(events(), []);
});

test('concurrent submits are guarded and repeated saved IDs are deduplicated', async () => {
  let finish;
  const harness = await renderHandlers('Contact', {
    values: validValues,
    fetchImpl: () => new Promise((resolve) => { finish = resolve; }),
  });
  const first = submit(harness);
  await submit(harness);
  assert.equal(harness.requests.length, 1);
  finish(response({ ok: true, id: 'same-saved-id' }));
  await first;
  const second = submit(harness);
  finish(response({ ok: true, id: 'same-saved-id' }));
  await second;
  assert.equal(events().length, 1);
});

test('failed requests release the submit guard for a later successful retry', async () => {
  let attempt = 0;
  const harness = await renderHandlers('Contact', {
    values: validValues,
    fetchImpl: () => ++attempt === 1 ? response({}, 500) : response({ ok: true, id: 'retry-saved' }),
  });
  await submit(harness);
  assert.equal(harness.states[2], 'error');
  await submit(harness);
  assert.equal(harness.states[2], 'success');
  assert.equal(harness.requests.length, 2);
  assert.equal(events().length, 1);
});

test('consent revocation while a request is in flight suppresses the resulting lead', async () => {
  let finish;
  const harness = await renderHandlers('Contact', {
    values: validValues,
    fetchImpl: () => new Promise((resolve) => { finish = resolve; }),
  });
  const pending = submit(harness);
  analytics.setAnalyticsConsent('declined');
  finish(response({ ok: true, id: 'saved-after-revoke' }));
  await pending;
  assert.equal(harness.states[2], 'success');
  assert.deepEqual(events(), []);
  analytics.setAnalyticsConsent('accepted');
  assert.deepEqual(events(), []);
});

test('every existing phone link records only contact_click, without changing its destination', async () => {
  for (const component of ['Contact', 'Header', 'Footer']) {
    const harness = await renderHandlers(component);
    const phoneLinks = findNodes(harness.tree, (node) => node.type === 'a' && node.props.href?.startsWith('tel:'));
    assert.equal(phoneLinks.length, 1, component);
    assert.equal(phoneLinks[0].props.href, 'tel:+4915789818308');
    phoneLinks[0].props.onClick();
    assert.equal(findNodes(harness.tree, (node) => node.props?.href?.includes('wa.me')).length, 0);
  }
  assert.deepEqual(events().map((call) => [call[1], call[2].contact_method]), [
    ['contact_click', 'phone'], ['contact_click', 'phone'], ['contact_click', 'phone'],
  ]);
  assert.equal(JSON.stringify(events()).includes('+4915789818308'), false);
});

test('actual consent buttons gate new events immediately and keep ad consent denied', async () => {
  storage.clear();
  // Consent now belongs to the shared, pre-hydration HTML bootstrap. Exercise
  // that real implementation too, rather than substituting a consent mock.
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  window.dataLayer = calls;
  window.dispatchEvent = () => true;
  vm.runInNewContext(bootstrap, {
    window, dataLayer: calls, localStorage: window.localStorage,
    document: { cookie: '' }, Event,
  });
  const harness = await renderHandlers('CookieConsent');
  const buttons = findNodes(harness.tree, (node) => node.type === 'button');
  assert.equal(analytics.trackContactClick('phone'), false);
  buttons.find((button) => button.props.children === 'Akzeptieren').props.onClick();
  assert.equal(analytics.trackContactClick('phone'), true);
  buttons.find((button) => button.props.children === 'Ablehnen').props.onClick();
  assert.equal(analytics.trackContactClick('phone'), false);
  const consentUpdates = calls.filter((call) => call[0] === 'consent');
  assert.equal(consentUpdates.length, 2);
  for (const update of consentUpdates) {
    assert.equal(update[2].ad_storage, 'denied');
    assert.equal(update[2].ad_user_data, 'denied');
    assert.equal(update[2].ad_personalization, 'denied');
  }
  assert.equal(events().length, 1);
});
