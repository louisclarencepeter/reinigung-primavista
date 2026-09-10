import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

let moduleNumber = 0;
let calls;
let storage;

async function freshAnalytics() {
  return import(`../src/lib/analytics.js?test=${++moduleNumber}`);
}

beforeEach(() => {
  calls = [];
  storage = new Map();
  globalThis.window = {
    __gaLoaded: true,
    location: new URL('https://reinigung-primavista.com/?email=private%40example.test#private-message'),
    localStorage: { getItem: (key) => storage.get(key) ?? null },
    gtag: (...args) => calls.push(args),
  };
});

afterEach(() => { delete globalThis.window; });

function acceptStoredConsent() {
  storage.set('primaVistaCookieConsent', 'accepted');
  storage.set('primaVistaCookieConsentAt', String(Date.now()));
}

test('absent, declined, expired and unreadable consent do not send events', async () => {
  const analytics = await freshAnalytics();
  assert.equal(analytics.trackContactClick('phone'), false);
  storage.set('primaVistaCookieConsent', 'declined');
  storage.set('primaVistaCookieConsentAt', String(Date.now()));
  assert.equal(analytics.trackContactClick('phone'), false);
  acceptStoredConsent();
  storage.set('primaVistaCookieConsentAt', String(Date.now() - 366 * 24 * 60 * 60 * 1000));
  assert.equal(analytics.trackContactClick('phone'), false);
  window.localStorage.getItem = () => { throw new Error('Storage blocked'); };
  assert.equal(analytics.trackContactClick('phone'), false);
  assert.deepEqual(calls, []);
});

test('saved leads use an explicit GA4 destination and an allowlisted, query-free payload', async () => {
  const analytics = await freshAnalytics();
  acceptStoredConsent();
  assert.equal(analytics.trackContactLead({
    ok: true, id: 'saved-contact-1', name: 'Private Name', email: 'private@example.test',
    phone: '+49123456789', message: 'Private message', address: 'Private address',
  }), true);
  assert.deepEqual(calls, [['event', 'generate_lead', {
    send_to: 'G-ZS9VVJJVF5', form_name: 'contact',
    page_location: 'https://reinigung-primavista.com/', page_referrer: '',
  }]]);
});

test('a saved ID is counted once and is never transmitted', async () => {
  const analytics = await freshAnalytics();
  acceptStoredConsent();
  assert.equal(analytics.trackContactLead({ ok: true, id: 'private-record-id' }), true);
  assert.equal(analytics.trackContactLead({ ok: true, id: 'private-record-id' }), false);
  assert.equal(analytics.trackContactLead({ ok: true, id: 'second-record-id' }), true);
  assert.equal(calls.length, 2);
  assert.equal(JSON.stringify(calls).includes('record-id'), false);
});

test('honeypot, unsuccessful and malformed results cannot become leads', async () => {
  const analytics = await freshAnalytics();
  acceptStoredConsent();
  for (const result of [undefined, null, {}, { ok: true }, { ok: false, id: 'x' },
    { ok: true, id: '' }, { ok: true, id: ' ' }, { ok: true, id: 12 }]) {
    assert.equal(analytics.trackContactLead(result), false);
  }
  assert.deepEqual(calls, []);
});

test('consent revocation applies immediately, including when storage still says accepted', async () => {
  const analytics = await freshAnalytics();
  acceptStoredConsent();
  assert.equal(analytics.trackContactClick('phone'), true);
  analytics.setAnalyticsConsent('declined');
  assert.equal(analytics.trackContactClick('phone'), false);
  assert.equal(analytics.trackContactLead({ ok: true, id: 'revoked-lead' }), false);
  analytics.setAnalyticsConsent('accepted');
  assert.equal(analytics.trackContactLead({ ok: true, id: 'revoked-lead' }), false);
  assert.equal(analytics.trackContactClick('phone'), true);
  assert.equal(calls.length, 2);
});

test('a newer withdrawal in another tab overrides in-page acceptance', async () => {
  const analytics = await freshAnalytics();
  analytics.setAnalyticsConsent('accepted');
  storage.set('primaVistaCookieConsent', 'declined');
  storage.set('primaVistaCookieConsentAt', String(Date.now() + 1));
  assert.equal(analytics.trackContactClick('phone'), false);
  assert.equal(analytics.trackContactLead({ ok: true, id: 'cross-tab-revoked' }), false);
  assert.deepEqual(calls, []);
});

