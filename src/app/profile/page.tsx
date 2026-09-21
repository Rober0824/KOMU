'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state';
import { USERS } from '@/lib/mockData';
import { PageHeader, Avatar, Stars, VerifiedBadge } from '@/components/ui';

export default function ProfilePage() {
  const router = useRouter();
  const { community } = useApp();
  const u = USERS.rober;

  return (
    <div className="screen">
      <PageHeader title="Perfil" onBack={() => router.push('/home')} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 0 6px' }}>
        <Avatar user={u} size={76} />
        <h2 style={{ margin: '12px 0 2px', fontSize: 19 }}>{u.name}</h2>
        <VerifiedBadge />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{u.rating}</div>
            <Stars rating={u.rating} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{u.trips}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>viajes compartidos</div>
          </div>
        </div>
      </div>
      <div className="divider" />
      <div className="section-title">Mi comunidad</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0' }}>🏘️ {community?.name}</div>
    </div>
  );
}
