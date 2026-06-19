import { Leaf, Sparkles, ShieldCheck, Sprout } from 'lucide-react';

const TRUST = [
  [Leaf, 'Bio-Produkte'],
  [Sparkles, 'Tiefenreinigung'],
  [ShieldCheck, 'Zuverlässig & diskret'],
  [Sprout, 'Umweltfreundlich'],
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Bio Reinigung für Büros &amp; Unternehmen</p>
          <h1>Professionelle, <em>natürliche</em> und zuverlässige Reinigung.</h1>
          <div className="rule"></div>
          <p className="sub">
            Wir reinigen Büros und Gewerbeflächen mit biologischen, ökologischen Produkten — für{' '}
            <strong>gesunde, saubere und repräsentative Räume</strong>, in denen sich Mitarbeiter und
            Kunden wohlfühlen.
          </p>
          <div className="hero-actions">
            <a href="#kontakt" className="btn btn-primary">Angebot anfordern <span className="arrow">›</span></a>
            <a href="#leistungen" className="btn btn-ghost-dark">Unsere Leistungen</a>
          </div>
        </div>

        <div className="hero-media">
          <div className="photo">
            <picture>
              <source
                type="image/webp"
                srcSet="/images/office-tree-640.webp 640w, /images/office-tree-960.webp 960w, /images/office-tree-1280.webp 1280w"
                sizes="(max-width: 1000px) calc(100vw - 44px), 50vw"
              />
              <img
                src="/images/office-tree.jpg"
                alt="Modernes Bürofoyer mit Baum im begrünten Lichthof"
                width="1600"
                height="1143"
                loading="lazy"
                fetchpriority="low"
              />
            </picture>
          </div>
          <div className="hero-badge">
            <span className="leaf"><Leaf /></span>
            <div>
              <div className="t">Ein sauberer Eindruck, jeden Tag.</div>
              <div className="d">Gerne besichtigen wir Ihre Räumlichkeiten und erstellen ein individuelles Angebot.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="trust">
        <div className="container">
          <div className="trust-grid">
            {TRUST.map(([Icon, label]) => (
              <div className="trust-item reveal" key={label}>
                <span className="icon-circle"><Icon /></span>
                <span className="label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
