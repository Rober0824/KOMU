'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state';
import { PLACES } from '@/lib/geo';

export default function PublishConfirmPage() {
  const router = useRouter();
  const { publishDraft, addIncomingMatch, incomingMatches } = useApp();
  const alreadySimulated = incomingMatches.some((m) => m.tripId === 'pub-demo');

  function simulate() {
    addIncomingMatch({
      id: `im-${Date.now()}`,
      passengerId: 'ana',
      tripId: 'pub-demo',
      passengerTrip: { id: 'ana-trip-2', origin: PLACES.losolivos, destination: PLACES[publishDraft.destinationKey], time: publishDraft.time, days: publishDraft.days, communityId: 'olivos' },
      status: 'new',
    });
    router.push('/matches');
  }

  return (
    <div className="screen" style={{ textAlign: 'center', paddingTop: 30 }}>
      <div style={{ fontSize: 44 }}>✓</div>
      <h1 style={{ fontSize: 24, margin: '12px 0 6px' }}>Trayecto publicado</h1>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, maxWidth: 340, margin: '0 auto 22px' }}>Te avisaremos cuando encontremos personas compatibles.</p>
      <div className="card" style={{ display: 'inline-flex', gap: 18, padding: '16px 22px', margin: '0 auto' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{publishDraft.seats}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>plazas</div>
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>{publishDraft.time}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>salida</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 280, margin: '26px auto 0' }}>
        <button className="btn btn-primary" onClick={() => router.push('/trips')}>
          Ver trayecto
        </button>
        <button className="btn btn-secondary" onClick={() => router.push('/home')}>
          Volver a inicio
        </button>
        {!alreadySimulated && (
          <button className="btn btn-ghost" onClick={simulate}>
            Simular solicitud de pasajero (demo)
          </button>
        )}
      </div>
    </div>
  );
}
