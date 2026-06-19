export default function Logo({ onDark = false }) {
  // Real brand mark (house/eye/P + leaf) on a cream chip so it stays legible
  // on every surface — the cream blends into the light theme and reads as a
  // badge on the dark header and pine footer. The wordmark text stays live so
  // it still follows the active theme.
  return (
    <a href="#top" className={onDark ? 'logo on-dark' : 'logo'}>
      <span className="mark" aria-hidden="true"></span>
      <span className="word">
        <span className="name">Prima Vista</span>
        <span className="sub">Bio Reinigung</span>
      </span>
    </a>
  );
}
