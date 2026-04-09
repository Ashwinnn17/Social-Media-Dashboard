import { card } from "../theme/styles";

/**
 * HoverCard — wraps any content in a styled card that lifts + glows on hover.
 * @param {string}  glowColor  platform accent colour for the box-shadow glow
 * @param {object}  style      optional extra inline styles to merge on top of `card`
 */
export default function HoverCard({ children, glowColor, style = {}, ...props }) {
  return (
    <div
      className="hover-card"
      style={{
        ...card,
        ...style,
        "--glow": glowColor ? `${glowColor}28` : "transparent",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = glowColor
          ? `0 6px 24px ${glowColor}30, 0 1px 4px rgba(0,0,0,0.5)`
          : "0 4px 16px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "";
      }}
      {...props}
    >
      {children}
    </div>
  );
}
