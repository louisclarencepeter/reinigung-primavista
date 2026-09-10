import { useEffect, useState } from 'react';

const CONSENT_KEY = 'primaVistaCookieConsent';
const CONSENT_AT_KEY = 'primaVistaCookieConsentAt';
// Re-ask after 12 months — consent shouldn't be indefinite. The GA loader in
// index.html applies the same window, so an expired acceptance never loads GA.
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

function getStoredConsent() {
  let consent = window.__pvCookieConsent;
  try {
    const choice = localStorage.getItem(CONSENT_KEY);
    const at = Number(localStorage.getItem(CONSENT_AT_KEY));
    if (!consent || at > consent.at || (at === consent.at && choice !== 'accepted')) {
      consent = { choice, at };
    }
  } catch {
    // A pre-hydration choice still applies when storage is blocked.
  }
  // Entries without a timestamp (saved before expiry existed) also re-ask.
  if (!consent?.at || Date.now() - consent.at > CONSENT_MAX_AGE_MS) return null;
  return consent.choice;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const syncConsent = () => {
      const choice = getStoredConsent();
      setVisible(!choice);
    };
    syncConsent();
    const openSettings = () => setVisible(true);
    window.addEventListener('pv-cookie-consent', syncConsent);
    window.addEventListener('open-cookie-consent', openSettings);
    return () => {
      window.removeEventListener('pv-cookie-consent', syncConsent);
      window.removeEventListener('open-cookie-consent', openSettings);
    };
  }, []);

  const choose = (choice) => {
    window.applyCookieConsent(choice);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-desc">
      <div>
        <p className="cookie-kicker">Datenschutz</p>
        <h2 id="cookie-title">Cookie-Einstellungen</h2>
        <p id="cookie-desc">
          Wir nutzen Google Analytics, um Besuche statistisch auszuwerten. Analyse-Cookies
          werden nur gesetzt, wenn Sie zustimmen. Details finden Sie in unserer{' '}
          <a href="/datenschutz.html">Datenschutzerklärung</a>.
        </p>
      </div>
      <div className="cookie-actions" aria-label="Cookie-Auswahl">
        <button type="button" className="btn btn-ghost-dark" data-pv-action="declined" onClick={() => choose('declined')}>
          Ablehnen
        </button>
        <button type="button" className="btn btn-primary" data-pv-action="accepted" onClick={() => choose('accepted')}>
          Akzeptieren
        </button>
      </div>
    </div>
  );
}
