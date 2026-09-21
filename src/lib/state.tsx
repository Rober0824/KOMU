'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Community, COMMUNITIES, INITIAL_INCOMING_MATCHES, IncomingMatch } from './mockData';

export type PassengerSearch = {
  originKey: string;
  destinationKey: string;
  time: string;
  days: string[];
  flexMin: number;
};

export type Filters = { minScore: number; maxDetour: number; timeFlexMin: number };

export type PublishDraft = {
  originKey: string;
  destinationKey: string;
  time: string;
  seats: number;
  recurring: boolean;
  days: string[];
  costShare: boolean;
};

export type PublishedTrip = PublishDraft & { id: string; distanceKm: number; durationMin: number; arrive: string | null };

type AppState = {
  community: Community | null;
  setCommunity: (c: Community) => void;
  search: PassengerSearch;
  setSearch: (s: Partial<PassengerSearch>) => void;
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  incomingMatches: IncomingMatch[];
  setIncomingMatchStatus: (id: string, status: IncomingMatch['status']) => void;
  addIncomingMatch: (m: IncomingMatch) => void;
  publishDraft: PublishDraft;
  setPublishDraft: (d: Partial<PublishDraft>) => void;
  publishedTrips: PublishedTrip[];
  addPublishedTrip: (t: PublishedTrip) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [community, setCommunity] = useState<Community | null>(COMMUNITIES[0]);
  const [search, setSearchState] = useState<PassengerSearch>({
    originKey: 'losolivos',
    destinationKey: 'madrid',
    time: '08:00',
    days: ['L', 'M', 'X', 'J', 'V'],
    flexMin: 30,
  });
  const [filters, setFiltersState] = useState<Filters>({ minScore: 50, maxDetour: 999, timeFlexMin: 999 });
  const [incomingMatches, setIncomingMatches] = useState<IncomingMatch[]>(INITIAL_INCOMING_MATCHES);
  const [publishDraft, setPublishDraftState] = useState<PublishDraft>({
    originKey: 'losolivos',
    destinationKey: 'madrid',
    time: '07:45',
    seats: 3,
    recurring: true,
    days: ['L', 'M', 'X', 'J', 'V'],
    costShare: false,
  });
  const [publishedTrips, setPublishedTrips] = useState<PublishedTrip[]>([]);

  const setSearch = (s: Partial<PassengerSearch>) => setSearchState((prev) => ({ ...prev, ...s }));
  const setFilters = (f: Partial<Filters>) => setFiltersState((prev) => ({ ...prev, ...f }));
  const setIncomingMatchStatus = (id: string, status: IncomingMatch['status']) =>
    setIncomingMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  const addIncomingMatch = (m: IncomingMatch) => setIncomingMatches((prev) => [m, ...prev]);
  const setPublishDraft = (d: Partial<PublishDraft>) => setPublishDraftState((prev) => ({ ...prev, ...d }));
  const addPublishedTrip = (t: PublishedTrip) => setPublishedTrips((prev) => [t, ...prev]);

  return (
    <AppContext.Provider
      value={{
        community,
        setCommunity,
        search,
        setSearch,
        filters,
        setFilters,
        incomingMatches,
        setIncomingMatchStatus,
        addIncomingMatch,
        publishDraft,
        setPublishDraft,
        publishedTrips,
        addPublishedTrip,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
