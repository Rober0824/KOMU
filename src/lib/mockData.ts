import { PLACES, calculateRoute, nearestMeetingPoint } from './geo';
import { Trip } from './match';

export type Community = {
  id: string;
  type: string;
  icon: string;
  name: string;
  members: number;
  tripsMonth: number;
  kmMonth: number;
  co2Month: number;
};

export const COMMUNITIES: Community[] = [
  { id: 'olivos', type: 'Urbanización', icon: '🏘️', name: 'Residencial Los Olivos', members: 842, tripsMonth: 124, kmMonth: 1820, co2Month: 320 },
  { id: 'empresademo', type: 'Empresa', icon: '🏢', name: 'Empresa Demo', members: 310, tripsMonth: 58, kmMonth: 940, co2Month: 150 },
  { id: 'villanueva', type: 'Municipio', icon: '🏡', name: 'Villanueva del Río', members: 1290, tripsMonth: 210, kmMonth: 3100, co2Month: 540 },
  { id: 'sanjose', type: 'Colegio', icon: '🏫', name: 'Colegio San José', members: 410, tripsMonth: 76, kmMonth: 640, co2Month: 98 },
];

export type UserProfile = {
  id: string;
  name: string;
  initials: string;
  color: string;
  rating: number;
  trips: number;
  verified: boolean;
  bio?: string;
  note?: string;
  communityId: string;
};

export const USERS: Record<string, UserProfile> = {
  rober: { id: 'rober', name: 'Rober', initials: 'RB', color: '#1F5C4A', rating: 4.9, trips: 32, verified: true, communityId: 'olivos' },
  maria: { id: 'maria', name: 'María García', initials: 'MG', color: '#2E6F9E', rating: 4.9, trips: 48, verified: true, bio: 'Salgo de lunes a viernes a las 07:45 y suelo volver a las 18:00.', note: 'Vecina de Residencial Los Olivos', communityId: 'olivos' },
  carlos: { id: 'carlos', name: 'Carlos López', initials: 'CL', color: '#B9701C', rating: 4.8, trips: 36, verified: true, note: 'También trabaja en Madrid', communityId: 'olivos' },
  ana: { id: 'ana', name: 'Ana Martínez', initials: 'AM', color: '#C1524B', rating: 4.7, trips: 21, verified: true, note: 'Vecina de Residencial Los Olivos', communityId: 'olivos' },
  javier: { id: 'javier', name: 'Javier Ruiz', initials: 'JR', color: '#6C5B9E', rating: 4.6, trips: 14, verified: true, note: 'Vecino de Residencial Los Olivos', communityId: 'olivos' },
  laura: { id: 'laura', name: 'Laura Sánchez', initials: 'LS', color: '#3E8E7E', rating: 4.9, trips: 40, verified: true, note: 'Vecina de Residencial Los Olivos', communityId: 'olivos' },
};

export type DriverTrip = Trip & {
  id: string;
  driverId: string;
  originPlace: string;
  destPlace: string;
  depart: string;
  seats: number;
  seatsLeft: number;
  recurrence: string;
  distanceKm: number;
  durationMin: number;
  arrive: string | null;
  meetingPoint: string;
};

function buildTrip(id: string, driverId: string, originPlace: string, destPlace: string, depart: string, seats: number, days: string[], recurrence: string): DriverTrip {
  const origin = PLACES[originPlace];
  const destination = PLACES[destPlace];
  const r = calculateRoute(origin, destination, depart);
  return {
    id,
    driverId,
    origin,
    destination,
    originPlace,
    destPlace,
    time: depart,
    depart,
    seats,
    seatsLeft: seats,
    days,
    recurrence,
    communityId: USERS[driverId].communityId,
    distanceKm: r.distanceKm,
    durationMin: r.durationMin,
    arrive: r.arrivalTime,
    meetingPoint: nearestMeetingPoint(PLACES.losolivos).name,
  };
}

export const TRIPS: Record<string, DriverTrip> = {
  t1: buildTrip('t1', 'maria', 'losolivos', 'nuevosmin', '07:45', 3, ['L', 'M', 'X', 'J', 'V'], 'Lunes a viernes'),
  t2: buildTrip('t2', 'carlos', 'alcobendas', 'chamartin', '08:10', 2, ['L', 'M', 'X', 'J', 'V'], 'Lunes a viernes'),
  t3: buildTrip('t3', 'laura', 'ssreyes', 'madrid', '08:20', 1, ['M', 'J'], 'Martes y jueves'),
  t4: buildTrip('t4', 'javier', 'elgoloso', 'madrid', '08:30', 2, ['L', 'M', 'X', 'J', 'V'], 'Lunes a viernes'),
};

export const MY_RECURRING_TRIP = (() => {
  const origin = PLACES.losolivos;
  const destination = PLACES.madrid;
  const depart = '08:00';
  const r = calculateRoute(origin, destination, depart);
  return {
    id: 'mine1',
    origin,
    destination,
    depart,
    time: depart,
    arrive: r.arrivalTime,
    distanceKm: r.distanceKm,
    durationMin: r.durationMin,
    recurrence: 'Lunes a viernes',
    days: ['L', 'M', 'X', 'J', 'V'],
    seats: 3,
    status: 'Activo',
    communityId: 'olivos',
  };
})();

export type IncomingMatch = {
  id: string;
  passengerId: string;
  tripId: string;
  passengerTrip: Trip;
  status: 'new' | 'accepted' | 'ignored';
};

export const INITIAL_INCOMING_MATCHES: IncomingMatch[] = [
  {
    id: 'im1',
    passengerId: 'ana',
    tripId: 'mine1',
    passengerTrip: { id: 'ana-trip', origin: PLACES.losolivos, destination: PLACES.madrid, time: '08:00', days: ['L', 'M', 'X', 'J', 'V'], communityId: 'olivos' },
    status: 'new',
  },
];
