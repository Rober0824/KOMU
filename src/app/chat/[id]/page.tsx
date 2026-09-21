'use client';
import { use, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/state';
import { PLACES } from '@/lib/geo';
import { TRIPS, USERS } from '@/lib/mockData';
import { calculateMatch, Trip } from '@/lib/match';
import MapView from '@/components/MapView';
import { PageHeader } from '@/components/ui';

type Msg = { from: 'rober' | 'them'; text: string; time: string };

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { search, community } = useApp();
  const t = TRIPS[id];
  const d = t ? USERS[t.driverId] : null;

  const [msgs, setMsgs] = useState<Msg[]>(() => {
    const seed: Msg[] = d ? [{ from: 'them', text: `¡Hola! Vi que también vas a ${t.destination.short} por las mañanas.`, time: '09:12' }] : [];
    if (searchParams.get('request') === '1') {
      seed.push({ from: 'rober', text: 'Hola, me gustaría solicitar una plaza en tu trayecto 🙂', time: '09:13' });
    }
    return seed;
  });
  const [input, setInput] = useState('');

  if (!t || !d) {
    return (
      <div className="screen">
        <PageHeader title="Conversación no encontrada" onBack={() => router.push('/results')} />
      </div>
    );
  }

  const origin = PLACES[search.originKey];
  const destination = PLACES[search.destinationKey];
  const passenger: Trip = { id: 'me', origin, destination, time: search.time, days: search.days, communityId: community?.id || 'olivos' };
  const m = calculateMatch(passenger, t);

  function send(text: string) {
    if (!text.trim()) return;
    setMsgs((prev) => [...prev, { from: 'rober', text, time: '09:16' }]);
    setInput('');
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 40px)' }}>
      <PageHeader title={d.name} sub={`${m.score}% compatible · ${t.origin.short} → ${t.destination.short} · Mañana ${t.depart}`} onBack={() => router.push(`/trip/${t.id}`)} />

      <MapView
        height={110}
        routes={[
          { origin: passenger.origin, destination: passenger.destination, primary: true },
          { origin: t.origin, destination: t.destination, color: 'var(--sun)' },
        ]}
        meetingPoint={{ coord: m.suggestedMeetingPoint, label: m.suggestedMeetingPoint.name }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 0 12px', flex: 1 }}>
        {msgs.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'rober' ? 'flex-end' : 'flex-start' }}>
            <div>
              <div
                style={{
                  maxWidth: '76%',
                  padding: '10px 14px',
                  borderRadius: 16,
                  fontSize: 14,
                  lineHeight: 1.35,
                  background: msg.from === 'rober' ? 'var(--pine)' : 'var(--paper-raised)',
                  color: msg.from === 'rober' ? '#fff' : 'var(--ink)',
                  border: msg.from === 'rober' ? 'none' : '1px solid var(--line)',
                }}
              >
                {msg.text}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 3, textAlign: 'right' }}>{msg.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '10px 0' }}>
        <button className="quick-reply" onClick={() => send('¿Te viene bien recogerme en la entrada?')}>
          ¿Te viene bien recogerme en la entrada?
        </button>
        <button className="quick-reply" onClick={() => send(`¿Podríamos salir a las ${t.depart}?`)}>
          ¿Podríamos salir a las {t.depart}?
        </button>
        <button className="quick-reply" onClick={() => send('¿Haces este trayecto todos los días?')}>
          ¿Haces este trayecto todos los días?
        </button>
      </div>

      <div style={{ position: 'sticky', bottom: 0, display: 'flex', gap: 8, padding: '12px 0', background: 'var(--paper)' }}>
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send(input);
          }}
          style={{ flex: 1, border: '1.5px solid var(--line)', borderRadius: 100, padding: '12px 16px', fontSize: 14.5, background: 'var(--paper-raised)', color: 'var(--ink)' }}
        />
        <button
          aria-label="Enviar"
          onClick={() => send(input)}
          style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--pine)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
