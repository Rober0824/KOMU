'use client';
import Link from 'next/link';
import MapView from '@/components/MapView';
import { PLACES } from '@/lib/geo';

export default function LandingPage() {
  return (
    <div className="screen wide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0' }}>
        <div className="topnav-logo">
          <span className="dot" />
          Comunidad
        </div>
        <Link href="/join-community" className="btn btn-primary btn-auto btn-sm">
          Entrar en mi comunidad
        </Link>
      </div>
      <div className="hero-wrap">
        <div className="chip route" style={{ marginBottom: 16 }}>
          🏘️ Movilidad de comunidad
        </div>
        <h1>Comparte tus trayectos con gente de tu comunidad.</h1>
        <p className="lede">Menos coches, menos gastos y más conexiones. Encuentra personas que hacen tus mismos desplazamientos.</p>
        <div className="hero-cta-row">
          <Link href="/join-community" className="btn btn-primary">
            Entrar en mi comunidad
          </Link>
        </div>
      </div>
      <MapView
        height={150}
        routes={[
          { origin: PLACES.losolivos, destination: PLACES.madrid, primary: true },
          { origin: PLACES.alcobendas, destination: PLACES.chamartin, color: 'var(--sun)' },
        ]}
        pins={[
          { coord: PLACES.losolivos, label: 'Los Olivos' },
          { coord: PLACES.madrid, label: 'Madrid', color: 'var(--coral)' },
        ]}
      />
      <div className="feature-grid">
        <div className="feature-card">
          <span className="glyph">🏘️</span>
          <h3>Tu comunidad</h3>
          <p>Comparte coche con personas que conoces o puedes verificar.</p>
        </div>
        <div className="feature-card">
          <span className="glyph">🚗</span>
          <h3>Tus trayectos</h3>
          <p>Publica tus desplazamientos habituales en segundos.</p>
        </div>
        <div className="feature-card">
          <span className="glyph">🤝</span>
          <h3>Encuentra coincidencias</h3>
          <p>Te mostramos personas con rutas y horarios compatibles.</p>
        </div>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}
