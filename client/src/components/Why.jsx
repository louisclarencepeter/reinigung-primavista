import { Leaf, Flower2, Lock } from 'lucide-react';

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
  return (
    <section id="warum" className="warum section-pad">
      <div className="container warum-grid">
        <div className="warum-photo reveal reveal-left">
          <img src="/images/office-open.jpg" alt="Helles, gepflegtes Großraumbüro mit Pflanzen und Glaswänden" loading="lazy" />
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
                  <h4>{title}</h4>
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
