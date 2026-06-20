import Logo from './Logo.jsx';

export default function Footer() {
  const openCookieSettings = () => {
    window.dispatchEvent(new Event('open-cookie-consent'));
  };

  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-col footer-about">
          <Logo onDark />
          <p>
            Professionelle, natürliche und zuverlässige Reinigung für Büros und Unternehmen — mit
            biologischen Produkten und persönlicher Betreuung.
          </p>
          {/* Social icons removed until real profiles exist — restore from git
              history (Footer.jsx) when the accounts are set up */}
        </div>

        <div className="footer-col">
          <h2>Navigation</h2>
          <ul>
            <li><a href="#top">Start</a></li>
            <li><a href="#leistungen">Leistungen</a></li>
            <li><a href="#warum">Warum wir</a></li>
            <li><a href="#ueber-uns">Über uns</a></li>
            <li><a href="#kontakt">Kontakt</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h2>Leistungen</h2>
          <ul>
            <li><a href="#leistungen">Büroreinigung</a></li>
            <li><a href="#leistungen">Unterhaltsreinigung</a></li>
            <li><a href="#leistungen">Glas- &amp; Fensterreinigung</a></li>
            <li><a href="#leistungen">Grundreinigung</a></li>
            <li><a href="#leistungen">Sonderreinigung</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h2>Kontakt</h2>
          <ul>
            <li><a href="tel:+4915789818308">+49 1578 98 18 308</a></li>
            <li><a href="mailto:info@reinigung-primavista.com">info@reinigung-primavista.com</a></li>
            <li>Gref-Völsing-Straße 13<br />60314 Frankfurt am Main<br />Deutschland</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <div>© 2026 Prima Vista Bio Reinigung. Alle Rechte vorbehalten.</div>
        <div className="legal">
          <a href="/impressum.html">Impressum</a>
          <a href="/datenschutz.html">Datenschutz</a>
          <button type="button" onClick={openCookieSettings}>Cookie-Einstellungen</button>
        </div>
      </div>
    </footer>
  );
}
