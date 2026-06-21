import { useEffect, useState } from 'react';
import { ArrowRight, Mail, Moon, Phone, Sun } from 'lucide-react';
import Logo from './Logo.jsx';

const LINKS = [
  ['#top', 'Start'],
  ['#leistungen', 'Leistungen'],
  ['#warum', 'Warum wir'],
  ['#ueber-uns', 'Über uns'],
  ['#kontakt', 'Kontakt'],
];

export default function Header({ onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(() =>
    typeof document !== 'undefined' && document.body.classList.contains('mobile-menu-open')
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.__pvMenuHydrated = true;
    return () => {
      window.__pvMenuHydrated = false;
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', open);
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('mobile-menu-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className={scrolled ? 'site-header is-scrolled' : 'site-header'} id="header">
        <div className="container header-inner">
          <Logo />
          <nav aria-label="Hauptnavigation">
            <ul className="nav-links">
              {LINKS.map(([href, label]) => (
                <li key={href}><a href={href}>{label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="header-cta">
            <button
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-label="Farbschema umschalten"
              title="Farbschema umschalten"
            >
              <Sun className="theme-icon sun-icon" aria-hidden="true" />
              <Moon className="theme-icon moon-icon" aria-hidden="true" />
            </button>
            <a href="#kontakt" className="btn btn-primary">Angebot anfordern <span className="arrow">›</span></a>
            <button
              className={open ? 'menu-toggle is-open' : 'menu-toggle'}
              aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(!open)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <nav
        id="mobile-nav"
        className={open ? 'mobile-nav open' : 'mobile-nav'}
        aria-label="Mobile Navigation"
        aria-hidden={!open}
      >
        <div className="mobile-nav-scroll">
          <div className="mobile-nav-kicker">
            <span>Bio Reinigung</span>
            <span>Frankfurt am Main</span>
          </div>

          <div className="mobile-nav-links">
            {LINKS.map(([href, label], index) => (
              <a className="mobile-nav-link" key={href} href={href} onClick={() => setOpen(false)}>
                <span className="mobile-nav-index">{String(index + 1).padStart(2, '0')}</span>
                <span>{label}</span>
                <ArrowRight aria-hidden="true" />
              </a>
            ))}
          </div>

          <a href="#kontakt" className="mobile-nav-quote btn btn-primary" onClick={() => setOpen(false)}>
            Angebot anfordern <ArrowRight aria-hidden="true" />
          </a>

          <div className="mobile-nav-contact" aria-label="Kontaktinformationen">
            <a href="tel:+4915789818308" onClick={() => setOpen(false)}>
              <span className="mobile-nav-contact-icon"><Phone aria-hidden="true" /></span>
              <span><strong>Telefon</strong><small>+49 1578 98 18 308</small></span>
            </a>
            <a href="mailto:info@reinigung-primavista.com" onClick={() => setOpen(false)}>
              <span className="mobile-nav-contact-icon"><Mail aria-hidden="true" /></span>
              <span><strong>E-Mail</strong><small>info@reinigung-primavista.com</small></span>
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
