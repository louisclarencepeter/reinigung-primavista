import { useEffect, useState } from 'react';

const CONSENT_KEY = 'primaVistaCookieConsent';
const CONSENT_AT_KEY = 'primaVistaCookieConsentAt';
// Re-ask after 12 months — consent shouldn't be indefinite. The GA loader in
// index.html applies the same window, so an expired acceptance never loads GA.
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

function getStoredConsent() {
  try {
    const choice = localStorage.getItem(CONSENT_KEY);
    if (!choice) return null;
    // Entries without a timestamp (saved before expiry existed) also re-ask.
    const at = Number(localStorage.getItem(CONSENT_AT_KEY));
    if (!at || Date.now() - at > CONSENT_MAX_AGE_MS) return null;
    return choice;
  } catch {
    return null;
  }
}

function saveConsent(choice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
    localStorage.setItem(CONSENT_AT_KEY, String(Date.now()));
  } catch {
    /* Consent still applies for this page view. */
  }
}

// gtag.js is only injected after acceptance (see index.html). On a decline it
// is usually not loaded at all; the consent update only matters when the
// visitor revokes a previous acceptance mid-session.
function updateGoogleConsent(choice) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: choice === 'accepted' ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}

// Best-effort removal of GA cookies after a revoked consent. GA may have set
// them on the bare domain or a parent domain, so try each suffix.
function deleteGaCookies() {
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  const parts = window.location.hostname.split('.');
  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0].trim();
    if (name !== '_ga' && !name.startsWith('_ga_')) return;
    document.cookie = `${name}=; ${expire}`;
    for (let i = 0; i < parts.length - 1; i++) {
      document.cookie = `${name}=; ${expire}; domain=.${parts.slice(i).join('.')}`;
    }
  });
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => !getStoredConsent());

  useEffect(() => {
    const openSettings = () => setVisible(true);
    window.addEventListener('open-cookie-consent', openSettings);
    return () => window.removeEventListener('open-cookie-consent', openSettings);
  }, []);

  const choose = (choice) => {
    saveConsent(choice);
    setVisible(false);
    if (choice === 'accepted') {
      if (typeof window.loadGoogleAnalytics === 'function') window.loadGoogleAnalytics();
      updateGoogleConsent(choice); // re-grant if revoked earlier this session
    } else {
      updateGoogleConsent(choice);
      deleteGaCookies();
    }
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-modal="false" aria-labelledby="cookie-title">
      <div>
        <p className="cookie-kicker">Datenschutz</p>
        <h2 id="cookie-title">Cookie-Einstellungen</h2>
        <p>
          Wir nutzen Google Analytics, um Besuche statistisch auszuwerten. Analyse-Cookies
          werden nur gesetzt, wenn Sie zustimmen. Details finden Sie in unserer{' '}
          <a href="/datenschutz.html">Datenschutzerklärung</a>.
        </p>
      </div>
      <div className="cookie-actions" aria-label="Cookie-Auswahl">
        <button type="button" className="btn btn-ghost-dark" onClick={() => choose('declined')}>
          Ablehnen
        </button>
        <button type="button" className="btn btn-primary" onClick={() => choose('accepted')}>
          Akzeptieren
        </button>
      </div>
    </div>
  );
}
