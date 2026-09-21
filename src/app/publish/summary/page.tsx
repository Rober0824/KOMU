'use client';
import { useRouter } from 'next/navigation';
import { PLACES, calculateRoute } from '@/lib/geo';
import { useApp } from '@/lib/state';
import MapView from '@/components/MapView';
import { PageHeader } from '@/components/ui';

export default function PublishSummaryPage() {
  const router = useRouter();
  const { publishDraft, addPublishedTrip } = useApp();
  const origin = PLACES[publishDraft.originKey];
  const destination = PLACES[publishDraft.destinationKey];
  const route = calculateRoute(origin, destination, publishDraft.time);

  function publish() {
    addPublishedTrip({ ...publishDraft, id: `pub-${Date.now()}`, distanceKm: route.distanceKm, durationMin: route.durationMin, arrive: route.arrivalTime });
    router.push('/publish/confirm');
  }

  return (
    <div className="screen">
      <PageHeader title="Tu trayecto" onBack={() => router.push('/publish')} />
      <MapView height={170} routes={[{ origin, destination, primary: true }]} pins={[{ coord: origin, label: origin.short }, { coord: destination, label: destination.short, color: 'var(--coral)' }]} />
      <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 17 }}>{origin.name}</div>
        <div style={{ margin: '4px 0' }}>↓</div>
        <div style={{ fontWeight: 700, fontSize: 17 }}>{destination.name}</div>
      </div>
      <div className="kv-grid" style={{ marginTop: 14 }}>
        <div className="kv">
          <div className="k">Salida</div>
          <div className="v">Mañana · {publishDraft.time}</div>
        </div>
        <div className="kv">
          <div className="k">Llegada estimada</div>
          <div className="v">{route.arrivalTime}</div>
        </div>
        <div className="kv">
          <div className="k">Distancia</div>
          <div className="v">{route.distanceKm} km</div>
        </div>
        <div className="kv">
          <div className="k">Duración estimada</div>
          <div className="v">{route.durationMin} min</div>
        </div>
        <div className="kv">
          <div className="k">Plazas</div>
          <div className="v">{publishDraft.seats}</div>
        </div>
        <div className="kv">
          <div className="k">Recurrencia</div>
          <div className="v" style={{ fontSize: 13 }}>
            {publishDraft.recurring ? 'Lunes a viernes' : 'Puntual'}
          </div>
        </div>
      </div>
      <button className="btn btn-sun" style={{ marginTop: 18 }} onClick={publish}>
        Publicar trayecto
      </button>
    </div>
  );
}
