'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PLACES, resolvePlaceKey, calculateRoute } from '@/lib/geo';
import { useApp } from '@/lib/state';
import MapView from '@/components/MapView';
import { PageHeader } from '@/components/ui';

const DAYS = ['L', 'M', 'X', 'J', 'V'];

export default function PublishPage() {
  const router = useRouter();
  const { publishDraft, setPublishDraft } = useApp();
  const [destText, setDestText] = useState(PLACES[publishDraft.destinationKey]?.name || 'Madrid (Centro)');
  const [time, setTime] = useState(publishDraft.time);
  const [seats, setSeats] = useState(publishDraft.seats);
  const [recurring, setRecurring] = useState(publishDraft.recurring);
  const [days, setDays] = useState(publishDraft.days);
  const [costShare, setCostShare] = useState(publishDraft.costShare);

  const originKey = publishDraft.originKey;
  const origin = PLACES[originKey];
  const destinationKey = resolvePlaceKey(destText);
  const destination = destinationKey ? PLACES[destinationKey] : null;
  const route = destination ? calculateRoute(origin, destination, time) : null;

  function toggleDay(d: string) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function goSummary() {
    setPublishDraft({ destinationKey: destinationKey || publishDraft.destinationKey, time, seats, recurring, days, costShare });
    router.push('/publish/summary');
  }

  return (
    <div className="screen">
      <PageHeader title="¿Adónde vas?" onBack={() => router.push('/home')} />

      <div className="field field-icon-wrap">
        <label>Origen</label>
        <span className="fi">📍</span>
        <input type="text" value={origin.name} readOnly />
      </div>
      <div className="field field-icon-wrap">
        <label>Destino</label>
        <span className="fi">🎯</span>
        <input list="places-list" value={destText} onChange={(e) => setDestText(e.target.value)} placeholder="Introduce tu destino" />
        <datalist id="places-list">
          {Object.values(PLACES).map((p) => (
            <option key={p.key} value={p.name} />
          ))}
        </datalist>
      </div>

      {destination && route && (
        <>
          <MapView height={150} routes={[{ origin, destination, primary: true }]} pins={[{ coord: origin, label: origin.short }, { coord: destination, label: destination.short, color: 'var(--coral)' }]} />
          <div className="chip route" style={{ margin: '10px 0 16px' }}>
            {route.distanceKm} km · {route.durationMin} min estimados
          </div>
        </>
      )}

      <div className="field">
        <label>Hora de salida</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <div className="field">
        <label>¿Haces este trayecto habitualmente?</label>
        <div className="segmented" style={{ maxWidth: 180 }}>
          <button className={recurring ? 'active' : ''} onClick={() => setRecurring(true)}>
            Sí
          </button>
          <button className={!recurring ? 'active' : ''} onClick={() => setRecurring(false)}>
            No
          </button>
        </div>
      </div>
      {recurring && (
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
      )}

      <div className="field">
        <label>¿Cuántas plazas tienes?</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="back-btn" aria-label="menos" onClick={() => setSeats((s) => Math.max(1, s - 1))}>
            −
          </button>
          <strong style={{ fontSize: 17, minWidth: 20, textAlign: 'center' }}>{seats}</strong>
          <button className="back-btn" aria-label="más" onClick={() => setSeats((s) => Math.min(6, s + 1))}>
            +
          </button>
        </div>
      </div>

      <div className="field">
        <label>¿Quieres compartir gastos?</label>
        <div className="segmented" style={{ maxWidth: 180 }}>
          <button className={costShare ? 'active' : ''} onClick={() => setCostShare(true)}>
            Sí
          </button>
          <button className={!costShare ? 'active' : ''} onClick={() => setCostShare(false)}>
            No
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 8 }}>La implementación económica real se hará en una fase posterior.</p>
      </div>

      <button className="btn btn-primary" disabled={!destination} onClick={goSummary}>
        Continuar
      </button>
    </div>
  );
}
