const MEASUREMENT_ID = 'G-ZS9VVJJVF5';
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const seenLeadIds = new Set();
let sessionConsent;

// Keep the current choice even when storage is unavailable or a saved choice
// could not be replaced. Do not queue events for a later consent grant.
export function setAnalyticsConsent(choice) {
  sessionConsent = { choice, at: Date.now() };
}

function hasAnalyticsConsent() {
  if (typeof window === 'undefined') return false;
  let consent = sessionConsent;
  try {
    const choice = window.localStorage.getItem('primaVistaCookieConsent');
    const at = Number(window.localStorage.getItem('primaVistaCookieConsentAt'));
    // A newer choice in another tab must override this tab's cached choice.
    // On an equal timestamp, prefer a withdrawal over an acceptance.
    if (!consent || at > consent.at || (at === consent.at && choice !== 'accepted')) {
      consent = { choice, at };
      sessionConsent = consent;
    }
  } catch {
    // Retain an explicit in-page choice when storage is unavailable.
  }
  return consent?.choice === 'accepted' && consent.at > 0 && Date.now() - consent.at < CONSENT_MAX_AGE_MS;
}

function sendEvent(name, fields) {
  if (!hasAnalyticsConsent() || !window.__gaLoaded || typeof window.gtag !== 'function') return false;
  try {
    const location = new URL(window.location.href);
    window.gtag('event', name, {
      send_to: MEASUREMENT_ID,
      ...fields,
      // Never copy contact details, clicked URLs, query strings or referrers
      // into these events. Keep only the current page's origin and pathname.
      page_location: location.origin + location.pathname,
      page_referrer: '',
    });
    return true;
  } catch {
    // Analytics must never interrupt a successful inquiry or a contact link.
    return false;
  }
}

export function trackContactLead(result) {
  if (result?.ok !== true || typeof result.id !== 'string' || !result.id.trim()) return false;
  const id = result.id.trim();
  if (seenLeadIds.has(id)) return false;
  // The saved ID is used only in memory for deduplication, never sent to GA4.
  // Remember declined events too, so they cannot be replayed after consent.
  seenLeadIds.add(id);
  return sendEvent('generate_lead', { form_name: 'contact' });
}

export function trackContactClick(method) {
  if (method !== 'phone' && method !== 'whatsapp') return false;
  return sendEvent('contact_click', { contact_method: method });
}
