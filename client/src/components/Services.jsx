import { Building2, Repeat, SquareDashed, SprayCan, Sofa, HardHat } from 'lucide-react';

const SERVICES = [
  {
    Icon: Building2,
    title: 'Büroreinigung',
    text: 'Regelmäßige, diskrete Reinigung Ihrer Arbeitsplätze, Besprechungsräume und Empfangsbereiche — abgestimmt auf Ihren Betriebsablauf.',
  },
  {
    Icon: Repeat,
    title: 'Unterhaltsreinigung',
    text: 'Tägliche oder wöchentliche Pflege im Wartungsvertrag — gleichbleibende Qualität durch ein festes, geschultes Team.',
  },
  {
    Icon: SquareDashed,
    title: 'Glas- & Fensterreinigung',
    text: 'Streifenfreie Fenster, Glasfassaden und Trennwände — für lichtdurchflutete Räume und einen klaren ersten Eindruck.',
  },
  {
    Icon: SprayCan,
    title: 'Grundreinigung',
    text: 'Intensive Tiefenreinigung von Böden, Sanitär und schwer zugänglichen Flächen — periodisch oder bei besonderem Bedarf.',
  },
  {
    Icon: Sofa,
    title: 'Teppich- & Polsterreinigung',
    text: 'Schonende, biologische Reinigung von Teppichen, Stühlen und Polstermöbeln — frische Farben ohne aggressive Chemie.',
  },
  {
    Icon: HardHat,
    title: 'Bau- & Sonderreinigung',
    text: 'Bauschlussreinigung, Umzüge und Sonderaufgaben — wir übernehmen, wenn es schnell und gründlich gehen muss.',
  },
];

export default function Services() {
  return (
    <section id="leistungen" className="section-pad">
      <div className="container">
        <div className="section-head is-center reveal">
          <p className="eyebrow is-center">Unsere Leistungen</p>
          <h2 className="section-title">Sauberkeit, die man <em>sieht und spürt</em>.</h2>
          <p className="lede">
            Von der täglichen Unterhaltsreinigung bis zur gründlichen Grundreinigung — wir bieten
            maßgeschneiderte Komplettlösungen für Ihre Geschäftsräume.
          </p>
        </div>

        <div className="services-grid">
          {SERVICES.map(({ Icon, title, text }) => (
            <article className="service-card reveal" key={title}>
              <span className="ic"><Icon /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
