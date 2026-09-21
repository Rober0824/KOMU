'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PLACES, resolvePlaceKey, calculateRoute } from '@/lib/geo';
import { useApp } from '@/lib/state';
import MapView from '@/components/MapView';
import { PageHeader } from '@/components/ui';

export default function SearchPage() {
  const router = useRouter();
  const { search, setSearch, setFilters } = useApp();
  const [originText, setOriginText] = useState(PLACES[search.originKey]?.name || 'Residencial Los Olivos');
  const [destText, setDestText] = useState(PLACES[search.destinationKey]?.name || 'Madrid (Centro)');
  const [time, setTime] = useState(search.time);
  const [flexMin, setFlexMin] = useState(search.flexMin);

  const originKey = resolvePlaceKey(originText) || search.originKey;
  const destinationKey = resolvePlaceKey(destText);
  const origin = PLACES[originKey];
  const destination = destinationKey ? PLACES[destinationKey] : null;
  const route = destination ? calculateRoute(origin, destination, time) : null;

  function runSearch() {
    setSearch({ originKey, destinationKey: destinationKey || search.destinationKey, time });
    setFilters({ timeFlexMin: flexMin });
    router.push('/results');
  }

  return (
    <div className="screen">
      <PageHeader title="¿A dónde necesitas ir?" onBack={() => router.push('/home')} />
      <div className="field field-icon-wrap">
        <label>Origen</label>
        <span className="fi">📍</span>
        <input list="places-list" value={originText} onChange={(e) => setOriginText(e.target.value)} />
      </div>
      <div className="field field-icon-wrap">
        <label>Destino</label>
        <span className="fi">🎯</span>
        <input list="places-list" value={destText} onChange={(e) => setDestText(e.target.value)} placeholder="Ej. Madrid" />
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field">
          <label>Fecha</label>
          <input type="text" defaultValue="Mañana" />
        </div>
        <div className="field">
          <label>Hora deseada</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Flexibilidad</label>
        <select value={flexMin} onChange={(e) => setFlexMin(parseInt(e.target.value, 10))}>
          <option value={15}>±15 min</option>
          <option value={30}>±30 min</option>
          <option value={60}>±60 min</option>
        </select>
      </div>
      <button className="btn btn-primary" onClick={runSearch}>
        Buscar coincidencias
      </button>
    </div>
  );
}
