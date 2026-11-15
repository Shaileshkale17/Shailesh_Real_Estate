import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { filterProperties } from '@shared/filter.js';
import PropertyCard from '../components/PropertyCard.jsx';
import { Icon, PageHeader, Status } from '../components/ui.jsx';
import { useFetch } from '../lib/useFetch.js';
import { setMeta } from '../lib/seo.js';

const CHIPS = ['All', 'Residential', 'Commercial', 'Apartment', 'Villa', 'House', 'Plot'];
const TYPES = ['All', 'Apartment', 'Villa', 'House', 'Plot', 'Commercial', 'Other'];
const FURNISHING = ['Any', 'Furnished', 'Semi-furnished', 'Unfurnished', 'Bare shell', 'n/a'];
const BEDS = ['Any', '1+', '2+', '3+', '4+'];
const PAGE_SIZE = 9;
const isAll = (v) => !v || v === 'All' || v === 'Any' || v === '';

const num = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

/** Extended, client-side refinement on top of the shared q/category/type/sort filter. */
function refine(list, { min, max, beds, baths, areaMin, furnishing }) {
  const bedMin = isAll(beds) ? undefined : parseInt(beds, 10);
  const bathMin = isAll(baths) ? undefined : parseInt(baths, 10);
  const area = num(areaMin);
  return list.filter((p) => {
    if (num(min) !== undefined && p.price < num(min)) return false;
    if (num(max) !== undefined && p.price > num(max)) return false;
    if (bedMin !== undefined && (p.bedrooms || 0) < bedMin) return false;
    if (bathMin !== undefined && (p.bathrooms || 0) < bathMin) return false;
    if (area !== undefined && (p.area || 0) < area) return false;
    if (!isAll(furnishing) && String(p.furnishing ?? '') !== furnishing) return false;
    return true;
  });
}

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '', category = params.get('category') || 'All', type = params.get('type') || 'All', sort = params.get('sort') || 'price-asc';
  const featured = params.get('featured') === 'true';
  const [min, setMin] = useState(params.get('min') || '');
  const [max, setMax] = useState(params.get('max') || '');
  const [beds, setBeds] = useState(params.get('beds') || 'Any');
  const [baths, setBaths] = useState(params.get('baths') || 'Any');
  const [areaMin, setAreaMin] = useState(params.get('areaMin') || '');
  const [furnishing, setFurnishing] = useState(params.get('furnishing') || 'Any');
  const [view, setView] = useState('grid');
  const [shown, setShown] = useState(PAGE_SIZE);

  const set = (k, v) => setParams((p) => { const n = new URLSearchParams(p); v && v !== 'All' && !(k !== 'category' && v === 'Any') ? n.set(k, v) : n.delete(k); return n; }, { replace: true });
  const advanced = { min, max, beds, baths, areaMin, furnishing };
  const hasAdvanced = [min, max, beds, baths, areaMin, furnishing].some((v) => !isAll(v));
  const clearAdvanced = () => {
    setMin(''); setMax(''); setBeds('Any'); setBaths('Any'); setAreaMin(''); setFurnishing('Any');
    setParams((p) => { const n = new URLSearchParams(p); ['min', 'max', 'beds', 'baths', 'areaMin', 'furnishing'].forEach((k) => n.delete(k)); return n; }, { replace: true });
  };

  const { data, error, loading, retry } = useFetch('/properties');
  const list = useMemo(() => (data
    ? refine(filterProperties(data, { q, category, type, sort, featured }), advanced)
    : []), [data, q, category, type, sort, featured, min, max, beds, baths, areaMin, furnishing]);

  useEffect(() => { setShown(PAGE_SIZE); }, [q, category, type, sort, featured, min, max, beds, baths, areaMin, furnishing]);
  useEffect(() => setMeta('Properties . Shailesh.dev', 'Browse verified homes, plots and commercial spaces across Nagpur with video walkthroughs.'), []);

  const visible = list.slice(0, shown);
  const activeExtras = [
    featured && ['Featured', 'only', () => set('featured', '')],
    q && ['Search', q, (v) => set('q', '')],
    min && ['Min price', min, () => setMin('')],
    max && ['Max price', max, () => setMax('')],
    !isAll(beds) && ['Bedrooms', beds, () => setBeds('Any')],
    !isAll(baths) && ['Bathrooms', baths, () => setBaths('Any')],
    areaMin && ['Min area', `${areaMin} sq ft`, () => setAreaMin('')],
    !isAll(furnishing) && ['Furnishing', furnishing, () => setFurnishing('Any')],
  ].filter(Boolean);

  return (
    <>
      <PageHeader title="Properties">Browse homes, land and commercial spaces across Nagpur.</PageHeader>
      <section className="container section">
        <div className="filter-panel">
          <div className="filters">
            <div className="search-wrap">
              <Icon name="pin" size={18} />
              <input type="search" placeholder="Search by name, city or address" aria-label="Search properties" value={q} onChange={(e) => set('q', e.target.value)} />
            </div>
            <select aria-label="Property type" value={type} onChange={(e) => set('type', e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t === 'All' ? 'All types' : t}</option>)}
            </select>
            <select aria-label="Sort by" value={sort} onChange={(e) => set('sort', e.target.value)}>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="newest">Newest first</option>
            </select>
          </div>
          <div className="chips" role="group" aria-label="Category">
            {CHIPS.map((c) => <button key={c} className={`chip ${category === c ? 'on' : ''}`} aria-pressed={category === c} onClick={() => set('category', c)}>{c}</button>)}
          </div>
          <details className="more-filters" open={hasAdvanced}>
            <summary><Icon name="filter" size={16} /> More filters{hasAdvanced ? ' · active' : ''}</summary>
            <div className="more-filters-grid">
              <div className="field"><label htmlFor="f-min">Min price (₹)</label><input id="f-min" type="number" min="0" placeholder="e.g. 5000000" value={min} onChange={(e) => setMin(e.target.value)} /></div>
              <div className="field"><label htmlFor="f-max">Max price (₹)</label><input id="f-max" type="number" min="0" placeholder="e.g. 30000000" value={max} onChange={(e) => setMax(e.target.value)} /></div>
              <div className="field"><label htmlFor="f-beds">Bedrooms</label><select id="f-beds" value={beds} onChange={(e) => setBeds(e.target.value)}>{BEDS.map((b) => <option key={b}>{b}</option>)}</select></div>
              <div className="field"><label htmlFor="f-baths">Bathrooms</label><select id="f-baths" value={baths} onChange={(e) => setBaths(e.target.value)}>{BEDS.map((b) => <option key={b}>{b}</option>)}</select></div>
              <div className="field"><label htmlFor="f-area">Min area (sq ft)</label><input id="f-area" type="number" min="0" placeholder="e.g. 1200" value={areaMin} onChange={(e) => setAreaMin(e.target.value)} /></div>
              <div className="field"><label htmlFor="f-furn">Furnishing</label><select id="f-furn" value={furnishing} onChange={(e) => setFurnishing(e.target.value)}>{FURNISHING.map((f) => <option key={f}>{f}</option>)}</select></div>
            </div>
          </details>
        </div>

        <div className="results-head">
          <p className="muted" aria-live="polite">{!loading && !error && `${list.length} ${list.length === 1 ? 'property' : 'properties'} found`}</p>
          <div className="results-tools">
            <div className="view-toggle" role="group" aria-label="View mode">
              <button className={view === 'grid' ? 'on' : ''} aria-pressed={view === 'grid'} aria-label="Grid view" onClick={() => setView('grid')}><Icon name="grid" size={18} /></button>
              <button className={view === 'list' ? 'on' : ''} aria-pressed={view === 'list'} aria-label="List view" onClick={() => setView('list')}><Icon name="list" size={18} /></button>
            </div>
            <span className="results-note">Nagpur, Maharashtra</span>
          </div>
        </div>

        {activeExtras.length > 0 && (
          <div className="active-filters" aria-label="Active filters">
            {activeExtras.map(([label, value, remove]) => (
              <span className="active-chip" key={label}>{label}: <b>{value}</b>
                <button aria-label={`Remove ${label} filter`} onClick={remove}><Icon name="close" size={13} /></button>
              </span>
            ))}
            <button className="chip clear" onClick={clearAdvanced}>Clear filters</button>
          </div>
        )}

        <Status loading={loading} error={error} retry={retry} empty={!loading && !error && list.length === 0 && 'No properties match your filters. Try clearing the search or choosing All.'}>
          <div className={`grid ${view === 'list' ? 'list-view' : ''}`}>
            {visible.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(i, 5) * 0.05 }}>
                <PropertyCard property={p} />
              </motion.div>
            ))}
          </div>
          {list.length > shown && (
            <p className="center">
              <button className="btn btn-dark" onClick={() => setShown((s) => s + PAGE_SIZE)}>
                Load more ({list.length - shown} remaining) <Icon name="arrow" size={18} />
              </button>
            </p>
          )}
        </Status>
      </section>
    </>
  );
}
