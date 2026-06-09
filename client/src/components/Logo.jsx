export default function Logo({ onDark = false }) {
  // The footer logo sits on the pine band in both themes, so its colors are
  // fixed; the header logo follows the active theme via CSS variables.
  const ink = onDark ? '#eef1e8' : 'var(--logo-ink)';
  const leaf1 = onDark ? '#a4b487' : 'var(--logo-leaf1)';
  const leaf2 = onDark ? '#8a9a6b' : 'var(--logo-leaf2)';
  return (
    <a href="#top" className={onDark ? 'logo on-dark' : 'logo'} aria-label="Prima Vista Bio Reinigung — Startseite">
      <svg className="mark" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M18 50 L18 84 L82 84 L82 50 C82 31 68 17 50 17 C32 17 18 31 18 50 Z" style={{ stroke: ink }} strokeWidth="5.5" strokeLinejoin="round" />
        <rect x="37" y="40" width="8" height="37" rx="3" style={{ fill: ink }} />
        <circle cx="53" cy="51" r="12.5" style={{ stroke: ink }} strokeWidth="6" />
        <circle cx="53" cy="51" r="4.6" style={{ fill: leaf1 }} />
        <g transform="translate(62 24) rotate(-22)">
          <path d="M0 0 C 6 -9 19 -9 25 0 C 19 9 6 9 0 0 Z" style={{ fill: leaf1 }} />
        </g>
        <g transform="translate(70 35) rotate(16)">
          <path d="M0 0 C 5 -7 16 -7 21 0 C 16 7 5 7 0 0 Z" style={{ fill: leaf2 }} />
        </g>
      </svg>
      <span className="word">
        <span className="name">Prima Vista</span>
        <span className="sub">Bio Reinigung</span>
      </span>
    </a>
  );
}
