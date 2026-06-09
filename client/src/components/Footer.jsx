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
          {/* Social icons removed until real profiles exist — restore from git
              history (Footer.jsx) when the accounts are set up */}
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
