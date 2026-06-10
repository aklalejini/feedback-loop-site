// A small ornamental rule — two fading hairlines meeting at a trio of diamond
// studs. The kind of mark a printer would set between sections; used sparingly
// (page heroes, the footer) so it stays an accent rather than wallpaper.
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`rule-ornament ${className}`} aria-hidden>
      <span className="stud-side" />
      <span className="stud" />
      <span className="stud-side" />
    </div>
  );
}
