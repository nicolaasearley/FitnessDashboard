import { decodePolyline, projectRoute } from "@/lib/training/polyline";

/**
 * Minimalist route trace rendered from an encoded polyline — an accent line on
 * a subtle grid, with start/finish nodes. No map-tile provider needed, which
 * keeps it fast, dependency-free and on-brand for the instrument aesthetic.
 */
export function RouteMap({ polyline, className }: { polyline: string; className?: string }) {
  const route = projectRoute(decodePolyline(polyline), 100, 60);
  if (!route) return null;
  const gid = `route-${polyline.length}`;

  return (
    <svg
      viewBox="0 0 100 60"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Route map"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent-deep)" />
          <stop offset="100%" stopColor="var(--accent-bright)" />
        </linearGradient>
        <pattern id={`${gid}-grid`} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" fill="none" stroke="var(--line)" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100" height="60" fill={`url(#${gid}-grid)`} opacity="0.5" />
      {/* Soft glow underlay */}
      <path
        d={route.path}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.18"
      />
      <path
        d={route.path}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={route.start.x} cy={route.start.y} r="2.1" fill="var(--accent-bright)" />
      <circle
        cx={route.end.x}
        cy={route.end.y}
        r="2.1"
        fill="var(--bg)"
        stroke="var(--accent-bright)"
        strokeWidth="1.2"
      />
    </svg>
  );
}
