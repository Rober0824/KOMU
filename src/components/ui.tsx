'use client';
import { UserProfile } from '@/lib/mockData';

export function Avatar({ user, size = 40 }: { user: UserProfile; size?: number }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: user.color, fontSize: Math.round(size * 0.36) }}
    >
      {user.initials}
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return <span className="stars">{'★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full)}</span>;
}

export function VerifiedBadge() {
  return (
    <span className="badge-verified">
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M10 1.5l2.4 1.4 2.7-.3 1 2.5 2.4 1.4-.7 2.6.7 2.6-2.4 1.4-1 2.5-2.7-.3L10 18.5l-2.4-1.4-2.7.3-1-2.5-2.4-1.4.7-2.6L1.5 8l2.4-1.4 1-2.5 2.7.3L10 1.5z" fill="var(--pine)" />
        <path d="M6.8 10.2l2.1 2.1 4.3-4.5" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Comunidad verificada
    </span>
  );
}

export function scoreColor(score: number) {
  if (score >= 90) return 'var(--pine)';
  if (score >= 75) return 'var(--pine-strong)';
  if (score >= 55) return 'var(--sun-strong)';
  return 'var(--coral)';
}

export function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={8} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={scoreColor(score)}
        strokeWidth={8}
        strokeDasharray={`${filled} ${c - filled}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="47%" textAnchor="middle" fontSize={size * 0.26} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-display)">
        {score}
      </text>
      <text x="50%" y="66%" textAnchor="middle" fontSize={size * 0.1} fill="var(--ink-soft)">
        % compatible
      </text>
    </svg>
  );
}

export function PageHeader({ title, sub, onBack, bell }: { title: string; sub?: string; onBack: () => void; bell?: boolean }) {
  return (
    <div className="pageheader bordered">
      <button className="back-btn" aria-label="Volver" onClick={onBack}>
        ←
      </button>
      <div>
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      <div className="pageheader-spacer" />
      {bell && (
        <button className="bell-btn" aria-label="Notificaciones">
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 01-3.4 0" />
          </svg>
          <span className="dot" />
        </button>
      )}
    </div>
  );
}
