import { useEffect, useState } from 'react';

const CONSENT_KEY = 'primaVistaCookieConsent';

const consentState = (choice) => ({
  analytics_storage: choice === 'accepted' ? 'granted' : 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
});

function getStoredConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function saveConsent(choice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* Consent still applies for this page view. */
  }
}

function updateGoogleConsent(choice) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', consentState(choice));
}

function sendAcceptedPageView() {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}`,
  });
}

export default function CookieConsent() {
  const [choice, setChoice] = useState(() => getStoredConsent());
  const [visible, setVisible] = useState(() => !getStoredConsent());

  useEffect(() => {
    if (choice === 'accepted' || choice === 'declined') {
      updateGoogleConsent(choice);
    }
  }, [choice]);

  useEffect(() => {
    const openSettings = () => setVisible(true);
    window.addEventListener('open-cookie-consent', openSettings);
    return () => window.removeEventListener('open-cookie-consent', openSettings);
  }, []);

  const choose = (nextChoice) => {
    saveConsent(nextChoice);
    setChoice(nextChoice);
    setVisible(false);
    updateGoogleConsent(nextChoice);
    if (nextChoice === 'accepted') {
      sendAcceptedPageView();
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
          werden nur gesetzt, wenn Sie zustimmen.
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
