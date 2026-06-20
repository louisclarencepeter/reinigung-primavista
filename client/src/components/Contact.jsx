import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';

const validators = {
  name: (v) => v.trim().length > 1,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  message: (v) => v.trim().length > 4,
};

const ERRORS = {
  name: 'Bitte geben Sie Ihren Namen an.',
  email: 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
  message: 'Bitte hinterlassen Sie uns eine kurze Nachricht.',
};

const EMPTY = { name: '', phone: '', email: '', message: '', website: '' };

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [invalid, setInvalid] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error | rate-limited

  const set = (field) => (e) => {
    setValues({ ...values, [field]: e.target.value });
    setInvalid({ ...invalid, [field]: false });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const bad = {};
    Object.keys(validators).forEach((f) => {
      if (!validators[f](values[f])) bad[f] = true;
    });
    // Flush the invalid state before moving focus, so aria-invalid /
    // aria-describedby are already on the field when AT announces it.
    flushSync(() => setInvalid(bad));
    const badFields = Object.keys(bad);
    if (badFields.length) {
      document.getElementById(badFields[0])?.focus();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.status === 429) {
        setStatus('rate-limited');
        return;
      }
      if (!res.ok) throw new Error('Request failed');
      setValues(EMPTY);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
    }
  };

  const fieldClass = (f) => (invalid[f] ? 'field invalid' : 'field');

  return (
    <section id="kontakt" className="section-pad">
      <div className="container contact-grid">
        <div className="contact-info reveal reveal-left">
          <p className="eyebrow">Kontakt</p>
          <h2 className="section-title">Ein sauberer Eindruck, <em>jeden Tag</em>.</h2>
          <p className="lede">
            Gerne besichtigen wir Ihre Räumlichkeiten und erstellen ein unverbindliches,
            individuelles Angebot.
          </p>

          <div style={{ marginTop: 32 }}>
            <div className="contact-detail">
              <span className="ic"><Phone /></span>
              <div><div className="k">Telefon</div><div className="v"><a href="tel:+4915789818308">+49 1578 98 18 308</a></div></div>
            </div>
            <div className="contact-detail">
              <span className="ic"><Mail /></span>
              <div><div className="k">E-Mail</div><div className="v"><a href="mailto:info@reinigung-primavista.com">info@reinigung-primavista.com</a></div></div>
            </div>
            <div className="contact-detail">
              <span className="ic"><MapPin /></span>
              <div><div className="k">Adresse</div><div className="v">Gref-Völsing-Straße 13<br />60314 Frankfurt am Main<br />Deutschland</div></div>
            </div>
          </div>

          <div className="contact-note">Wir freuen uns auf Sie!</div>
        </div>

        <form className="contact-form reveal reveal-right" onSubmit={onSubmit} noValidate>
          {/* Honeypot — hidden from real users, bots fill it. Deliberately NOT
              named like an address-profile field (company, fax, …): browser
              autofill ignores autocomplete="off" and would fill those for real
              users, silently swallowing their inquiry. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="website">Website (bitte leer lassen)</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={set('website')}
            />
          </div>
          <div className="form-row">
            <div className={fieldClass('name')}>
              <label htmlFor="name">Name</label>
              {/* maxLength mirrors the server-side schema limits, so an
                  over-long value can't pass client validation and then bounce
                  with a generic server error */}
              <input type="text" id="name" name="name" placeholder="Ihr Name" required maxLength={120} aria-invalid={invalid.name ? 'true' : undefined} aria-describedby={invalid.name ? 'name-err' : undefined} value={values.name} onChange={set('name')} />
              <span className="err" id="name-err">{ERRORS.name}</span>
            </div>
            <div className="field">
              <label htmlFor="phone">Telefon</label>
              <input type="tel" id="phone" name="phone" placeholder="Optional" maxLength={40} value={values.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className={fieldClass('email')}>
            <label htmlFor="email">E-Mail</label>
            <input type="email" id="email" name="email" placeholder="ihre@email.de" required maxLength={254} aria-invalid={invalid.email ? 'true' : undefined} aria-describedby={invalid.email ? 'email-err' : undefined} value={values.email} onChange={set('email')} />
            <span className="err" id="email-err">{ERRORS.email}</span>
          </div>
          <div className={fieldClass('message')}>
            <label htmlFor="message">Nachricht</label>
            <textarea id="message" name="message" placeholder="Beschreiben Sie kurz Ihre Räumlichkeiten und Ihren Bedarf …" required maxLength={5000} aria-invalid={invalid.message ? 'true' : undefined} aria-describedby={invalid.message ? 'message-err' : undefined} value={values.message} onChange={set('message')} />
            <span className="err" id="message-err">{ERRORS.message}</span>
          </div>
          <div className="form-submit">
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Wird gesendet …' : <>Anfrage senden <span className="arrow">›</span></>}
            </button>
            <span className={status === 'success' ? 'form-success show' : 'form-success'}>
              <CheckCircle2 /> Vielen Dank! Wir melden uns in Kürze.
            </span>
            {status === 'error' && (
              <span className="form-error" role="alert">
                Leider ist etwas schiefgelaufen. Bitte versuchen Sie es später erneut.
              </span>
            )}
            {status === 'rate-limited' && (
              <span className="form-error" role="alert">
                Zu viele Anfragen. Bitte versuchen Sie es später erneut.
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
