'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PLACES, resolvePlaceKey, calculateRoute } from '@/lib/geo';
import { useApp } from '@/lib/state';
import MapView from '@/components/MapView';
import { PageHeader } from '@/components/ui';

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function OnboardingPage() {
  const router = useRouter();
  const { setSearch } = useApp();
  const [modes, setModes] = useState<string[]>([]);
  const [originKey, setOriginKey] = useState('losolivos');
  const [destText, setDestText] = useState('Madrid (Centro)');
  const [destinationKey, setDestinationKey] = useState<string | null>('madrid');
  const [time, setTime] = useState('08:00');
  const [days, setDays] = useState<string[]>(['L', 'M', 'X', 'J', 'V']);

  function toggleMode(m: string) {
    setModes((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }
  function toggleDay(d: string) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }
  function onDestChange(v: string) {
    setDestText(v);
    setDestinationKey(resolvePlaceKey(v));
  }
  function finish() {
    setSearch({ originKey, destinationKey: destinationKey || 'madrid', time, days });
    router.push('/home');
  }

  const origin = PLACES[originKey];
  const destination = destinationKey ? PLACES[destinationKey] : null;
  const route = destination ? calculateRoute(origin, destination, time) : null;

  return (
    <div className="screen">
      <PageHeader title="¿Cómo te desplazas normalmente?" onBack={() => router.push('/join-community')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
        <div className={`big-choice ${modes.includes('conduzco') ? 'selected' : ''}`} onClick={() => toggleMode('conduzco')}>
          <div className="glyph">🚗</div>
          <h3>Conduzco</h3>
          <p>Tengo coche y puedo llevar a otras personas.</p>
        </div>
        <div className={`big-choice ${modes.includes('busco') ? 'selected' : ''}`} onClick={() => toggleMode('busco')}>
          <div className="glyph">🙋</div>
          <h3>Busco plaza</h3>
          <p>Me interesa viajar con alguien.</p>
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 26 }}>
        ¿Qué trayectos haces habitualmente?
      </div>
      <div className="field field-icon-wrap">
        <label>Desde</label>
        <span className="fi">📍</span>
        <input list="places-list" value={PLACES[originKey].name} onChange={(e) => setOriginKey(resolvePlaceKey(e.target.value) || originKey)} />
      </div>
      <div className="field field-icon-wrap">
        <label>Hasta</label>
        <span className="fi">🎯</span>
        <input list="places-list" value={destText} onChange={(e) => onDestChange(e.target.value)} placeholder="Ej. Madrid" />
      </div>
      <datalist id="places-list">
        {Object.values(PLACES).map((p) => (
          <option key={p.key} value={p.name} />
        ))}
      </datalist>

      {destination && route && (
        <>
          <MapView height={150} routes={[{ origin, destination, primary: true }]} pins={[{ coord: origin, label: origin.short }, { coord: destination, label: destination.short, color: 'var(--coral)' }]} />
          <div className="chip route" style={{ margin: '10px 0 16px' }}>
            {route.distanceKm} km · {route.durationMin} min estimados
          </div>
        </>
      )}

      <div className="field">
        <label>Hora habitual</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <div className="field">
        <label>Días</label>
        <div className="daychip-row">
          {DAYS.map((d) => (
            <div key={d} className={`daychip ${days.includes(d) ? 'selected' : ''}`} onClick={() => toggleDay(d)}>
              {d}
            </div>
          ))}
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={finish}>
        Encontrar compañeros
      </button>
    </div>
  );
}
