interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  /** Index to emphasise (e.g. current week). Defaults to last. */
  highlightIndex?: number;
}

/**
 * Compact area+line sparkline rendered as inline SVG (no client JS). Uses a
 * gradient fill and an accent node on the highlighted point.
 */
export function Sparkline({
  values,
  width = 220,
  height = 56,
  className,
  highlightIndex,
}: SparklineProps) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pad = 4;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const step = values.length > 1 ? innerW / (values.length - 1) : 0;

  const points = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + innerH - ((v - min) / range) * innerH;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${pad + innerW} ${pad + innerH} L${pad} ${pad + innerH} Z`;

  const hi = highlightIndex ?? values.length - 1;
  const [hx, hy] = points[Math.min(hi, points.length - 1)];
  const gid = `spark-${values.length}-${Math.round(max)}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`} />
      <path
        d={linePath}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={hx} cy={hy} r="3.4" fill="var(--accent-bright)" />
      <circle cx={hx} cy={hy} r="6.5" fill="var(--accent)" opacity="0.18" />
    </svg>
  );
}
