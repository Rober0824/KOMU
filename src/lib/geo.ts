// Geografía real de la zona de la demo (Madrid / Alcobendas / San Sebastián de los Reyes).
// Las rutas y el matching son mock, pero las coordenadas son reales para que el mapa
// nunca invente calles ni municipios.
export type Coord = { lat: number; lng: number };
export type Place = Coord & { key: string; name: string; short: string };

export const PLACES: Record<string, Place> = {
  losolivos: { key: 'losolivos', name: 'Residencial Los Olivos', short: 'Los Olivos', lat: 40.543, lng: -3.63 },
  madrid: { key: 'madrid', name: 'Madrid (Centro)', short: 'Madrid', lat: 40.4168, lng: -3.7038 },
  nuevosmin: { key: 'nuevosmin', name: 'Nuevos Ministerios, Madrid', short: 'N. Ministerios', lat: 40.446, lng: -3.6923 },
  chamartin: { key: 'chamartin', name: 'Chamartín, Madrid', short: 'Chamartín', lat: 40.4725, lng: -3.6825 },
  alcobendas: { key: 'alcobendas', name: 'Alcobendas', short: 'Alcobendas', lat: 40.5379, lng: -3.6353 },
  ssreyes: { key: 'ssreyes', name: 'San Sebastián de los Reyes', short: 'S.S. Reyes', lat: 40.548, lng: -3.626 },
  elgoloso: { key: 'elgoloso', name: 'El Goloso', short: 'El Goloso', lat: 40.5236, lng: -3.6987 },
  trescantos: { key: 'trescantos', name: 'Tres Cantos', short: 'Tres Cantos', lat: 40.6006, lng: -3.7086 },
  colegiosj: { key: 'colegiosj', name: 'Colegio San José', short: 'Colegio S. José', lat: 40.5405, lng: -3.6412 },
};

export const MEETING_POINTS = [
  { name: 'Entrada principal de Residencial Los Olivos', lat: 40.5432, lng: -3.6305 },
  { name: 'Rotonda de la Avenida Madrid', lat: 40.539, lng: -3.634 },
  { name: 'Parada de bus de Alcobendas centro', lat: 40.5382, lng: -3.6358 },
  { name: 'Intercambiador de Plaza Castilla', lat: 40.4655, lng: -3.6886 },
];

export const GEO_BOUNDS = { minLat: 40.405, maxLat: 40.615, minLng: -3.72, maxLng: -3.595 };

export const MapProvider = {
  // Abstracción del proveedor de mapa: hoy proyecta coordenadas reales sobre un
  // lienzo SVG; más adelante se puede sustituir por OpenStreetMap + un proveedor
  // de routing gratuito sin tocar el resto de la aplicación.
  project(lat: number, lng: number, w: number, h: number) {
    const x = ((lng - GEO_BOUNDS.minLng) / (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng)) * w;
    const y = h - ((lat - GEO_BOUNDS.minLat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) * h;
    return { x, y };
  },
};

export function haversineKm(a: Coord, b: Coord) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number) {
  const m = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export type RouteResult = { distanceKm: number; durationMin: number; arrivalTime: string | null };

// calculateRoute(origin, destination, departureTime) -> {distance, duration, arrivalTime, route}
// Hoy es una estimación geométrica (haversine + factor de carretera); cuando se conecte
// un proveedor real (OSRM/Google Routes/Mapbox Directions) esta es la única función a sustituir.
export function calculateRoute(origin: Coord, destination: Coord, departureTime?: string): RouteResult {
  const straightKm = haversineKm(origin, destination);
  const roadFactor = 1.35;
  const distanceKm = straightKm * roadFactor;
  const avgSpeedKmh = distanceKm > 12 ? 52 : 30;
  const durationMin = Math.max(4, Math.round((distanceKm / avgSpeedKmh) * 60));
  const arrivalTime = departureTime ? minutesToTime(timeToMinutes(departureTime) + durationMin) : null;
  return { distanceKm: Math.round(distanceKm * 10) / 10, durationMin, arrivalTime };
}

export function dayOverlapScore(passengerDays: string[], driverDays: string[]) {
  if (!passengerDays?.length || !driverDays?.length) return 50;
  const inter = passengerDays.filter((d) => driverDays.includes(d));
  return Math.round((inter.length / passengerDays.length) * 100);
}

export function nearestMeetingPoint(coord: Coord) {
  let best = MEETING_POINTS[0];
  let bestKm = Infinity;
  for (const mp of MEETING_POINTS) {
    const km = haversineKm(coord, mp);
    if (km < bestKm) {
      bestKm = km;
      best = mp;
    }
  }
  return best;
}

export function resolvePlaceKey(text: string): string | null {
  if (!text) return null;
  const norm = text.trim().toLowerCase();
  for (const key of Object.keys(PLACES)) {
    const p = PLACES[key];
    if (p.name.toLowerCase() === norm || p.short.toLowerCase() === norm || key === norm) return key;
  }
  // coincidencia parcial (autocomplete tolerante)
  for (const key of Object.keys(PLACES)) {
    const p = PLACES[key];
    if (p.name.toLowerCase().includes(norm) || norm.includes(p.short.toLowerCase())) return key;
  }
  return null;
}
