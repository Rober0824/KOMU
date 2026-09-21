'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state';
import { PLACES } from '@/lib/geo';
import { TRIPS, USERS } from '@/lib/mockData';
import { calculateMatch, matchLabel, Trip } from '@/lib/match';
import MapView from '@/components/MapView';
import { PageHeader, Avatar, Stars, VerifiedBadge, ScoreRing } from '@/components/ui';

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { search, community } = useApp();
  const [showBreakdown, setShowBreakdown] = useState(false);

  const t = TRIPS[id];
  if (!t) {
    return (
      <div className="screen">
        <PageHeader title="Trayecto no encontrado" onBack={() => router.push('/results')} />
      </div>
    );
  }
  const d = USERS[t.driverId];
  const origin = PLACES[search.originKey];
  const destination = PLACES[search.destinationKey];
  const passenger: Trip = { id: 'me', origin, destination, time: search.time, days: search.days, communityId: community?.id || 'olivos' };
  const m = calculateMatch(passenger, t);

  return (
    <div className="screen">
      <PageHeader title={`${t.origin.short} → ${t.destination.short}`} onBack={() => router.push('/results')} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, margin: '10px 0 18px' }}>
        <ScoreRing score={m.score} />
        <div style={{ fontWeight: 700, color: 'var(--pine-strong)' }}>{matchLabel(m.score)}</div>
      </div>

      <MapView
        height={190}
        routes={[
          { origin: passenger.origin, destination: passenger.destination, primary: true },
          { origin: t.origin, destination: t.destination, color: 'var(--sun)' },
        ]}
        meetingPoint={{ coord: m.suggestedMeetingPoint, label: m.suggestedMeetingPoint.name }}
        legend={[
          { label: 'Tú', color: 'var(--route)' },
          { label: d.name.split(' ')[0], color: 'var(--sun)' },
        ]}
      />

      <div className="card" style={{ marginTop: 14, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <Avatar user={d} size={52} />
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 16 }}>{d.name}</strong>
          <div style={{ fontSize: 13, marginTop: 2 }}>
            <Stars rating={d.rating} /> {d.rating} · {d.trips} viajes compartidos
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <VerifiedBadge />
          </div>
          {d.bio && <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: '10px 0 0', fontStyle: 'italic' }}>&quot;{d.bio}&quot;</p>}
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 20 }}>
        Vuestros trayectos
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="compare-trip-row" style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--paper-raised)', border: '1px solid var(--line)', borderRadius: 16, padding: '12px 14px' }}>
          <strong style={{ width: 44, flexShrink: 0 }}>Tú</strong>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>
              {passenger.origin.short} → {passenger.destination.short}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Sales a las {passenger.time}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--paper-raised)', border: '1px solid var(--line)', borderRadius: 16, padding: '12px 14px' }}>
          <strong style={{ width: 44, flexShrink: 0 }}>{d.name.split(' ')[0]}</strong>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>
              {t.origin.short} → {t.destination.short}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              Sale a las {t.depart} · {t.distanceKm} km · {t.durationMin} min estimados
            </div>
          </div>
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 20 }}>
        Encaja porque:
      </div>
      <div className="reason-list">
        {m.reasons.map((r, i) => (
          <div key={i}>✓ {r}</div>
        ))}
      </div>

      <div className="detour-pill">
        <span>{m.detourMinutes === 0 ? '✓ Sin desviación para recogerte' : `+${m.detourMinutes} min de desviación`}</span>
        <button
          style={{ background: 'none', border: 'none', color: 'var(--sun-strong)', fontWeight: 700, cursor: 'pointer', fontSize: 12.5 }}
          onClick={() => setShowBreakdown((v) => !v)}
        >
          {showBreakdown ? 'Ocultar' : '¿Por qué?'}
        </button>
      </div>

      {showBreakdown && (
        <div className="breakdown-table">
          <div className="breakdown-row">
            <span>Origen</span>
            <strong>{m.originScore}%</strong>
          </div>
          <div className="breakdown-row">
            <span>Destino</span>
            <strong>{m.destinationScore}%</strong>
          </div>
          <div className="breakdown-row">
            <span>Horario</span>
            <strong>{m.timeScore}%</strong>
          </div>
          <div className="breakdown-row">
            <span>Recurrencia</span>
            <strong>{m.recurrenceScore}%</strong>
          </div>
          <div className="breakdown-row">
            <span>Comunidad</span>
            <strong>{m.communityScore}%</strong>
          </div>
        </div>
      )}

      <div className="kv-grid" style={{ marginTop: 14 }}>
        <div className="kv">
          <div className="k">Salida</div>
          <div className="v">{t.depart}</div>
        </div>
        <div className="kv">
          <div className="k">Llegada estimada</div>
          <div className="v">{t.arrive}</div>
        </div>
        <div className="kv">
          <div className="k">Plazas</div>
          <div className="v">{t.seatsLeft}</div>
        </div>
        <div className="kv">
          <div className="k">Recurrencia</div>
          <div className="v" style={{ fontSize: 13 }}>
            {t.recurrence}
          </div>
        </div>
        <div className="kv" style={{ gridColumn: '1/-1' }}>
          <div className="k">Punto de encuentro sugerido</div>
          <div className="v" style={{ fontSize: 14 }}>📍 {m.suggestedMeetingPoint.name}</div>
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '10px 0 0' }}>El conductor y tú podréis acordar otro punto por chat.</p>

      <div className="disclaimer">Creo que podríais encajar — la decisión final es vuestra.</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        <button className="btn btn-primary" onClick={() => router.push(`/chat/${t.id}`)}>
          Hablar con {d.name.split(' ')[0]}
        </button>
        <button className="btn btn-secondary" onClick={() => router.push(`/chat/${t.id}?request=1`)}>
          Solicitar plaza
        </button>
      </div>
    </div>
  );
}
