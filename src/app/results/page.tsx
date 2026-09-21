'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApp } from '@/lib/state';
import { PLACES } from '@/lib/geo';
import { TRIPS, USERS } from '@/lib/mockData';
import { calculateMatch, MIN_MATCH_SCORE, Trip } from '@/lib/match';
import MapView from '@/components/MapView';
import { PageHeader, Avatar, Stars } from '@/components/ui';
import FiltersSheet from '@/components/FiltersSheet';

export default function ResultsPage() {
  const router = useRouter();
  const { search, filters, setFilters, community } = useApp();
  const [showFilters, setShowFilters] = useState(false);

  const origin = PLACES[search.originKey];
  const destination = PLACES[search.destinationKey];

  const passengerTrip: Trip = {
    id: 'me',
    origin,
    destination,
    time: search.time,
    days: search.days.length ? search.days : ['L', 'M', 'X', 'J', 'V'],
    communityId: community?.id || 'olivos',
  };

  const matches = Object.values(TRIPS)
    .map((t) => ({ trip: t, match: calculateMatch(passengerTrip, t) }))
    .filter((m) => m.match.score >= MIN_MATCH_SCORE)
    .filter((m) => m.match.score >= filters.minScore)
    .filter((m) => m.match.detourMinutes <= filters.maxDetour)
    .filter((m) => m.match.timeDiffMin <= filters.timeFlexMin)
    .sort((a, b) => b.match.score - a.match.score);

  const mapRoutes = [
    { origin, destination, primary: true },
    ...matches.map((m) => ({ origin: m.trip.origin, destination: m.trip.destination, color: 'var(--sun)' })),
  ];

  return (
    <div className="screen wide">
      <PageHeader title="Resultados" sub={`${origin.short} → ${destination.short}`} onBack={() => router.push('/search')} />
      <div className="split-layout" style={{ marginTop: 6 }}>
        <div className="split-map">
          <MapView
            height={230}
            routes={mapRoutes}
            pins={[{ coord: origin, label: 'Tú · ' + origin.short }, { coord: destination, label: destination.short, color: 'var(--coral)' }]}
            legend={[
              { label: 'Tu ruta', color: 'var(--route)' },
              { label: 'Conductores', color: 'var(--sun)' },
            ]}
          />
        </div>
        <div>
          <button className="btn btn-secondary" style={{ marginBottom: 12 }} onClick={() => setShowFilters(true)}>
            Filtros
          </button>
          <div className="chip" style={{ marginBottom: 12 }}>
            ✓ Comunidad verificada · {community?.name}
          </div>
          {matches.length === 0 ? (
            <div className="empty-state">
              <span className="glyph">🔍</span>
              <h3 style={{ margin: 0 }}>No hemos encontrado coincidencias con estos filtros</h3>
              <p>Prueba a ampliar el horario o la desviación aceptada.</p>
              <button className="btn btn-secondary" style={{ maxWidth: 220, margin: '0 auto' }} onClick={() => setFilters({ minScore: 0, maxDetour: 999, timeFlexMin: 999 })}>
                Quitar filtros
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {matches.map(({ trip: t, match: m }) => {
                const d = USERS[t.driverId];
                return (
                  <div key={t.id} className="match-card" onClick={() => router.push(`/trip/${t.id}`)}>
                    <div className="match-top">
                      <Avatar user={d} size={48} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong>{d.name}</strong>
                        <div style={{ fontSize: 12.5 }}>
                          <Stars rating={d.rating} /> {d.rating}
                        </div>
                      </div>
                      <div className="compat-badge">
                        <div className="compat-num">{m.score}%</div>
                        <div className="compat-label">compatible</div>
                      </div>
                    </div>
                    <div className="match-progress">
                      <span style={{ width: `${m.score}%` }} />
                    </div>
                    <div className="match-meta">
                      <div>🏘️ {d.note}</div>
                      <div>
                        🚗 {t.origin.short} → {t.destination.short} · Sale {t.depart}
                      </div>
                      <div>{m.detourMinutes === 0 ? '✓ Sin desviación' : `+${m.detourMinutes} min de desviación`}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="chip">{t.seatsLeft} plazas</span>
                      <span className="chip line">{t.recurrence}</span>
                      <button className="btn btn-secondary btn-sm btn-auto" style={{ marginLeft: 'auto' }} onClick={(e) => { e.stopPropagation(); router.push(`/trip/${t.id}`); }}>
                        Ver trayecto
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {showFilters && (
        <FiltersSheet
          filters={filters}
          onClose={() => setShowFilters(false)}
          onApply={(f) => {
            setFilters(f);
            setShowFilters(false);
          }}
        />
      )}
    </div>
  );
}
