'use client';
import { useRouter } from 'next/navigation';
import { COMMUNITIES } from '@/lib/mockData';
import { useApp } from '@/lib/state';
import { PageHeader } from '@/components/ui';

export default function JoinCommunityPage() {
  const router = useRouter();
  const { setCommunity } = useApp();

  function pick(id: string) {
    const c = COMMUNITIES.find((c) => c.id === id) || COMMUNITIES[0];
    setCommunity(c);
    router.push('/onboarding');
  }

  return (
    <div className="screen">
      <PageHeader title="¿A qué comunidad perteneces?" onBack={() => router.push('/')} />
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: -6 }}>Elige tu comunidad para ver trayectos de gente cercana a ti.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        {COMMUNITIES.map((c) => (
          <div key={c.id} className="community-card" onClick={() => pick(c.id)}>
            <div className="glyph">{c.icon}</div>
            <div>
              <div className="type">{c.type}</div>
              <div className="name">{c.name}</div>
            </div>
            <div className="chev">›</div>
          </div>
        ))}
      </div>
    </div>
  );
}
