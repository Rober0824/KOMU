'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApp } from '@/lib/state';
import { MY_RECURRING_TRIP, TRIPS, USERS } from '@/lib/mockData';
import { calculateMatch, MIN_MATCH_SCORE } from '@/lib/match';
import { PageHeader, Avatar } from '@/components/ui';

type Tab = 'todos' | 'conductor' | 'pasajero';

export default function MatchesPage() {
  const router = useRouter();
  const { incomingMatches, setIncomingMatchStatus } = useApp();
  const [tab, setTab] = useState<Tab>('todos');

  const driverSide = incomingMatches
    .filter((im) => im.status !== 'ignored')
    .map((im) => ({ im, match: calculateMatch(im.passengerTrip, MY_RECURRING_TRIP) }));

  const passengerSide = Object.values(TRIPS)
    .map((t) => ({ trip: t, match: calculateMatch(MY_RECURRING_TRIP, t) }))
    .filter((m) => m.match.score >= MIN_MATCH_SCORE)
    .sort((a, b) => b.match.score - a.match.score);

  const showDriver = tab === 'todos' || tab === 'conductor';
  const showPassenger = tab === 'todos' || tab === 'pasajero';

  return (
    <div className="screen">
      <PageHeader title="Mis coincidencias" onBack={() => router.push('/home')} />
      <div className="segmented" style={{ marginBottom: 18 }}>
        <button className={tab === 'todos' ? 'active' : ''} onClick={() => setTab('todos')}>
          Todos
        </button>
        <button className={tab === 'conductor' ? 'active' : ''} onClick={() => setTab('conductor')}>
          Como conductor
        </button>
        <button className={tab === 'pasajero' ? 'active' : ''} onClick={() => setTab('pasajero')}>
          Como pasajero
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {showDriver &&
          driverSide.map(({ im, match }) => {
            const p = USERS[im.passengerId];
            return (
              <div key={im.id} className="card" style={{ background: im.status === 'new' ? 'var(--pine-tint)' : 'var(--paper-raised)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar user={p} size={44} />
                  <div style={{ flex: 1 }}>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                      Busca: {im.passengerTrip.origin.short} → {im.passengerTrip.destination.short} · {im.passengerTrip.time}
                    </div>
                  </div>
                  <div className="compat-num" style={{ fontSize: 18 }}>
                    {match.score}%
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 8 }}>
                  Tu trayecto: {MY_RECURRING_TRIP.origin.short} → {MY_RECURRING_TRIP.destination.short} · {MY_RECURRING_TRIP.depart}
                </div>
                <div className="chip" style={{ background: 'var(--sun-tint)', color: 'var(--sun-strong)', marginTop: 8, width: 'fit-content' }}>
                  {match.detourMinutes === 0 ? '✓ Sin desviación' : `+${match.detourMinutes} min desviación`}
                </div>
                {im.status === 'accepted' ? (
                  <div style={{ marginTop: 10, fontWeight: 700, color: 'var(--pine-strong)' }}>Ya habéis conectado</div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn btn-secondary btn-sm btn-auto">Ver perfil</button>
                    <button className="btn btn-primary btn-sm btn-auto" onClick={() => setIncomingMatchStatus(im.id, 'accepted')}>
                      Hablar
                    </button>
                    <button className="btn btn-ghost btn-sm btn-auto" style={{ color: 'var(--coral)' }} onClick={() => setIncomingMatchStatus(im.id, 'ignored')}>
                      Ignorar
                    </button>
                  </div>
                )}
              </div>
            );
          })}

        {showPassenger &&
          passengerSide.map(({ trip: t, match }) => {
            const d = USERS[t.driverId];
            return (
              <div key={t.id} className="card" style={{ cursor: 'pointer' }} onClick={() => router.push(`/trip/${t.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar user={d} size={44} />
                  <div style={{ flex: 1 }}>
                    <strong>{d.name}</strong>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                      {t.origin.short} → {t.destination.short} · {t.depart}
                    </div>
                  </div>
                  <div className="compat-num" style={{ fontSize: 18 }}>
                    {match.score}%
                  </div>
                </div>
                <div className="chip" style={{ background: 'var(--sun-tint)', color: 'var(--sun-strong)', marginTop: 8, width: 'fit-content' }}>
                  {match.detourMinutes === 0 ? '✓ Sin desviación' : `+${match.detourMinutes} min desviación`}
                </div>
                <button className="btn btn-secondary" style={{ marginTop: 10 }}>
                  Hablar
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
