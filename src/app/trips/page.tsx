'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state';
import { MY_RECURRING_TRIP } from '@/lib/mockData';
import { PageHeader } from '@/components/ui';

export default function TripsPage() {
  const router = useRouter();
  const { publishedTrips } = useApp();

  return (
    <div className="screen">
      <PageHeader title="Mis viajes" onBack={() => router.push('/home')} />
      <div className="section-title">Trayecto habitual</div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700 }}>
          {MY_RECURRING_TRIP.origin.short} → {MY_RECURRING_TRIP.destination.short}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>
          {MY_RECURRING_TRIP.recurrence} · {MY_RECURRING_TRIP.depart}
        </div>
      </div>

      {publishedTrips.length > 0 && (
        <>
          <div className="section-title">Publicados en esta sesión</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {publishedTrips.map((t) => (
              <div key={t.id} className="card">
                <div style={{ fontWeight: 700 }}>{t.time} · {t.seats} plazas</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{t.recurring ? 'Lunes a viernes' : 'Puntual'} · {t.distanceKm} km</div>
              </div>
            ))}
          </div>
        </>
      )}
      <p style={{ fontSize: 12.5, color: 'var(--ink-faint)', marginTop: 20, textAlign: 'center' }}>
        El historial completo y la gestión de solicitudes llegan en la próxima fase.
      </p>
    </div>
  );
}
