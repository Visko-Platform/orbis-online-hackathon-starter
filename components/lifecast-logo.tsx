/** Lifecast brand: gradient "live" disc with a play mark + wordmark ("Life" + gradient "cast"). */
export function LifecastMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="lc-mark">
      <defs>
        <linearGradient id="lcg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb347" />
          <stop offset=".5" stopColor="#ff6a3d" />
          <stop offset="1" stopColor="#ff3d77" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="url(#lcg)" />
      <circle cx="16" cy="16" r="11.5" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" />
      <path d="M13.2 10.4v11.2l9.2-5.6z" fill="#fff" />
    </svg>
  );
}

export function LifecastLogo({ size = 28, live = false, tagline }: { size?: number; live?: boolean; tagline?: string }) {
  return (
    <span className="lc-logo" style={{ fontSize: size * 0.82 }}>
      <LifecastMark size={size} />
      <span className="lc-word">
        Life<span className="lc-cast">cast</span>
      </span>
      {live && <span className="lc-live">● LIVE</span>}
      {tagline && <span className="lc-tagline">{tagline}</span>}
    </span>
  );
}
