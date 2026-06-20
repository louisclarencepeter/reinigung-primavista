import { useState, useEffect } from 'react';
import { Leaf, Flower2, Lock } from 'lucide-react';

const PHOTOS = [
  { src: '/images/green-wall.jpg', alt: 'Begrüntes Büro mit lebender Pflanzenwand und nachhaltigem Prima Vista Leitbild' },
  { src: '/images/products.jpg', alt: 'Biologische, ökologisch abbaubare Reinigungsmittel von Prima Vista' },
  { src: '/images/people.jpg', alt: 'Helles, gepflegtes Büro mit gesundem Arbeitsumfeld für Mitarbeiter' },
];

const BENEFITS = [
  {
    Icon: Leaf,
    title: 'Saubere Arbeitsumgebung',
    text: 'Gesunde, hygienische Räume — für das Wohlbefinden von Mitarbeitern und einen guten Eindruck bei Kunden.',
  },
  {
    Icon: Flower2,
    title: 'Natürliche Produkte',
    text: 'Biologische, ökologisch abbaubare Reinigungsmittel — ohne aggressive Chemie und schädliche Dämpfe.',
  },
  {
    Icon: Lock,
    title: 'Professionell & diskret',
    text: 'Geschultes, vertrauenswürdiges Personal und verlässliche Abläufe — Qualität, auf die Sie sich verlassen können.',
  },
];

export default function Why() {
  const [active, setActive] = useState(0);

  // Auto cross-fade through the photos; paused for reduced-motion users.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % PHOTOS.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="warum" className="warum section-pad">
      <div className="container warum-grid">
        <div className="warum-photo reveal reveal-left">
          {PHOTOS.map((photo, i) => (
            <img
              key={photo.src}
              src={photo.src}
              alt={i === active ? photo.alt : ''}
              aria-hidden={i === active ? undefined : true}
              className={i === active ? 'is-active' : undefined}
              width="1200"
              height="800"
              loading="lazy"
            />
          ))}
        </div>
        <div className="reveal reveal-right">
          <p className="eyebrow">Warum Prima Vista</p>
          <h2 className="section-title">Reinigung im Einklang mit <em>Mensch und Natur</em>.</h2>
          <p className="lede" style={{ marginBottom: 14 }}>
            Wir verbinden gründliche Sauberkeit mit ökologischer Verantwortung — gut für Ihre Räume,
            Ihre Mitarbeiter und die Umwelt.
          </p>
          <div className="benefits">
            {BENEFITS.map(({ Icon, title, text }) => (
              <div className="benefit" key={title}>
                <span className="ic"><Icon /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