test('pre-hydration choices retain their timestamps and survive blocked storage', async () => {
  const analytics = await freshAnalytics();
  window.__pvCookieConsent = { choice: 'accepted', at: Date.now() - 1000 };
  storage.set('primaVistaCookieConsent', 'declined');
  storage.set('primaVistaCookieConsentAt', String(Date.now()));
  assert.equal(analytics.trackContactClick('phone'), false);
  window.__pvCookieConsent = { choice: 'declined', at: Date.now() };
  window.localStorage.getItem = () => { throw new Error('Storage blocked'); };
  assert.equal(analytics.trackContactClick('phone'), false);
  assert.deepEqual(calls, []);
});

test('an observed stored withdrawal remains effective if storage later fails', async () => {
  const analytics = await freshAnalytics();
  analytics.setAnalyticsConsent('accepted');
  storage.set('primaVistaCookieConsent', 'declined');
  storage.set('primaVistaCookieConsentAt', String(Date.now() + 1));
  assert.equal(analytics.trackContactClick('phone'), false);
  window.localStorage.getItem = () => { throw new Error('Storage blocked'); };
  assert.equal(analytics.trackContactClick('phone'), false);
  assert.deepEqual(calls, []);
});

test('a stored withdrawal wins when consent timestamps are equal', async (t) => {
  t.mock.method(Date, 'now', () => 1000);
  const analytics = await freshAnalytics();
  analytics.setAnalyticsConsent('accepted');
  storage.set('primaVistaCookieConsent', 'declined');
  storage.set('primaVistaCookieConsentAt', '1000');
  assert.equal(analytics.trackContactClick('phone'), false);
  assert.deepEqual(calls, []);
});

test('events before consent are dropped, not queued or replayed on acceptance', async () => {
  const analytics = await freshAnalytics();
  assert.equal(analytics.trackContactLead({ ok: true, id: 'before-consent' }), false);
  assert.equal(analytics.trackContactClick('phone'), false);
  analytics.setAnalyticsConsent('accepted');
  assert.deepEqual(calls, []);
  assert.equal(analytics.trackContactLead({ ok: true, id: 'before-consent' }), false);
  assert.equal(analytics.trackContactLead({ ok: true, id: 'after-consent' }), true);
  assert.equal(calls.length, 1);
});

test('the current session choice works with blocked storage and remains revocable', async () => {
  const analytics = await freshAnalytics();
  window.localStorage.getItem = () => { throw new Error('Storage blocked'); };
  analytics.setAnalyticsConsent('accepted');
  assert.equal(analytics.trackContactClick('phone'), true);
  analytics.setAnalyticsConsent('declined');
  assert.equal(analytics.trackContactClick('phone'), false);
  assert.equal(calls.length, 1);
});

test('contact clicks stay separate from leads and reject arbitrary methods or URLs', async () => {
  const analytics = await freshAnalytics();
  acceptStoredConsent();
  assert.equal(analytics.trackContactClick('phone'), true);
  assert.equal(analytics.trackContactClick('whatsapp'), true);
  for (const method of ['email', 'tel:+49123456789', 'https://wa.me/49123456789', undefined]) {
    assert.equal(analytics.trackContactClick(method), false);
  }
  assert.deepEqual(calls.map((call) => [call[1], call[2].contact_method]), [
    ['contact_click', 'phone'], ['contact_click', 'whatsapp'],
  ]);
  assert.equal(calls.some((call) => call[2].form_name), false);
});

test('an unavailable loader or failed analytics never throws or queues a lead', async () => {
  const analytics = await freshAnalytics();
  acceptStoredConsent();
  window.__gaLoaded = false;
  assert.equal(analytics.trackContactLead({ ok: true, id: 'not-loaded' }), false);
  window.__gaLoaded = true;
  assert.equal(analytics.trackContactLead({ ok: true, id: 'not-loaded' }), false);
  window.gtag = () => { throw new Error('Analytics unavailable'); };
  assert.doesNotThrow(() => analytics.trackContactClick('phone'));
  delete globalThis.window;
  assert.doesNotThrow(() => analytics.trackContactLead({ ok: true, id: 'server-render' }));
  assert.deepEqual(calls, []);
});
