import { Place, clamp, haversineKm, timeToMinutes, dayOverlapScore, nearestMeetingPoint } from './geo';

export type Trip = {
  id: string;
  origin: Place;
  destination: Place;
  time: string; // hora de salida, 'HH:MM'
  days: string[];
  communityId: string;
};

export type MatchResult = {
  score: number;
  originScore: number;
  destinationScore: number;
  timeScore: number;
  routeScore: number;
  recurrenceScore: number;
  communityScore: number;
  detourMinutes: number;
  suggestedMeetingPoint: { name: string; lat: number; lng: number };
  reasons: string[];
  timeDiffMin: number;
};

export const MATCH_WEIGHTS = { origin: 0.2, destination: 0.25, time: 0.2, route: 0.15, recurrence: 0.1, community: 0.1 };
export const MIN_MATCH_SCORE = 50;

// calculateMatch(passengerTrip, driverTrip) -> score + desglose por criterio.
// La fórmula es configurable (MATCH_WEIGHTS) y explicable: cada score parcial
// se puede mostrar al usuario para que entienda por qué obtuvo ese porcentaje.
export function calculateMatch(passengerTrip: Trip, driverTrip: Trip): MatchResult {
  const originKm = haversineKm(passengerTrip.origin, driverTrip.origin);
  const destKm = haversineKm(passengerTrip.destination, driverTrip.destination);
  const originScore = clamp(100 - originKm * 22, 0, 100);
  const destinationScore = clamp(100 - destKm * 7, 0, 100);
  const timeDiffMin = Math.abs(timeToMinutes(passengerTrip.time) - timeToMinutes(driverTrip.time));
  const timeScore = clamp(100 - timeDiffMin * 1.3, 0, 100);
  const routeScore = clamp((originScore + destinationScore) / 2, 0, 100);
  const recurrenceScore = dayOverlapScore(passengerTrip.days, driverTrip.days);
  const communityScore = passengerTrip.communityId === driverTrip.communityId ? 100 : 40;
  const w = MATCH_WEIGHTS;
  const score = Math.round(
    originScore * w.origin +
      destinationScore * w.destination +
      timeScore * w.time +
      routeScore * w.route +
      recurrenceScore * w.recurrence +
      communityScore * w.community
  );
  const detourMinutes = Math.max(0, Math.round((originKm / 28) * 60));
  const suggestedMeetingPoint = nearestMeetingPoint(passengerTrip.origin);

  const reasons: string[] = [];
  if (originScore >= 88) reasons.push('Salís de la misma zona');
  else if (originScore >= 65) reasons.push('Vuestros orígenes están cerca');
  if (destinationScore >= 92) reasons.push('Vais a un destino prácticamente idéntico');
  else if (destinationScore >= 70) reasons.push('Vuestro destino es muy cercano');
  if (timeScore >= 85) reasons.push(`Solo hay ${timeDiffMin} min de diferencia de horario`);
  else if (timeScore >= 60) reasons.push(`${timeDiffMin} min de diferencia de horario`);
  if (recurrenceScore >= 80) reasons.push('Hacéis el trayecto los mismos días');
  if (communityScore >= 90) reasons.push('Misma comunidad verificada');

  return {
    score,
    originScore: Math.round(originScore),
    destinationScore: Math.round(destinationScore),
    timeScore: Math.round(timeScore),
    routeScore: Math.round(routeScore),
    recurrenceScore: Math.round(recurrenceScore),
    communityScore: Math.round(communityScore),
    detourMinutes,
    suggestedMeetingPoint,
    reasons,
    timeDiffMin,
  };
}

export function matchLabel(score: number) {
  if (score >= 90) return 'Excelente coincidencia';
  if (score >= 75) return 'Muy buena coincidencia';
  if (score >= 55) return 'Coincidencia posible';
  return 'Coincidencia baja';
}
