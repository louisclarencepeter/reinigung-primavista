import { Building2, Repeat, SquareDashed, SprayCan, Sofa, HardHat } from 'lucide-react';

const SERVICES = [
  {
    Icon: Building2,
    img: 'clean-meeting',
    alt: 'Mitarbeiterin von Prima Vista reinigt einen Besprechungstisch im Büro',
    title: 'Büroreinigung',
    text: 'Regelmäßige, diskrete Reinigung Ihrer Arbeitsplätze, Besprechungsräume und Empfangsbereiche — abgestimmt auf Ihren Betriebsablauf.',
  },
  {
    Icon: Repeat,
    img: 'clean-surface',
    alt: 'Prima Vista Mitarbeiterin bei der regelmäßigen Unterhaltsreinigung von Oberflächen',
    title: 'Unterhaltsreinigung',
    text: 'Tägliche oder wöchentliche Pflege im Wartungsvertrag — gleichbleibende Qualität durch ein festes, geschultes Team.',
  },
  {
    Icon: SquareDashed,
    img: 'clean-glass',
    alt: 'Streifenfreie Reinigung einer Glaswand durch eine Mitarbeiterin von Prima Vista',
    title: 'Glas- & Fensterreinigung',
    text: 'Streifenfreie Fenster, Glasfassaden und Trennwände — für lichtdurchflutete Räume und einen klaren ersten Eindruck.',
  },
  {
    Icon: SprayCan,
    img: 'clean-lobby',
    alt: 'Mitarbeiterin von Prima Vista bei der gründlichen Bodenreinigung im Empfangsbereich',
    title: 'Grundreinigung',
    text: 'Intensive Tiefenreinigung von Böden, Sanitär und schwer zugänglichen Flächen — periodisch oder bei besonderem Bedarf.',
  },
  {
    Icon: Sofa,
    img: 'clean-sofa',
    alt: 'Mitarbeiterin von Prima Vista bei der schonenden Polsterreinigung eines Sofas',
    title: 'Teppich- & Polsterreinigung',
    text: 'Schonende, biologische Reinigung von Teppichen, Stühlen und Polstermöbeln — frische Farben ohne aggressive Chemie.',
  },
  {
    Icon: HardHat,
    img: 'clean-construction',
    alt: 'Mitarbeiterin von Prima Vista bei der Bauschlussreinigung einer Fensterbank',
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
          {SERVICES.map(({ Icon, img, alt, title, text }) => (
            <article className="service-card reveal" key={title}>
              <div className={`service-media${img ? '' : ' service-media--brand'}`}>
                {img && (
                  <picture>
                    <source type="image/webp" srcSet={`/images/${img}.webp`} />
                    <img
                      src={`/images/${img}.jpg`}
                      alt={alt}
                      width="720"
                      height="450"
                      loading="lazy"
                    />
                  </picture>
                )}
              </div>
              <div className="service-body">
                <span className="ic"><Icon /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
