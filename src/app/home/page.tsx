'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useApp } from '@/lib/state';
import { MY_RECURRING_TRIP } from '@/lib/mockData';
import { resolvePlaceKey, PLACES } from '@/lib/geo';

export default function HomePage() {
  const router = useRouter();
  const { community, search, setSearch, incomingMatches } = useApp();
  const [destText, setDestText] = useState(PLACES[search.destinationKey]?.name || 'Madrid (Centro)');
  const newCount = incomingMatches.filter((m) => m.status === 'new').length;

  function goSearch() {
    const dk = resolvePlaceKey(destText);
    setSearch({ destinationKey: dk || search.destinationKey });
    router.push('/results');
  }

  if (!community) return null;

  return (
    <div className="screen">
      <div className="pageheader" style={{ position: 'static' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20 }}>Buenos días, Rober</h1>
          <div className="sub">🏘️ {community.name}</div>
        </div>
        <button className="bell-btn" aria-label="Notificaciones">
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 01-3.4 0" />
          </svg>
          <span className="dot" />
        </button>
      </div>

      <div className="card" style={{ marginTop: 6 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          ¿Adónde vas?
        </div>
        <div className="field field-icon-wrap">
          <label>Origen</label>
          <span className="fi">📍</span>
          <input type="text" value="Residencial Los Olivos" readOnly />
        </div>
        <div className="field field-icon-wrap">
          <label>Destino</label>
          <span className="fi">🎯</span>
          <input type="text" list="places-list" value={destText} onChange={(e) => setDestText(e.target.value)} />
          <datalist id="places-list">
            {Object.values(PLACES).map((p) => (
              <option key={p.key} value={p.name} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label>Cuándo</label>
          <input type="text" value="Hoy · 08:00" readOnly />
        </div>
        <button className="btn btn-primary" onClick={goSearch}>
          Buscar trayectos
        </button>
      </div>

      <div className="section-title" style={{ marginTop: 26 }}>
        Tus trayectos habituales
      </div>
      <Link href="/trips" className="trip-row" style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--paper-raised)', border: '1px solid var(--line)', borderRadius: 16, padding: '14px 16px', textDecoration: 'none', color: 'inherit' }}>
        <div className="icon-badge" style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--pine-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>
          🚗
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            {MY_RECURRING_TRIP.origin.short} → {MY_RECURRING_TRIP.destination.short}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>
            {MY_RECURRING_TRIP.recurrence} · {MY_RECURRING_TRIP.depart}
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="chip">{MY_RECURRING_TRIP.seats} plazas</span>
            <span className="status-dot green">{MY_RECURRING_TRIP.status}</span>
          </div>
        </div>
      </Link>

      <div className="section-title" style={{ marginTop: 26 }}>
        Mis coincidencias
      </div>
      <Link
        href="/matches"
        className="card"
        style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}
      >
        <div style={{ fontSize: 22 }}>🤝</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Ver mis coincidencias</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{newCount} nueva(s) coincidencia(s) esperando respuesta</div>
        </div>
        {newCount > 0 && <span className="chip" style={{ background: 'var(--coral-tint)', color: 'var(--coral)' }}>{newCount}</span>}
      </Link>

      <div className="section-title" style={{ marginTop: 26 }}>
        Actividad de tu comunidad
      </div>
      <div className="impact-strip" style={{ background: 'linear-gradient(135deg, var(--pine-tint) 0%, var(--route-tint) 100%)', borderRadius: 22, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--pine-strong)' }}>24</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>vecinos compartieron trayecto esta semana</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--pine-strong)' }}>86</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>viajes compartidos</div>
        </div>
      </div>
      <div style={{ height: 12 }} />
    </div>
  );
}
