import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-col footer-about">
          <Logo onDark />
          <p>
            Professionelle, natürliche und zuverlässige Reinigung für Büros und Unternehmen — mit
            biologischen Produkten und persönlicher Betreuung.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V5.5h-3c-2.2 0-3.5 1.4-3.5 3.6V11H8v3.5h2.5V22H14v-7.5h2.6L17 11h-3V9.4c0-.3.3-.4.6-.4z"/></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.4 8.5h3.1V21H3.4V8.5zM9.3 8.5h2.97v1.7h.04c.41-.78 1.42-1.6 2.93-1.6 3.13 0 3.71 2.06 3.71 4.74V21h-3.1v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9.3V8.5z"/></svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h5>Navigation</h5>
          <ul>
            <li><a href="#top">Start</a></li>
            <li><a href="#leistungen">Leistungen</a></li>
            <li><a href="#warum">Warum wir</a></li>
            <li><a href="#ueber-uns">Über uns</a></li>
            <li><a href="#kontakt">Kontakt</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Leistungen</h5>
          <ul>
            <li><a href="#leistungen">Büroreinigung</a></li>
            <li><a href="#leistungen">Unterhaltsreinigung</a></li>
            <li><a href="#leistungen">Glas- &amp; Fensterreinigung</a></li>
            <li><a href="#leistungen">Grundreinigung</a></li>
            <li><a href="#leistungen">Sonderreinigung</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Kontakt</h5>
          <ul>
            <li>+49 (0) 69 1234 5678</li>
            <li><a href="mailto:info@primavista-reinigung.de">info@primavista-reinigung.de</a></li>
            <li>Frankfurt am Main (DE)</li>
            <li>Emmenbrücke (CH)</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <div>© 2026 Prima Vista Bio Reinigung. Alle Rechte vorbehalten.</div>
        <div className="legal">
          <a href="#">Impressum</a>
          <a href="#">Datenschutz</a>
          <a href="#">AGB</a>
        </div>
      </div>
    </footer>
  );
}
