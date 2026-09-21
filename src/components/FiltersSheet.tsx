'use client';
import { useState } from 'react';
import { Filters } from '@/lib/state';

export default function FiltersSheet({
  filters,
  onApply,
  onClose,
}: {
  filters: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Filters>(filters);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,14,10,0.45)', zIndex: 150, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{ background: 'var(--paper-raised)', borderRadius: '22px 22px 0 0', padding: '22px 20px 30px', width: '100%', maxWidth: 480 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 18 }}>Filtros</h3>

        <div className="filter-group">
          <label className="filters-label">Compatibilidad</label>
          <div className="filter-pill-row">
            {[{ v: 0, l: 'Todas' }, { v: 70, l: '70%+' }, { v: 80, l: '80%+' }, { v: 90, l: '90%+' }].map((o) => (
              <FilterPill key={o.v} label={o.l} active={draft.minScore === o.v} onClick={() => setDraft((d) => ({ ...d, minScore: o.v }))} />
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filters-label">Horario</label>
          <div className="filter-pill-row">
            {[{ v: 999, l: 'Cualquiera' }, { v: 15, l: '±15 min' }, { v: 30, l: '±30 min' }, { v: 60, l: '±60 min' }].map((o) => (
              <FilterPill key={o.v} label={o.l} active={draft.timeFlexMin === o.v} onClick={() => setDraft((d) => ({ ...d, timeFlexMin: o.v }))} />
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filters-label">Desviación del conductor</label>
          <div className="filter-pill-row">
            {[{ v: 999, l: 'Cualquiera' }, { v: 5, l: '0–5 min' }, { v: 10, l: '5–10 min' }, { v: 15, l: '10–15 min' }].map((o) => (
              <FilterPill key={o.v} label={o.l} active={draft.maxDetour === o.v} onClick={() => setDraft((d) => ({ ...d, maxDetour: o.v }))} />
            ))}
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => onApply(draft)}>
          Ver resultados
        </button>
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`filter-pill ${active ? 'active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
}
