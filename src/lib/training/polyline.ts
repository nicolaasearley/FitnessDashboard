/** Decode a Google/Strava encoded polyline (precision 5) to [lat, lng] pairs. */
export function decodePolyline(encoded: string, precision = 5): [number, number][] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: [number, number][] = [];
  const factor = Math.pow(10, precision);

  while (index < encoded.length) {
    let result = 1;
    let shift = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push([lat / factor, lng / factor]);
  }
  return coordinates;
}

export interface ProjectedRoute {
  /** SVG path data, fitted to [0,width]×[0,height]. */
  path: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  width: number;
  height: number;
}

/**
 * Project decoded lat/lng to an SVG path fitted to a box, preserving aspect
 * (equirectangular with longitude cosine correction). Returns null if there
 * aren't enough points to draw.
 */
export function projectRoute(
  points: [number, number][],
  width = 100,
  height = 64,
  pad = 4,
): ProjectedRoute | null {
  if (points.length < 2) return null;

  const lat0 = (points.reduce((s, p) => s + p[0], 0) / points.length) * (Math.PI / 180);
  const cosLat = Math.cos(lat0);
  const raw = points.map(([la, ln]) => [ln * cosLat, la] as const);

  const xs = raw.map((p) => p[0]);
  const ys = raw.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1e-6;
  const spanY = maxY - minY || 1e-6;

  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const scale = Math.min(innerW / spanX, innerH / spanY);
  const offsetX = pad + (innerW - spanX * scale) / 2;
  const offsetY = pad + (innerH - spanY * scale) / 2;

  const project = ([x, y]: readonly [number, number]) => ({
    x: offsetX + (x - minX) * scale,
    // Flip Y: latitude increases upward, SVG y increases downward.
    y: height - (offsetY + (y - minY) * scale),
  });

  const pts = raw.map(project);
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Round node coordinates so server and client agree exactly (Math.cos differs
  // in the last ULPs between Node and browsers, which trips hydration).
  const round = (p: { x: number; y: number }) => ({
    x: Math.round(p.x * 100) / 100,
    y: Math.round(p.y * 100) / 100,
  });

  return { path, start: round(pts[0]), end: round(pts[pts.length - 1]), width, height };
}
