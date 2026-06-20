import { useEffect, useRef, useState } from 'react';

function CountUp({ end, suffix = '', duration = 1400 }) {
  const ref = useRef(null);
  const started = useRef(false);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setVal(end);
          return;
        }
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(end * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  return <div className="n" ref={ref}>{val}{suffix}</div>;
}

export default function About() {
  return (
    <section id="ueber-uns" className="about section-pad">
      <div className="container about-grid">
        <div className="reveal reveal-left">
          <p className="eyebrow">Über uns</p>
          <h2>Ein Familienbetrieb mit <em>Liebe zum Detail</em>.</h2>
          <p>
            Prima Vista wurde von Daniel und Monica gegründet — mit der Überzeugung, dass
            professionelle Reinigung und ökologische Verantwortung zusammengehören. Was als kleines
            Team begann, ist heute ein verlässlicher Partner für Büros und Unternehmen in Frankfurt
            und Umgebung.
          </p>
          <p>
            Wir setzen ausschließlich auf biologische Produkte, geschultes Personal und persönliche
            Betreuung. Jeder Auftrag ist für uns mehr als Reinigung — er ist ein sauberer Eindruck,
            den Sie täglich Ihren Kunden hinterlassen.
          </p>
          <div className="about-stats">
            <div><CountUp end={10} suffix="+" /><div className="k">Jahre Erfahrung</div></div>
            <div><CountUp end={100} suffix="%" /><div className="k">Bio-Produkte</div></div>
            <div><CountUp end={1} /><div className="k">Standort Frankfurt</div></div>
          </div>
        </div>
        <div className="about-photo reveal reveal-right">
          <img src="/images/team.jpg" alt="Mitarbeiterin von Prima Vista bei der professionellen Büroreinigung" width="1400" height="933" loading="lazy" />
        </div>
      </div>
    </section>
  );
}
