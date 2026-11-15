import { useCallback, useMemo, useState } from 'react';
import { Img, LightboxHost, PageHeader, Status } from '../components/ui.jsx';
import { useFetch } from '../lib/useFetch.js';

export default function Gallery() {
  const { data, error, loading, retry } = useFetch('/gallery');
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(null);
  const names = useMemo(() => ['All', ...new Set((data || []).map((i) => i.propertyName))], [data]);
  const items = useMemo(() => (data || []).filter((i) => filter === 'All' || i.propertyName === filter), [data, filter]);
  const close = useCallback(() => setOpen(null), []);
  const move = useCallback((d) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);
  return (
    <>
      <PageHeader title="Gallery">Photos and walkthrough videos from our listings.</PageHeader>
      <section className="container section">
        <div className="gallery-bar">
          <div className="chips" role="group" aria-label="Filter by property">
            {names.map((n) => <button key={n} className={`chip ${filter === n ? 'on' : ''}`} aria-pressed={filter === n} onClick={() => setFilter(n)}>{n}</button>)}
          </div>
          {!loading && !error && <span className="results-note">Showing {items.length} {items.length === 1 ? 'image' : 'images'}</span>}
        </div>
        <Status loading={loading} error={error} retry={retry} empty={!loading && !error && items.length === 0 && 'No media for this property yet.'}>
          <div className="masonry">
            {items.map((it, i) => (
              <button key={it.id} className="tile" onClick={() => setOpen(i)} aria-label={`Open ${it.type} of ${it.propertyName}`}>
                <Img src={it.type === 'video' ? it.poster : it.src} alt="" style={{ aspectRatio: i % 3 === 0 ? '4/5' : i % 3 === 1 ? '4/3' : '1/1' }} />
                {it.type === 'video' && <span className="play sm" aria-hidden="true">▶</span>}
                <span className="tile-cap">{it.propertyName}</span>
              </button>
            ))}
          </div>
        </Status>
      </section>
      <LightboxHost items={items} index={open} onClose={close} onMove={move} />
    </>
  );
}
