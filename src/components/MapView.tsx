'use client';
import { Coord, MapProvider } from '@/lib/geo';

type RouteSpec = { origin: Coord; destination: Coord; color?: string; primary?: boolean; dashed?: boolean };
type PinSpec = { coord: Coord; label: string; color?: string };
type MeetingSpec = { coord: Coord; label: string };

function routePathD(p1: { x: number; y: number }, p2: { x: number; y: number }, bend: number) {
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = mx + nx * bend;
  const cy = my + ny * bend;
  return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
}

// El anclaje de cada etiqueta se decide por su posición real en el lienzo
// (no por si es origen/destino), para que nunca quede recortada contra un borde.
function pillTransform(xr: number) {
  if (xr > 0.72) return 'translate(-100%,-50%)';
  if (xr < 0.28) return 'translate(0%,-50%)';
  return 'translate(-50%,-50%)';
}

export default function MapView({
  height = 190,
  routes = [],
  pins = [],
  meetingPoint,
  legend,
}: {
  height?: number;
  routes?: RouteSpec[];
  pins?: PinSpec[];
  meetingPoint?: MeetingSpec;
  legend?: { label: string; color: string }[];
}) {
  const w = 400;
  const h = height;
  const proj = (c: Coord) => MapProvider.project(c.lat, c.lng, w, h);
  const bends = [0, 24, -24, 36, -36, 16, -16];

  const seen = new Set<string>();
  const markers: { x: number; y: number; color: string }[] = [];
  routes.forEach((r) => {
    [
      { c: r.origin, color: 'var(--pine)' },
      { c: r.destination, color: 'var(--coral)' },
    ].forEach((m) => {
      const key = `${m.c.lat},${m.c.lng}`;
      if (seen.has(key)) return;
      seen.add(key);
      const p = proj(m.c);
      markers.push({ x: p.x, y: p.y, color: m.color });
    });
  });

  return (
    <div className="map-mock" style={{ height }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {routes.map((r, i) => {
          const p1 = proj(r.origin);
          const p2 = proj(r.destination);
          const d = routePathD(p1, p2, bends[i % bends.length]);
          const color = r.color || 'var(--route)';
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={color} strokeWidth={r.primary ? 4.5 : 3} strokeLinecap="round" strokeDasharray={r.dashed === false ? undefined : '1 9'} opacity={r.primary ? 0.95 : 0.6} />
              <path d={d} fill="none" stroke={color} strokeWidth={1.3} strokeLinecap="round" opacity={0.22} />
            </g>
          );
        })}
        {markers.map((m, i) => (
          <circle key={i} cx={m.x.toFixed(1)} cy={m.y.toFixed(1)} r={6.5} fill={m.color} stroke="white" strokeWidth={2} />
        ))}
      </svg>
      {pins.map((p, i) => {
        const pt = proj(p.coord);
        const xr = pt.x / w;
        return (
          <div key={i} className="map-pill" style={{ left: `${((pt.x / w) * 100).toFixed(1)}%`, top: `${((pt.y / h) * 100).toFixed(1)}%`, transform: pillTransform(xr) }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color || 'var(--pine)', display: 'inline-block', flexShrink: 0 }} />
            {p.label}
          </div>
        );
      })}
      {meetingPoint &&
        (() => {
          const pt = proj(meetingPoint.coord);
          const xr = pt.x / w;
          return (
            <div
              className="map-pill"
              style={{ left: `${((pt.x / w) * 100).toFixed(1)}%`, top: `${((pt.y / h) * 100).toFixed(1)}%`, transform: pillTransform(xr), background: 'var(--sun-tint)', borderColor: 'var(--sun)' }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--sun-strong)', display: 'inline-block', flexShrink: 0 }} />
              📍 {meetingPoint.label}
            </div>
          );
        })()}
      {legend && (
        <div className="map-legend">
          {legend.map((l, i) => (
            <div className="row" key={i}>
              <span className="sw" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
