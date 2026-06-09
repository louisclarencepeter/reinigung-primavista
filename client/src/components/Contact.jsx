import { useState } from 'react';
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

const EMPTY = { name: '', phone: '', email: '', message: '' };

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [invalid, setInvalid] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

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
    setInvalid(bad);
    if (Object.keys(bad).length) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
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
              <div><div className="k">Telefon</div><div className="v">+49 (0) 69 1234 5678</div></div>
            </div>
            <div className="contact-detail">
              <span className="ic"><Mail /></span>
              <div><div className="k">E-Mail</div><div className="v">info@primavista-reinigung.de</div></div>
            </div>
            <div className="contact-detail">
              <span className="ic"><MapPin /></span>
              <div><div className="k">Standorte</div><div className="v">Frankfurt am Main (DE) &nbsp;·&nbsp; Emmenbrücke (CH)</div></div>
            </div>
          </div>

          <div className="contact-note">Wir freuen uns auf Sie!</div>
        </div>

        <form className="contact-form reveal reveal-right" onSubmit={onSubmit} noValidate>
          <div className="form-row">
            <div className={fieldClass('name')}>
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Ihr Name" required value={values.name} onChange={set('name')} />
              <span className="err">{ERRORS.name}</span>
            </div>
            <div className="field">
              <label htmlFor="phone">Telefon</label>
              <input type="tel" id="phone" name="phone" placeholder="Optional" value={values.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className={fieldClass('email')}>
            <label htmlFor="email">E-Mail</label>
            <input type="email" id="email" name="email" placeholder="ihre@email.de" required value={values.email} onChange={set('email')} />
            <span className="err">{ERRORS.email}</span>
          </div>
          <div className={fieldClass('message')}>
            <label htmlFor="message">Nachricht</label>
            <textarea id="message" name="message" placeholder="Beschreiben Sie kurz Ihre Räumlichkeiten und Ihren Bedarf …" required value={values.message} onChange={set('message')} />
            <span className="err">{ERRORS.message}</span>
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
          </div>
        </form>
      </div>
    </section>
  );
}
