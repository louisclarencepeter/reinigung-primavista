import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
              className="menu-toggle"
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

      <nav id="mobile-nav" className={open ? 'mobile-nav open' : 'mobile-nav'} aria-label="Mobile Navigation">
        {LINKS.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
        ))}
        <a href="#kontakt" className="btn btn-primary" onClick={() => setOpen(false)}>
          Angebot anfordern <span className="arrow">›</span>
        </a>
      </nav>
    </>
  );
}
