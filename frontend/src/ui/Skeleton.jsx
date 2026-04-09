/** Single shimmer line — use for text placeholders */
export function SkelLine({ width = "100%", height = 12, mb = 8 }) {
  return <div className="skeleton" style={{ width, height, marginBottom: mb }} />;
}

/** Shimmer circle — use for avatar placeholders */
export function SkelCircle({ size = 44 }) {
  return <div className="skeleton" style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0 }} />;
}

/** Shimmer rectangle — use for card / image placeholders */
export function SkelRect({ width = "100%", height = 60, mb = 8 }) {
  return <div className="skeleton" style={{ width, height, marginBottom: mb, borderRadius: 5 }} />;
}
