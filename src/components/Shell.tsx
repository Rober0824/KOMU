'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/state';
import { USERS } from '@/lib/mockData';

const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx={11} cy={11} r={7} />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  trips: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 13l2-6h14l2 6" />
      <rect x={3} y={13} width={18} height={6} rx={2} />
      <circle cx={7.5} cy={19} r={1.4} fill="currentColor" />
      <circle cx={16.5} cy={19} r={1.4} fill="currentColor" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx={12} cy={8} r={4} />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
};

const BARE_ROUTES = ['/', '/join-community', '/onboarding', '/how-it-works'];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { community } = useApp();
  const bare = BARE_ROUTES.includes(pathname);
  const u = USERS.rober;

  return (
    <div id="app-shell">
      {!bare && (
        <nav className="desktop-topnav">
          <div className="topnav-left">
            <div className="topnav-logo">
              <span className="dot" />
              Comunidad
            </div>
            <div className="topnav-links">
              <NavLink href="/home" label="Inicio" active={pathname === '/home'} />
              <NavLink href="/search" label="Buscar trayecto" active={pathname === '/search' || pathname === '/results'} />
              <NavLink href="/publish" label="Publicar" active={pathname.startsWith('/publish')} />
              <NavLink href="/trips" label="Mis viajes" active={pathname === '/trips'} />
              <NavLink href="/matches" label="Coincidencias" active={pathname === '/matches'} />
            </div>
          </div>
          <div className="topnav-right">
            {community && <div className="topnav-community">🏘️ {community.name}</div>}
            <Link href="/profile" style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} aria-label="Perfil">
              <div className="topnav-avatar" style={{ background: u.color }}>
                {u.initials}
              </div>
            </Link>
          </div>
        </nav>
      )}
      <div className="app-frame">
        <div id="app-content">{children}</div>
        {!bare && (
          <nav className="mobile-tabbar">
            <TabLink href="/home" icon={ICONS.home} label="Inicio" active={pathname === '/home'} />
            <TabLink href="/search" icon={ICONS.search} label="Buscar" active={pathname === '/search' || pathname === '/results'} />
            <Link href="/publish" className="tab-btn publish">
              <div className="tab-publish-circle">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.4} strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span>Publicar</span>
            </Link>
            <TabLink href="/trips" icon={ICONS.trips} label="Viajes" active={pathname === '/trips'} />
            <TabLink href="/profile" icon={ICONS.profile} label="Perfil" active={pathname === '/profile'} />
          </nav>
        )}
      </div>
    </div>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`topnav-link ${active ? 'active' : ''}`}>
      {label}
    </Link>
  );
}

function TabLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className={`tab-btn ${active ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}
